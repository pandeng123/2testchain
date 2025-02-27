const { Keyring } = require('@polkadot/api');
const { ethers } = require('ethers');

async function main() {
    // connect to local chain
    const privateKey = '0xe5be9a5092b81bca64be81d212e7f2f9eba183bb7a90954f7b76361f6edb5c0a'; // Alith
    const keyring = new Keyring({ type: 'ethereum' });
    const callerAccount = keyring.addFromUri(privateKey, null, 'ethereum');
    console.log(`caller account address: ${callerAccount.address}`);

    // deploy evm contract
    const providerUrl = 'http://localhost:9944';

    // compiled from hybridvm/external/contract/src/erc20evm/TestEvmToken.sol
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
    ]
    const bytecode = '60806040523480156200001157600080fd5b50604051620016ce380380620016ce833981810160405281019062000037919062000278565b83600090805190602001906200004f9291906200011c565b508260019080519060200190620000689291906200011c565b5081600260006101000a81548160ff021916908360ff16021790555080600381905550600354600460003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555033600660006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050505050620004f7565b8280546200012a90620003d4565b90600052602060002090601f0160209004810192826200014e57600085556200019a565b82601f106200016957805160ff19168380011785556200019a565b828001600101855582156200019a579182015b82811115620001995782518255916020019190600101906200017c565b5b509050620001a99190620001ad565b5090565b5b80821115620001c8576000816000905550600101620001ae565b5090565b6000620001e3620001dd8462000351565b62000328565b905082815260208101848484011115620002025762000201620004a3565b5b6200020f8482856200039e565b509392505050565b600082601f8301126200022f576200022e6200049e565b5b815162000241848260208601620001cc565b91505092915050565b6000815190506200025b81620004c3565b92915050565b6000815190506200027281620004dd565b92915050565b60008060008060808587031215620002955762000294620004ad565b5b600085015167ffffffffffffffff811115620002b657620002b5620004a8565b5b620002c48782880162000217565b945050602085015167ffffffffffffffff811115620002e857620002e7620004a8565b5b620002f68782880162000217565b9350506040620003098782880162000261565b92505060606200031c878288016200024a565b91505092959194509250565b60006200033462000347565b90506200034282826200040a565b919050565b6000604051905090565b600067ffffffffffffffff8211156200036f576200036e6200046f565b5b6200037a82620004b2565b9050602081019050919050565b6000819050919050565b600060ff82169050919050565b60005b83811015620003be578082015181840152602081019050620003a1565b83811115620003ce576000848401525b50505050565b60006002820490506001821680620003ed57607f821691505b6020821081141562000404576200040362000440565b5b50919050565b6200041582620004b2565b810181811067ffffffffffffffff821117156200043757620004366200046f565b5b80604052505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b620004ce8162000387565b8114620004da57600080fd5b50565b620004e88162000391565b8114620004f457600080fd5b50565b6111c780620005076000396000f3fe608060405234801561001057600080fd5b50600436106100ea5760003560e01c806370a082311161008c578063a9059cbb11610066578063a9059cbb14610251578063c4e41b2214610281578063dd62ed3e1461029f578063f0141d84146102cf576100ea565b806370a08231146101e55780638da5cb5b1461021557806395d89b4114610233576100ea565b806318160ddd116100c857806318160ddd1461014957806323b872dd14610167578063313ce5671461019757806340c10f19146101b5576100ea565b806306fdde03146100ef578063150704011461010d57806317d7de7c1461012b575b600080fd5b6100f76102ed565b6040516101049190610dc7565b60405180910390f35b61011561037b565b6040516101229190610dc7565b60405180910390f35b61013361040d565b6040516101409190610dc7565b60405180910390f35b61015161049f565b60405161015e9190610e69565b60405180910390f35b610181600480360381019061017c9190610bfd565b6104a5565b60405161018e9190610dac565b60405180910390f35b61019f6105ad565b6040516101ac9190610e84565b60405180910390f35b6101cf60048036038101906101ca9190610c50565b6105c0565b6040516101dc9190610dac565b60405180910390f35b6101ff60048036038101906101fa9190610b90565b610761565b60405161020c9190610e69565b60405180910390f35b61021d610779565b60405161022a9190610d91565b60405180910390f35b61023b61079f565b6040516102489190610dc7565b60405180910390f35b61026b60048036038101906102669190610c50565b61082d565b6040516102789190610dac565b60405180910390f35b6102896108c6565b6040516102969190610e69565b60405180910390f35b6102b960048036038101906102b49190610bbd565b6108d0565b6040516102c69190610e69565b60405180910390f35b6102d76108f5565b6040516102e49190610e84565b60405180910390f35b600080546102fa90610fcd565b80601f016020809104026020016040519081016040528092919081815260200182805461032690610fcd565b80156103735780601f1061034857610100808354040283529160200191610373565b820191906000526020600020905b81548152906001019060200180831161035657829003601f168201915b505050505081565b60606001805461038a90610fcd565b80601f01602080910402602001604051908101604052809291908181526020018280546103b690610fcd565b80156104035780601f106103d857610100808354040283529160200191610403565b820191906000526020600020905b8154815290600101906020018083116103e657829003601f168201915b5050505050905090565b60606000805461041c90610fcd565b80601f016020809104026020016040519081016040528092919081815260200182805461044890610fcd565b80156104955780601f1061046a57610100808354040283529160200191610495565b820191906000526020600020905b81548152906001019060200180831161047857829003601f168201915b5050505050905090565b60035481565b60008373ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610515576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161050c90610e49565b60405180910390fd5b81600460008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020541015610597576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161058e90610e29565b60405180910390fd5b6105a284848461090c565b600190509392505050565b600260009054906101000a900460ff1681565b6000600660009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610652576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161064990610de9565b60405180910390fd5b61065b83610b14565b61069a576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161069190610e09565b60405180910390fd5b81600360008282546106ac9190610ebb565b9250508190555081600460008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546107029190610ebb565b925050819055508273ffffffffffffffffffffffffffffffffffffffff167f0f6798a560793a54c3bcfe86a93cde1e73087d944c0ea20544137d41213968858360405161074f9190610e69565b60405180910390a26001905092915050565b60046020528060005260406000206000915090505481565b600660009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600180546107ac90610fcd565b80601f01602080910402602001604051908101604052809291908181526020018280546107d890610fcd565b80156108255780601f106107fa57610100808354040283529160200191610825565b820191906000526020600020905b81548152906001019060200180831161080857829003601f168201915b505050505081565b600081600460003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205410156108b1576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016108a890610e29565b60405180910390fd5b6108bc33848461090c565b6001905092915050565b6000600354905090565b6005602052816000526040600020602052806000526040600020600091509150505481565b6000600260009054906101000a900460ff16905090565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16141561097c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161097390610e09565b60405180910390fd5b80600460008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205410156109fe576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016109f590610e29565b60405180910390fd5b80600460008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254610a4d9190610f11565b9250508190555080600460008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254610aa39190610ebb565b925050819055508173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef83604051610b079190610e69565b60405180910390a3505050565b60008073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415610b535760009050610b61565b6000823b9050600081149150505b919050565b600081359050610b7581611163565b92915050565b600081359050610b8a8161117a565b92915050565b600060208284031215610ba657610ba561105d565b5b6000610bb484828501610b66565b91505092915050565b60008060408385031215610bd457610bd361105d565b5b6000610be285828601610b66565b9250506020610bf385828601610b66565b9150509250929050565b600080600060608486031215610c1657610c1561105d565b5b6000610c2486828701610b66565b9350506020610c3586828701610b66565b9250506040610c4686828701610b7b565b9150509250925092565b60008060408385031215610c6757610c6661105d565b5b6000610c7585828601610b66565b9250506020610c8685828601610b7b565b9150509250929050565b610c9981610f45565b82525050565b610ca881610f57565b82525050565b6000610cb982610e9f565b610cc38185610eaa565b9350610cd3818560208601610f9a565b610cdc81611062565b840191505092915050565b6000610cf4602583610eaa565b9150610cff82611073565b604082019050919050565b6000610d17600f83610eaa565b9150610d22826110c2565b602082019050919050565b6000610d3a601483610eaa565b9150610d45826110eb565b602082019050919050565b6000610d5d602b83610eaa565b9150610d6882611114565b604082019050919050565b610d7c81610f83565b82525050565b610d8b81610f8d565b82525050565b6000602082019050610da66000830184610c90565b92915050565b6000602082019050610dc16000830184610c9f565b92915050565b60006020820190508181036000830152610de18184610cae565b905092915050565b60006020820190508181036000830152610e0281610ce7565b9050919050565b60006020820190508181036000830152610e2281610d0a565b9050919050565b60006020820190508181036000830152610e4281610d2d565b9050919050565b60006020820190508181036000830152610e6281610d50565b9050919050565b6000602082019050610e7e6000830184610d73565b92915050565b6000602082019050610e996000830184610d82565b92915050565b600081519050919050565b600082825260208201905092915050565b6000610ec682610f83565b9150610ed183610f83565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff03821115610f0657610f05610fff565b5b828201905092915050565b6000610f1c82610f83565b9150610f2783610f83565b925082821015610f3a57610f39610fff565b5b828203905092915050565b6000610f5082610f63565b9050919050565b60008115159050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b600060ff82169050919050565b60005b83811015610fb8578082015181840152602081019050610f9d565b83811115610fc7576000848401525b50505050565b60006002820490506001821680610fe557607f821691505b60208210811415610ff957610ff861102e565b5b50919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b600080fd5b6000601f19601f8301169050919050565b7f4f6e6c7920746865206f776e65722063616e2063616c6c20746869732066756e60008201527f6374696f6e000000000000000000000000000000000000000000000000000000602082015250565b7f496e76616c696420616464726573730000000000000000000000000000000000600082015250565b7f496e73756666696369656e742062616c616e6365000000000000000000000000600082015250565b7f596f752063616e206f6e6c79207472616e736665722066726f6d20796f75722060008201527f6f776e2061646472657373000000000000000000000000000000000000000000602082015250565b61116c81610f45565b811461117757600080fd5b50565b61118381610f83565b811461118e57600080fd5b5056fea2646970667358221220350d7f9064c41ba573c9e72710f8aef2cc9049dd5826969c44b45b21e818e01b64736f6c63430008070033'

    // 设置代币参数
    const tokenName = "Test Token";
    const tokenSymbol = "TST";
    const tokenDecimals = 18;
    const initialSupply = ethers.parseUnits("1000000", tokenDecimals); // 100万代币初始供应量

    await deployEvmContract(
        abi, 
        bytecode, 
        privateKey, 
        providerUrl,
        [tokenName, tokenSymbol, tokenDecimals, initialSupply]
    );

    process.exit(0);
}

