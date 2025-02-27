const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const { cryptoWaitReady } = require('@polkadot/util-crypto');

// 转账配置
const CONFIG = {
    wsEndpoint: 'ws://127.0.0.1:9944',
    senderSeed: '//Alice', // 发送者种子短语，使用测试账户Alice
    recipientAddress: '5HGjWAeFDfFCWPsjFQdVV2Msvz2XtMktvgocEZcCj68kUMaw', // Bob的地址
    transferAmount: '0.01', // 转账金额
};

async function main() {
    try {
        await cryptoWaitReady();
        console.log('\n--- 开始转账操作 ---');

        // 连接到节点
        console.log('连接到节点:', CONFIG.wsEndpoint);
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

        // 获取发送者账户信息
        const { nonce, data: balance } = await api.query.system.account(sender.address);
        console.log('当前余额:', formatBalance(balance.free, decimals, symbol));
        console.log('当前nonce:', nonce.toNumber());

        // 创建转账金额
        const rawAmount = api.createType('Balance', api.createType(symbol, CONFIG.transferAmount).toJSON());
        
        console.log('\n转账详情:');
        console.log('接收地址:', CONFIG.recipientAddress);
        console.log('转账金额:', formatBalance(rawAmount, decimals, symbol));

        // 检查余额是否足够
        if (balance.free.lt(rawAmount)) {
            throw new Error('余额不足！');
        }

        // 检查是否会导致账户余额低于最小存在金额
        const remainingBalance = balance.free.sub(rawAmount);
        if (remainingBalance.lt(existentialDeposit)) {
            console.warn('\n警告: 转账后余额将低于最小存在金额，使用transferKeepAlive以确保账户不会被删除');
        }

        // 构建转账交易
        const transfer = api.tx.balances.transferKeepAlive(
            CONFIG.recipientAddress,
            rawAmount
        );

        // 获取交易费用估算
        const info = await transfer.paymentInfo(sender);
        console.log('\n交易信息:');
        console.log('预估费用:', formatBalance(info.partialFee, decimals, symbol));
        console.log('交易重量:', info.weight.toString());
        
        // 检查总费用是否可支付
        const totalCost = rawAmount.add(info.partialFee);
        if (balance.free.lt(totalCost)) {
            throw new Error('余额不足以支付转账金额和手续费！');
        }

        // 发送交易并等待确认
        console.log('\n发送交易...');
        
        return new Promise((resolve, reject) => {
            let unsubscribe;
            let timeoutId;

            try {
                transfer.signAndSend(sender, { nonce: -1 }, async ({ status, events, dispatchError }) => {
                    console.log('交易状态:', status.type);

                    if (status.isInBlock || status.isFinalized) {
                        // 检查是否有任何错误事件
                        events.forEach(({ event }) => {
                            if (api.events.system.ExtrinsicFailed.is(event)) {
                                // 获取错误信息
                                const [dispatchError] = event.data;
                                let errorInfo = '未知错误';

                                if (dispatchError.isModule) {
                                    const decoded = api.registry.findMetaError(dispatchError.asModule);
                                    errorInfo = `${decoded.section}.${decoded.name}: ${decoded.docs.join(' ')}`;
                                }

                                console.error('交易失败:', errorInfo);
                                unsubscribe();
                                clearTimeout(timeoutId);
                                reject(new Error(errorInfo));
                                return;
                            }
                        });

                        // 查找并处理成功的转账事件
                        events.forEach(({ event }) => {
                            if (api.events.balances.Transfer.is(event)) {
                                const [from, to, amount] = event.data;
                                console.log('\n转账事件:');
                                console.log('从:', from.toHuman());
                                console.log('到:', to.toHuman());
                                console.log('金额:', formatBalance(amount, decimals, symbol));
                            }
                        });

                        if (status.isFinalized) {
                            console.log('交易已最终确认，区块哈希:', status.asFinalized.toHex());

                            // 获取更新后的余额
                            const [senderAccount, recipientAccount] = await Promise.all([
                                api.query.system.account(sender.address),
                                api.query.system.account(CONFIG.recipientAddress)
                            ]);

                            console.log('\n余额更新:');
                            console.log('发送者新余额:', formatBalance(senderAccount.data.free, decimals, symbol));
                            console.log('接收者新余额:', formatBalance(recipientAccount.data.free, decimals, symbol));

                            unsubscribe();
                            clearTimeout(timeoutId);
                            await api.disconnect();
                            resolve();
                        }
                    }
                }).then(result => {
                    unsubscribe = result;
                    console.log('交易已提交，等待确认...');
                }).catch(error => {
                    console.error('交易提交失败:', error);
                    reject(error);
                });

                timeoutId = setTimeout(() => {
                    unsubscribe && unsubscribe();
                    reject(new Error('交易确认超时'));
                }, 60000);

            } catch (error) {
                console.error('交易执行错误:', error);
                reject(error);
            }
        });

    } catch (error) {
        console.error('\n转账失败:', error);
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