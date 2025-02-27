const { Keyring } = require('@polkadot/api');
const { ethers } = require('ethers');

async function main() {
    // 连接本地链
    const privateKey = '0xe5be9a5092b81bca64be81d212e7f2f9eba183bb7a90954f7b76361f6edb5c0a'; // Alith
    const keyring = new Keyring({ type: 'ethereum' });
    const callerAccount = keyring.addFromUri(privateKey, null, 'ethereum');
    console.log(`调用者账户地址: ${callerAccount.address}`);

    // 连接到本地节点
    const providerUrl = 'http://localhost:9944';
    const provider = new ethers.JsonRpcProvider(providerUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    // 合约ABI和地址
    const contractAddress = '0xFa285e7D910a22e5589146F7c8e430a46647e6a3'; // 需要替换为实际部署的合约地址
    const abi = [
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

    // 创建合约实例
    const contract = new ethers.Contract(contractAddress, abi, wallet);

    try {
        // 1. 获取基本信息
        console.log('\n--- 代币基本信息 ---');
        const name = await contract.getName();
        console.log('代币名称:', name);

        const symbol = await contract.getSymbol();
        console.log('代币符号:', symbol);

        const decimals = await contract.getDecimals();
        console.log('代币精度:', decimals);

        const totalSupply = await contract.getTotalSupply();
        console.log('总供应量:', totalSupply.toString());

        // 2. 获取合约所有者
        const owner = await contract.owner();
        console.log('\n合约所有者:', owner);

        // 3. 获取调用者余额
        const balance = await contract.balanceOf(wallet.address);
        console.log('调用者余额:', balance.toString());

        // 4. mint代币示例
        console.log('\n--- 执行Mint操作 ---');
        const mintAmount = ethers.parseUnits('100', decimals);
        const mintTx = await contract.mint(wallet.address, mintAmount);
        await mintTx.wait();
        console.log('Mint成功! 交易哈希:', mintTx.hash);

        // 5. 查询mint后的余额
        const newBalance = await contract.balanceOf(wallet.address);
        console.log('Mint后余额:', newBalance.toString());

        // 6. 转账示例
        console.log('\n--- 执行转账操作 ---');
        const recipientAddress = '0x1234567890123456789012345678901234567890'; // 需要替换为实际接收地址
        const transferAmount = ethers.parseUnits('10', decimals);
        
        console.log('开始转账...');
        const transferTx = await contract.transfer(recipientAddress, transferAmount);
        await transferTx.wait();
        console.log('转账成功! 交易哈希:', transferTx.hash);

        // 7. 查询转账后的余额
        const senderNewBalance = await contract.balanceOf(wallet.address);
        console.log('发送者新余额:', senderNewBalance.toString());
        
        const recipientBalance = await contract.balanceOf(recipientAddress);
        console.log('接收者余额:', recipientBalance.toString());

        // 8. 查询授权额度
        const allowance = await contract.allowance(wallet.address, recipientAddress);
        console.log('\n授权额度:', allowance.toString());

    } catch (error) {
        console.error('\n合约调用出错:', error);
    }
}

// 执行主函数
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });