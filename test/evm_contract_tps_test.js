const { Keyring } = require('@polkadot/api');
const { ethers } = require('ethers');
const { parseUnits, formatEther } = ethers;

// 测试配置
const CONFIG = {
    providerUrl: 'http://localhost:9944',
    privateKey: '0xe5be9a5092b81bca64be81d212e7f2f9eba183bb7a90954f7b76361f6edb5c0a', // Alith
    contractAddress: '0xFa285e7D910a22e5589146F7c8e430a46647e6a3',
    testDurationSeconds: 10,
    txPerSecond: 100,
    methodName: 'transfer',
    recipientAddress: '0x1234567890123456789012345678901234567890',
    transferAmount: '1000000',
    maxRetries: 3,
    monitorTimeout: 120000, // 2分钟超时
    batchSize: 100 // 监控批次大小
};

// 合约ABI
const contractABI = [
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_name",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "_symbol",
                "type": "string"
            },
            {
                "internalType": "uint8",
                "name": "_decimals",
                "type": "uint8"
            },
            {
                "internalType": "uint256",
                "name": "_totalSupply",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Mint",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "allowance",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "decimals",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getDecimals",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getName",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getSymbol",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getTotalSupply",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "mint",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 修改为快速获取交易hash的方式发送交易
async function sendTransactions(contract, wallet, count, startNonce) {
    const txHashes = [];
    
    // 获取基础交易数据
    const baseTxData = await contract.transfer.populateTransaction(
        CONFIG.recipientAddress,
        CONFIG.transferAmount
    );

    // 获取网络chainId
    const network = await wallet.provider.getNetwork();
    const chainId = Number(network.chainId);

    for (let i = 0; i < count; i++) {
        try {
            // 准备交易数据
            const tx = {
                ...baseTxData,
                nonce: startNonce + i,
                gasLimit: 210000,
                chainId: chainId,  // 添加chainId
                type: 0,  // 使用legacy交易类型
                gasPrice: parseUnits('100', 'gwei')  // 使用gasPrice替代maxFeePerGas
            };

            // 签名交易
            const signedTx = await wallet.signTransaction(tx);
            // 发送交易但不等待
            const txResponse = await wallet.provider.broadcastTransaction(signedTx);
            
            txHashes.push({
                hash: txResponse.hash,
                nonce: startNonce + i,
                timestamp: Date.now()
            });

            console.log(`交易已发送 - Nonce: ${startNonce + i}, Hash: ${txResponse.hash}`);
        } catch (error) {
            console.error(`发送交易失败 (nonce: ${startNonce + i}):`, error.message);
        }
    }

    return txHashes;
}

// 优化后的交易监控
async function monitorTransactions(provider, txHashes) {
    const results = {
        successful: new Set(),
        failed: new Set()
    };

    console.log('\n开始监控交易确认状态...');

    // 按批次处理交易
    for (let i = 0; i < txHashes.length; i += CONFIG.batchSize) {
        const batch = txHashes.slice(i, i + CONFIG.batchSize);
        const monitorPromises = batch.map(async (tx) => {
            try {
                const receipt = await provider.waitForTransaction(
                    tx.hash,
                    1,
                    CONFIG.monitorTimeout
                );
                
                if (receipt.status === 1) {
                    results.successful.add(tx.hash);
                } else {
                    results.failed.add(tx.hash);
                }
            } catch (error) {
                console.error(`交易监控失败 (${tx.hash}):`, error.message);
                results.failed.add(tx.hash);
            }
        });

        await Promise.all(monitorPromises);
        
        // 打印批次进度
        const totalConfirmed = results.successful.size + results.failed.size;
        console.log(`交易确认进度: ${totalConfirmed}/${txHashes.length} ` +
            `(成功: ${results.successful.size}, 失败: ${results.failed.size})`);
    }

    return results;
}

async function main() {
    try {
        const provider = new ethers.JsonRpcProvider(CONFIG.providerUrl);
        const wallet = new ethers.Wallet(CONFIG.privateKey, provider);
        const contract = new ethers.Contract(CONFIG.contractAddress, contractABI, wallet);

        // 初始化信息打印
        console.log('\n--- EVM合约调用TPS测试开始 ---');
        console.log('配置信息:', {
            测试时长: CONFIG.testDurationSeconds,
            每秒发送: CONFIG.txPerSecond,
            合约地址: CONFIG.contractAddress,
            调用方法: CONFIG.methodName,
            发送者地址: wallet.address
        });

        // 获取起始nonce和检查余额
        const startNonce = await wallet.getNonce();
        const balance = await provider.getBalance(wallet.address);
        const txCount = BigInt(CONFIG.txPerSecond * CONFIG.testDurationSeconds);
        
        // 预估gas消耗
        const estimatedGasCost = parseUnits('100', 'gwei') * BigInt(210000) * txCount;
        const transferAmount = parseUnits(CONFIG.transferAmount, 18);
        const estimatedTotalCost = (transferAmount * txCount) + estimatedGasCost;

        if (balance < estimatedTotalCost) {
            throw new Error(`余额不足！需要至少 ${formatEther(estimatedTotalCost)} ETH`);
        }

        console.log(`当前余额: ${formatEther(balance)} ETH`);
        console.log(`预估消耗: ${formatEther(estimatedTotalCost)} ETH`);
        console.log('起始 nonce:', startNonce);

        // 开始测试
        console.log('\n开始测试...');
        const startTime = Date.now();
        const allTxHashes = [];
        let currentNonce = startNonce;

        // 修改循环逻辑，使用固定次数而不是时间判断
        for (let second = 0; second < CONFIG.testDurationSeconds; second++) {
            console.log(`\n发送时间: ${second}/${CONFIG.testDurationSeconds} 秒`);

            const secondStartTime = Date.now();

            // 顺序发送交易
            const txHashes = await sendTransactions(
                contract,
                wallet,
                CONFIG.txPerSecond,
                currentNonce
            );

            allTxHashes.push(...txHashes);
            currentNonce += CONFIG.txPerSecond;
            console.log(`已发送交易数: ${allTxHashes.length}`);

            // 精确控制每秒的时间
            const elapsedInSecond = Date.now() - secondStartTime;
            if (elapsedInSecond < 1000) {
                await sleep(1000 - elapsedInSecond);
            }
        }

        // 监控和统计结果
        console.log('\n所有交易已发送，等待确认...');
        const results = await monitorTransactions(provider, allTxHashes);

        // 计算并打印最终结果
        const actualDuration = (Date.now() - startTime) / 1000;
        const successfulTxCount = results.successful.size;
        const failedTxCount = results.failed.size;
        const totalTxCount = allTxHashes.length;
        const finalTps = successfulTxCount / actualDuration;

        console.log('\n--- 测试结果 ---');
        console.log({
            总耗时: `${actualDuration.toFixed(2)}秒`,
            平均TPS: finalTps.toFixed(2),
            成功交易: successfulTxCount,
            失败交易: failedTxCount,
            总发送交易: totalTxCount,
            成功率: `${((successfulTxCount / totalTxCount) * 100).toFixed(2)}%`
        });

    } catch (error) {
        console.error('\n测试执行出错:', error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 