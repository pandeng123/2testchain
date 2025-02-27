const { ethers } = require('ethers');

async function main() {
    // 连接到本地节点
    const providerUrl = 'http://localhost:9944';
    const provider = new ethers.JsonRpcProvider(providerUrl);

    // 要查询的交易哈希
    const txHash = process.argv[2];
    if (!txHash) {
        console.error('请提供交易哈希作为参数!');
        console.error('使用方式: node test/query_transaction.js <交易哈希>');
        process.exit(1);
    }

    try {
        console.log('\n--- 查询交易信息 ---');
        console.log('交易哈希:', txHash);

        // 获取交易信息
        const tx = await provider.getTransaction(txHash);
        if (!tx) {
            console.error('\n未找到该交易!');
            process.exit(1);
        }

        // 获取交易收据
        const receipt = await provider.getTransactionReceipt(txHash);

        // 打印交易基本信息
        console.log('\n基本信息:');
        console.log('区块号:', tx.blockNumber);
        console.log('发送者:', tx.from);
        console.log('接收者:', tx.to);
        console.log('nonce:', tx.nonce);
        console.log('数据:', tx.data);
        console.log('值:', ethers.formatEther(tx.value), 'ETH');
        console.log('gas限制:', tx.gasLimit.toString());
        console.log('gas价格:', ethers.formatUnits(tx.gasPrice, 'gwei'), 'Gwei');

        // 如果有收据，打印更多信息
        if (receipt) {
            console.log('\n交易收据:');
            console.log('状态:', receipt.status === 1 ? '成功' : '失败');
            console.log('实际使用gas:', receipt.gasUsed.toString());
            console.log('区块哈希:', receipt.blockHash);
            console.log('交易索引:', receipt.transactionIndex);

            // 如果有事件日志，打印日志信息
            if (receipt.logs && receipt.logs.length > 0) {
                console.log('\n事件日志:');
                receipt.logs.forEach((log, index) => {
                    console.log(`\n日志 #${index + 1}:`);
                    console.log('合约地址:', log.address);
                    console.log('主题:', log.topics);
                    console.log('数据:', log.data);
                });
            }

            // 计算交易费用
            const gasFee = receipt.gasUsed * tx.gasPrice;
            console.log('\n交易费用:', ethers.formatEther(gasFee), 'ETH');
        }

        // 获取交易所在区块的时间戳
        const block = await provider.getBlock(tx.blockNumber);
        if (block) {
            const timestamp = new Date(block.timestamp * 1000);
            console.log('\n交易时间:', timestamp.toLocaleString());
        }

    } catch (error) {
        console.error('\n查询交易出错:', error);
        process.exit(1);
    }
}

// 执行主函数
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 