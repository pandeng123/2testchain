const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const { cryptoWaitReady } = require('@polkadot/util-crypto');

// 测试配置
const CONFIG = {
    wsEndpoint: 'ws://127.0.0.1:9944',
    senderSeed: '//Alice', // 发送者种子短语
    recipientAddress: '5HGjWAeFDfFCWPsjFQdVV2Msvz2XtMktvgocEZcCj68kUMaw', // 接收者地址
    testDurationSeconds: 10, // 测试持续时间（秒）
    txPerSecond: 200, // 每秒发送的交易数
    transferAmount: '0.01', // 每笔转账金额
};

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 发送一秒的交易，不等待确认
async function sendTransactionsInTimeSlot(api, sender, startNonce, count, amount, decimals) {
    const startTime = Date.now();
    const rawAmount = api.createType('Balance', BigInt(Math.floor(parseFloat(amount) * (10 ** decimals))).toString());
    const txHashes = new Array(count); // 预分配数组大小

    // 并行发送交易
    const promises = Array.from({ length: count }, async (_, i) => {
        try {
            const tx = api.tx.balances.transferKeepAlive(
                CONFIG.recipientAddress,
                rawAmount
            );

            // 使用 signAsync 立即获取签名后的交易
            const signed = await tx.signAsync(sender, { nonce: startNonce + i });
            
            // 获取hash并发送交易，使用submitExtrinsic而不是send来避免创建订阅
            const hash = signed.hash.toHex();
            await api.rpc.author.submitExtrinsic(signed.toHex());

            txHashes[i] = {
                hash: hash,
                nonce: startNonce + i,
                timestamp: Date.now()
            };
        } catch (error) {
            console.error(`发送交易失败 (nonce: ${startNonce + i}):`, error.message);
        }
    });

    // 等待所有交易发送完成
    await Promise.all(promises);

    // 确保每秒的发送时间
    const elapsed = Date.now() - startTime;
    if (elapsed < 1000) {
        await sleep(1000 - elapsed);
    }

    return txHashes.filter(Boolean); // 过滤掉发送失败的交易
}

// 监控交易状态
function monitorTransactions(api, txHashes) {
    return new Promise((resolve) => {
        const results = {
            successful: new Set(),
            failed: new Set()
        };

        // 创建交易哈希映射，用于快速查找
        const pendingTxs = new Map(txHashes.map(tx => [tx.hash, tx]));
        let startBlockNumber = 0;

        // 使用区块订阅来监控交易
        let unsubscribe;
        api.rpc.chain.subscribeNewHeads(async (header) => {
            try {
                const currentBlockNumber = header.number.toNumber();
                
                // 设置初始区块号
                if (startBlockNumber === 0) {
                    startBlockNumber = currentBlockNumber - 5; // 从当前区块往前5个区块开始查找
                }

                // 处理从起始区块到当前区块的所有区块
                for (let blockNumber = startBlockNumber; blockNumber <= currentBlockNumber; blockNumber++) {
                    const blockHash = await api.rpc.chain.getBlockHash(blockNumber);
                    await processBlock(api, blockHash, blockNumber, pendingTxs, results);
                }

                // 更新起始区块号
                startBlockNumber = currentBlockNumber + 1;

                // 打印详细进度
                const totalConfirmed = results.successful.size + results.failed.size;
                const pendingCount = pendingTxs.size;
                console.log(`区块 ${currentBlockNumber}: 已确认 ${totalConfirmed}/${txHashes.length} ` +
                    `(成功: ${results.successful.size}, 失败: ${results.failed.size}, 待确认: ${pendingCount})`);

                // 如果所有交易都已确认，结束监控
                if (pendingCount === 0) {
                    if (unsubscribe) {
                        unsubscribe();
                    }
                    resolve(results);
                }
            } catch (error) {
                console.error('处理区块出错:', error);
            }
        }).then(unsub => {
            unsubscribe = unsub;
            // 设置超时
            setTimeout(() => {
                console.log('\n监控超时，返回当前结果');
                console.log('未确认交易数:', pendingTxs.size);
                if (pendingTxs.size > 0) {
                    console.log('部分未确认交易哈希:', Array.from(pendingTxs.keys()).slice(0, 5));
                }
                unsubscribe();
                resolve(results);
            }, 180000); // 3分钟超时
        });
    });
}

// 处理单个区块
async function processBlock(api, blockHash, blockNumber, pendingTxs, results) {
    try {
        const signedBlock = await api.rpc.chain.getBlock(blockHash);
        const allRecords = await api.query.system.events.at(blockHash);
        const blockEvents = new Map();

        // 首先整理所有事件
        allRecords.forEach(({ phase, event }) => {
            if (phase.isApplyExtrinsic) {
                const idx = phase.asApplyExtrinsic.toNumber();
                if (!blockEvents.has(idx)) {
                    blockEvents.set(idx, []);
                }
                blockEvents.get(idx).push(event);
            }
        });

        // 处理区块中的所有交易
        for (const [index, ext] of signedBlock.block.extrinsics.entries()) {
            const txHash = ext.hash.toHex();
            
            // 检查是否是我们发送的交易
            if (pendingTxs.has(txHash)) {
                const events = blockEvents.get(index) || [];
                let isSuccess = true;

                for (const event of events) {
                    if (api.events.system.ExtrinsicFailed.is(event)) {
                        isSuccess = false;
                        results.failed.add(txHash);
                        break;
                    }
                }

                if (isSuccess) {
                    results.successful.add(txHash);
                }

                // 从待处理集合中移除已确认的交易
                pendingTxs.delete(txHash);
            }
        }
    } catch (error) {
        console.error(`处理区块 ${blockNumber} 出错:`, error);
    }
}

async function main() {
    try {
        await cryptoWaitReady();

        console.log('\n--- 转账TPS测试开始 ---');
        console.log('配置信息:');
        console.log('测试时长:', CONFIG.testDurationSeconds, '秒');
        console.log('每秒发送:', CONFIG.txPerSecond, '笔交易');
        console.log('每笔金额:', CONFIG.transferAmount);

        const provider = new WsProvider(CONFIG.wsEndpoint);
        const api = await ApiPromise.create({ provider });

        // 获取链上信息
        const decimals = api.registry.chainDecimals[0];
        const symbol = api.registry.chainTokens[0];
        const existentialDeposit = api.consts.balances.existentialDeposit;

        console.log('\n链信息:');
        console.log('代币符号:', symbol);
        console.log('代币精度:', decimals);
        console.log('最小存在金额:', formatBalance(existentialDeposit, decimals, symbol));

        // 初始化发送者账户
        const keyring = new Keyring({ type: 'sr25519' });
        const sender = keyring.addFromUri(CONFIG.senderSeed);
        console.log('\n发送者地址:', sender.address);

        // 获取账户信息
        const { nonce: startNonce, data: balance } = await api.query.system.account(sender.address);
        console.log('当前余额:', formatBalance(balance.free, decimals, symbol));
        console.log('起始nonce:', startNonce.toNumber());

        // 预估总交易数和费用
        const estimatedTotalTx = CONFIG.testDurationSeconds * CONFIG.txPerSecond;
        const singleAmount = api.createType('Balance', BigInt(Math.floor(parseFloat(CONFIG.transferAmount) * (10 ** decimals))).toString());
        const estimatedTotalAmount = singleAmount.muln(estimatedTotalTx);
        
        // 获取预估手续费
        const tx = api.tx.balances.transferKeepAlive(CONFIG.recipientAddress, singleAmount);
        const info = await tx.paymentInfo(sender);
        const estimatedFees = info.partialFee.muln(estimatedTotalTx);
        
        const estimatedTotalRequired = estimatedTotalAmount.add(estimatedFees);
        console.log('\n预估信息:');
        console.log('预计总交易数:', estimatedTotalTx);
        console.log('预估总费用:', formatBalance(estimatedTotalRequired, decimals, symbol));

        if (balance.free.lt(estimatedTotalRequired)) {
            throw new Error(`余额可能不足！建议至少准备: ${formatBalance(estimatedTotalRequired, decimals, symbol)}`);
        }

        // 开始测试
        console.log('\n开始测试...');
        const startTime = Date.now();
        const endTime = startTime + (CONFIG.testDurationSeconds * 1000);
        
        let currentNonce = startNonce.toNumber();
        const allTxHashes = [];

        // 快速发送所有交易
        while (Date.now() < endTime) {
            const secondsPassed = Math.floor((Date.now() - startTime) / 1000);
            console.log(`\n发送时间: ${secondsPassed}/${CONFIG.testDurationSeconds} 秒`);
            
            const txHashes = await sendTransactionsInTimeSlot(
                api,
                sender,
                currentNonce,
                CONFIG.txPerSecond,
                CONFIG.transferAmount,
                decimals
            );

            allTxHashes.push(...txHashes);
            currentNonce += CONFIG.txPerSecond;

            // 打印发送进度
            console.log(`已发送交易数: ${allTxHashes.length}`);
        }

        console.log('\n所有交易已发送，等待确认...');

        // 监控所有交易的确认状态
        const results = await monitorTransactions(api, allTxHashes);

        // 计算最终结果
        const actualDuration = (Date.now() - startTime) / 1000;
        const successfulTxCount = results.successful.size;
        const failedTxCount = results.failed.size;
        const totalTxCount = allTxHashes.length;
        const finalTps = successfulTxCount / actualDuration;

        // 打印最终结果
        console.log('\n--- 测试结果 ---');
        console.log('总耗时:', actualDuration.toFixed(2), '秒');
        console.log('平均TPS:', finalTps.toFixed(2));
        console.log('成功交易:', successfulTxCount);
        console.log('失败交易:', failedTxCount);
        console.log('总发送交易:', totalTxCount);
        console.log('成功率:', ((successfulTxCount / totalTxCount) * 100).toFixed(2) + '%');

        // 获取最终余额
        const { data: finalBalance } = await api.query.system.account(sender.address);
        console.log('\n最终余额:', formatBalance(finalBalance.free, decimals, symbol));
        console.log('消耗金额:', formatBalance(balance.free.sub(finalBalance.free), decimals, symbol));

        await api.disconnect();

    } catch (error) {
        console.error('\n测试执行出错:', error);
        process.exit(1);
    }
}

function formatBalance(balance, decimals, symbol) {
    const balanceNum = Number(balance) / (10 ** decimals);
    return `${balanceNum.toFixed(decimals).replace(/\.?0+$/, '')} ${symbol}`;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 