/**
 * 部署EVM合约
 * @param {Array} abi - 合约的ABI接口定义
 * @param {string} bytecode - 合约的编译后的字节码
 * @param {string} privateKey - 部署者的私钥
 * @param {string} providerUrl - 以太坊节点的RPC URL
 * @param {Array} constructorArgs - 构造函数参数
 * @returns {string} 返回部署后的合约地址
 */
async function deployEvmContract(abi, bytecode, privateKey, providerUrl, constructorArgs) {
    console.log('\n开始部署合约...');
    console.log('构造函数参数:', {
        name: constructorArgs[0],
        symbol: constructorArgs[1],
        decimals: constructorArgs[2],
        totalSupply: constructorArgs[3].toString()
    });

    // 创建以太坊提供者实例
    const provider = new ethers.JsonRpcProvider(providerUrl);
    
    // 创建钱包实例
    const wallet = new ethers.Wallet(privateKey, provider);
    console.log('部署者地址:', wallet.address);

    // 创建合约工厂实例
    const contractFactory = new ethers.ContractFactory(abi, bytecode, wallet);
    
    try {
        // 部署合约，传入构造函数参数
        console.log('\n部署合约中...');
        const evmContract = await contractFactory.deploy(...constructorArgs);
        
        // 等待合约部署完成
        console.log('等待交易确认...');
        await evmContract.waitForDeployment();

        // 获取部署后的合约地址
        const evmContractAddress = await evmContract.getAddress();
        console.log('\n合约部署成功!');
        console.log('合约地址:', evmContractAddress);
        console.log('交易哈希:', evmContract.deploymentTransaction().hash);

        // 验证合约部署
        const contract = new ethers.Contract(evmContractAddress, abi, wallet);
        const name = await contract.getName();
        const symbol = await contract.getSymbol();
        const decimals = await contract.getDecimals();
        const totalSupply = await contract.getTotalSupply();

        console.log('\n合约验证:');
        console.log('代币名称:', name);
        console.log('代币符号:', symbol);
        console.log('代币精度:', decimals);
        console.log('总供应量:', ethers.formatUnits(totalSupply, decimals));

        return evmContractAddress;
    } catch (error) {
        console.error('\n合约部署失败:', error);
        throw error;
    }
}

main().catch(console.error);