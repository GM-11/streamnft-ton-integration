// `MyNFT.js` in the frontend
const MyNFT = {
    abi:[
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "name",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "symbol",
                    "type": "string"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "sender",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                },
                {
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                }
            ],
            "name": "ERC721IncorrectOwner",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "operator",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "ERC721InsufficientApproval",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "approver",
                    "type": "address"
                }
            ],
            "name": "ERC721InvalidApprover",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "operator",
                    "type": "address"
                }
            ],
            "name": "ERC721InvalidOperator",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                }
            ],
            "name": "ERC721InvalidOwner",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "receiver",
                    "type": "address"
                }
            ],
            "name": "ERC721InvalidReceiver",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "sender",
                    "type": "address"
                }
            ],
            "name": "ERC721InvalidSender",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "ERC721NonexistentToken",
            "type": "error"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "approved",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "Approval",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "operator",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "bool",
                    "name": "approved",
                    "type": "bool"
                }
            ],
            "name": "ApprovalForAll",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "_fromTokenId",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "_toTokenId",
                    "type": "uint256"
                }
            ],
            "name": "BatchMetadataUpdate",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "_tokenId",
                    "type": "uint256"
                }
            ],
            "name": "MetadataUpdate",
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
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "tokenId",
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
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "approve",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "owner",
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
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "getApproved",
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
            "inputs": [
                {
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "operator",
                    "type": "address"
                }
            ],
            "name": "isApprovedForAll",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
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
                    "internalType": "string",
                    "name": "uri",
                    "type": "string"
                }
            ],
            "name": "mint",
            "outputs": [],
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
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "ownerOf",
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
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "safeTransferFrom",
            "outputs": [],
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
                    "name": "tokenId",
                    "type": "uint256"
                },
                {
                    "internalType": "bytes",
                    "name": "data",
                    "type": "bytes"
                }
            ],
            "name": "safeTransferFrom",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "operator",
                    "type": "address"
                },
                {
                    "internalType": "bool",
                    "name": "approved",
                    "type": "bool"
                }
            ],
            "name": "setApprovalForAll",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "bytes4",
                    "name": "interfaceId",
                    "type": "bytes4"
                }
            ],
            "name": "supportsInterface",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
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
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "tokenURI",
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
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "transferFrom",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ],
    bytecode: "608060405234801561000f575f80fd5b506040516127df3803806127df833981810160405281019061003191906101a8565b8181815f9081610041919061042b565b508060019081610051919061042b565b50505050506104fa565b5f604051905090565b5f80fd5b5f80fd5b5f80fd5b5f80fd5b5f601f19601f8301169050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52604160045260245ffd5b6100ba82610074565b810181811067ffffffffffffffff821117156100d9576100d8610084565b5b80604052505050565b5f6100eb61005b565b90506100f782826100b1565b919050565b5f67ffffffffffffffff82111561011657610115610084565b5b61011f82610074565b9050602081019050919050565b8281835e5f83830152505050565b5f61014c610147846100fc565b6100e2565b90508281526020810184848401111561016857610167610070565b5b61017384828561012c565b509392505050565b5f82601f83011261018f5761018e61006c565b5b815161019f84826020860161013a565b91505092915050565b5f80604083850312156101be576101bd610064565b5b5f83015167ffffffffffffffff8111156101db576101da610068565b5b6101e78582860161017b565b925050602083015167ffffffffffffffff81111561020857610207610068565b5b6102148582860161017b565b9150509250929050565b5f81519050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52602260045260245ffd5b5f600282049050600182168061026c57607f821691505b60208210810361027f5761027e610228565b5b50919050565b5f819050815f5260205f209050919050565b5f6020601f8301049050919050565b5f82821b905092915050565b5f600883026102e17fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff826102a6565b6102eb86836102a6565b95508019841693508086168417925050509392505050565b5f819050919050565b5f819050919050565b5f61032f61032a61032584610303565b61030c565b610303565b9050919050565b5f819050919050565b61034883610315565b61035c61035482610336565b8484546102b2565b825550505050565b5f90565b610370610364565b61037b81848461033f565b505050565b5b8181101561039e576103935f82610368565b600181019050610381565b5050565b601f8211156103e3576103b481610285565b6103bd84610297565b810160208510156103cc578190505b6103e06103d885610297565b830182610380565b50505b505050565b5f82821c905092915050565b5f6104035f19846008026103e8565b1980831691505092915050565b5f61041b83836103f4565b9150826002028217905092915050565b6104348261021e565b67ffffffffffffffff81111561044d5761044c610084565b5b6104578254610255565b6104628282856103a2565b5f60209050601f831160018114610493575f8415610481578287015190505b61048b8582610410565b8655506104f2565b601f1984166104a186610285565b5f5b828110156104c8578489015182556001820191506020850194506020810190506104a3565b868310156104e557848901516104e1601f8916826103f4565b8355505b6001600288020188555050505b505050505050565b6122d8806105075f395ff3fe608060405234801561000f575f80fd5b50600436106100f3575f3560e01c80636352211e11610095578063b88d4fde11610064578063b88d4fde14610281578063c87b56dd1461029d578063d0def521146102cd578063e985e9c5146102e9576100f3565b80636352211e146101e757806370a082311461021757806395d89b4114610247578063a22cb46514610265576100f3565b8063095ea7b3116100d1578063095ea7b31461017557806318160ddd1461019157806323b872dd146101af57806342842e0e146101cb576100f3565b806301ffc9a7146100f757806306fdde0314610127578063081812fc14610145575b5f80fd5b610111600480360381019061010c919061181f565b610319565b60405161011e9190611864565b60405180910390f35b61012f610379565b60405161013c91906118ed565b60405180910390f35b61015f600480360381019061015a9190611940565b610408565b60405161016c91906119aa565b60405180910390f35b61018f600480360381019061018a91906119ed565b610423565b005b610199610439565b6040516101a69190611a3a565b60405180910390f35b6101c960048036038101906101c49190611a53565b610449565b005b6101e560048036038101906101e09190611a53565b610548565b005b61020160048036038101906101fc9190611940565b610567565b60405161020e91906119aa565b60405180910390f35b610231600480360381019061022c9190611aa3565b610578565b60405161023e9190611a3a565b60405180910390f35b61024f61062e565b60405161025c91906118ed565b60405180910390f35b61027f600480360381019061027a9190611af8565b6106be565b005b61029b60048036038101906102969190611c62565b6106d4565b005b6102b760048036038101906102b29190611940565b6106f1565b6040516102c491906118ed565b60405180910390f35b6102e760048036038101906102e29190611d80565b6107fc565b005b61030360048036038101906102fe9190611dda565b61082c565b6040516103109190611864565b60405180910390f35b5f634906490660e01b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff191614806103725750610371826108ba565b5b9050919050565b60605f805461038790611e45565b80601f01602080910402602001604051908101604052809291908181526020018280546103b390611e45565b80156103fe5780601f106103d5576101008083540402835291602001916103fe565b820191905f5260205f20905b8154815290600101906020018083116103e157829003601f168201915b5050505050905090565b5f6104128261099b565b5061041c82610a21565b9050919050565b6104358282610430610a5a565b610a61565b5050565b5f6104446007610a73565b905090565b5f73ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16036104b9575f6040517f64a0ae920000000000000000000000000000000000000000000000000000000081526004016104b091906119aa565b60405180910390fd5b5f6104cc83836104c7610a5a565b610a7f565b90508373ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1614610542578382826040517f64283d7b00000000000000000000000000000000000000000000000000000000815260040161053993929190611e75565b60405180910390fd5b50505050565b61056283838360405180602001604052805f8152506106d4565b505050565b5f6105718261099b565b9050919050565b5f8073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16036105e9575f6040517f89c62b640000000000000000000000000000000000000000000000000000000081526004016105e091906119aa565b60405180910390fd5b60035f8373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f20549050919050565b60606001805461063d90611e45565b80601f016020809104026020016040519081016040528092919081815260200182805461066990611e45565b80156106b45780601f1061068b576101008083540402835291602001916106b4565b820191905f5260205f20905b81548152906001019060200180831161069757829003601f168201915b5050505050905090565b6106d06106c9610a5a565b8383610c8a565b5050565b6106df848484610449565b6106eb84848484610df3565b50505050565b60606106fc8261099b565b505f60065f8481526020019081526020015f20805461071a90611e45565b80601f016020809104026020016040519081016040528092919081815260200182805461074690611e45565b80156107915780601f1061076857610100808354040283529160200191610791565b820191905f5260205f20905b81548152906001019060200180831161077457829003601f168201915b505050505090505f6107a1610fa5565b90505f8151036107b55781925050506107f7565b5f825111156107e95780826040516020016107d1929190611ee4565b604051602081830303815290604052925050506107f7565b6107f284610fbb565b925050505b919050565b5f6108076007610a73565b90506108138382611021565b61081d818361103e565b6108276007611098565b505050565b5f60055f8473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f8373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f9054906101000a900460ff16905092915050565b5f7f80ac58cd000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916148061098457507f5b5e139f000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916145b806109945750610993826110ac565b5b9050919050565b5f806109a683611115565b90505f73ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1603610a1857826040517f7e273289000000000000000000000000000000000000000000000000000000008152600401610a0f9190611a3a565b60405180910390fd5b80915050919050565b5f60045f8381526020019081526020015f205f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050919050565b5f33905090565b610a6e838383600161114e565b505050565b5f815f01549050919050565b5f80610a8a84611115565b90505f73ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1614610acb57610aca81848661130d565b5b5f73ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1614610b5657610b0a5f855f8061114e565b600160035f8373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f82825403925050819055505b5f73ffffffffffffffffffffffffffffffffffffffff168573ffffffffffffffffffffffffffffffffffffffff1614610bd557600160035f8773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f82825401925050819055505b8460025f8681526020019081526020015f205f6101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550838573ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef60405160405180910390a4809150509392505050565b5f73ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603610cfa57816040517f5b08ba18000000000000000000000000000000000000000000000000000000008152600401610cf191906119aa565b60405180910390fd5b8060055f8573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f8473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f6101000a81548160ff0219169083151502179055508173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c3183604051610de69190611864565b60405180910390a3505050565b5f8373ffffffffffffffffffffffffffffffffffffffff163b1115610f9f578273ffffffffffffffffffffffffffffffffffffffff1663150b7a02610e36610a5a565b8685856040518563ffffffff1660e01b8152600401610e589493929190611f59565b6020604051808303815f875af1925050508015610e9357506040513d601f19601f82011682018060405250810190610e909190611fb7565b60015b610f14573d805f8114610ec1576040519150601f19603f3d011682016040523d82523d5f602084013e610ec6565b606091505b505f815103610f0c57836040517f64a0ae92000000000000000000000000000000000000000000000000000000008152600401610f0391906119aa565b60405180910390fd5b805181602001fd5b63150b7a0260e01b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916817bffffffffffffffffffffffffffffffffffffffffffffffffffffffff191614610f9d57836040517f64a0ae92000000000000000000000000000000000000000000000000000000008152600401610f9491906119aa565b60405180910390fd5b505b50505050565b606060405180602001604052805f815250905090565b6060610fc68261099b565b505f610fd0610fa5565b90505f815111610fee5760405180602001604052805f815250611019565b80610ff8846113d0565b604051602001611009929190611ee4565b6040516020818303038152906040525b915050919050565b61103a828260405180602001604052805f81525061149a565b5050565b8060065f8481526020019081526020015f20908161105c919061217f565b507ff8e1a15aba9398e019f0b49df1a4fde98ee17ae345cb5f6b5e2c27f5033e8ce78260405161108c9190611a3a565b60405180910390a15050565b6001815f015f828254019250508190555050565b5f7f01ffc9a7000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916149050919050565b5f60025f8381526020019081526020015f205f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050919050565b808061118657505f73ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1614155b156112b8575f6111958461099b565b90505f73ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff16141580156111ff57508273ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1614155b80156112125750611210818461082c565b155b1561125457826040517fa9fbf51f00000000000000000000000000000000000000000000000000000000815260040161124b91906119aa565b60405180910390fd5b81156112b657838573ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92560405160405180910390a45b505b8360045f8581526020019081526020015f205f6101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050505050565b6113188383836114b5565b6113cb575f73ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff160361138c57806040517f7e2732890000000000000000000000000000000000000000000000000000000081526004016113839190611a3a565b60405180910390fd5b81816040517f177e802f0000000000000000000000000000000000000000000000000000000081526004016113c292919061224e565b60405180910390fd5b505050565b60605f60016113de84611575565b0190505f8167ffffffffffffffff8111156113fc576113fb611b3e565b5b6040519080825280601f01601f19166020018201604052801561142e5781602001600182028036833780820191505090505b5090505f82602001820190505b60011561148f578080600190039150507f3031323334353637383961626364656600000000000000000000000000000000600a86061a8153600a858161148457611483612275565b5b0494505f850361143b575b819350505050919050565b6114a483836116c6565b6114b05f848484610df3565b505050565b5f8073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff161415801561156c57508273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff16148061152d575061152c848461082c565b5b8061156b57508273ffffffffffffffffffffffffffffffffffffffff1661155383610a21565b73ffffffffffffffffffffffffffffffffffffffff16145b5b90509392505050565b5f805f90507a184f03e93ff9f4daa797ed6e38ed64bf6a1f01000000000000000083106115d1577a184f03e93ff9f4daa797ed6e38ed64bf6a1f01000000000000000083816115c7576115c6612275565b5b0492506040810190505b6d04ee2d6d415b85acef8100000000831061160e576d04ee2d6d415b85acef8100000000838161160457611603612275565b5b0492506020810190505b662386f26fc10000831061163d57662386f26fc10000838161163357611632612275565b5b0492506010810190505b6305f5e1008310611666576305f5e100838161165c5761165b612275565b5b0492506008810190505b612710831061168b57612710838161168157611680612275565b5b0492506004810190505b606483106116ae57606483816116a4576116a3612275565b5b0492506002810190505b600a83106116bd576001810190505b80915050919050565b5f73ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603611736575f6040517f64a0ae9200000000000000000000000000000000000000000000000000000000815260040161172d91906119aa565b60405180910390fd5b5f61174283835f610a7f565b90505f73ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16146117b4575f6040517f73c6ac6e0000000000000000000000000000000000000000000000000000000081526004016117ab91906119aa565b60405180910390fd5b505050565b5f604051905090565b5f80fd5b5f80fd5b5f7fffffffff0000000000000000000000000000000000000000000000000000000082169050919050565b6117fe816117ca565b8114611808575f80fd5b50565b5f81359050611819816117f5565b92915050565b5f60208284031215611834576118336117c2565b5b5f6118418482850161180b565b91505092915050565b5f8115159050919050565b61185e8161184a565b82525050565b5f6020820190506118775f830184611855565b92915050565b5f81519050919050565b5f82825260208201905092915050565b8281835e5f83830152505050565b5f601f19601f8301169050919050565b5f6118bf8261187d565b6118c98185611887565b93506118d9818560208601611897565b6118e2816118a5565b840191505092915050565b5f6020820190508181035f83015261190581846118b5565b905092915050565b5f819050919050565b61191f8161190d565b8114611929575f80fd5b50565b5f8135905061193a81611916565b92915050565b5f60208284031215611955576119546117c2565b5b5f6119628482850161192c565b91505092915050565b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f6119948261196b565b9050919050565b6119a48161198a565b82525050565b5f6020820190506119bd5f83018461199b565b92915050565b6119cc8161198a565b81146119d6575f80fd5b50565b5f813590506119e7816119c3565b92915050565b5f8060408385031215611a0357611a026117c2565b5b5f611a10858286016119d9565b9250506020611a218582860161192c565b9150509250929050565b611a348161190d565b82525050565b5f602082019050611a4d5f830184611a2b565b92915050565b5f805f60608486031215611a6a57611a696117c2565b5b5f611a77868287016119d9565b9350506020611a88868287016119d9565b9250506040611a998682870161192c565b9150509250925092565b5f60208284031215611ab857611ab76117c2565b5b5f611ac5848285016119d9565b91505092915050565b611ad78161184a565b8114611ae1575f80fd5b50565b5f81359050611af281611ace565b92915050565b5f8060408385031215611b0e57611b0d6117c2565b5b5f611b1b858286016119d9565b9250506020611b2c85828601611ae4565b9150509250929050565b5f80fd5b5f80fd5b7f4e487b71000000000000000000000000000000000000000000000000000000005f52604160045260245ffd5b611b74826118a5565b810181811067ffffffffffffffff82111715611b9357611b92611b3e565b5b80604052505050565b5f611ba56117b9565b9050611bb18282611b6b565b919050565b5f67ffffffffffffffff821115611bd057611bcf611b3e565b5b611bd9826118a5565b9050602081019050919050565b828183375f83830152505050565b5f611c06611c0184611bb6565b611b9c565b905082815260208101848484011115611c2257611c21611b3a565b5b611c2d848285611be6565b509392505050565b5f82601f830112611c4957611c48611b36565b5b8135611c59848260208601611bf4565b91505092915050565b5f805f8060808587031215611c7a57611c796117c2565b5b5f611c87878288016119d9565b9450506020611c98878288016119d9565b9350506040611ca98782880161192c565b925050606085013567ffffffffffffffff811115611cca57611cc96117c6565b5b611cd687828801611c35565b91505092959194509250565b5f67ffffffffffffffff821115611cfc57611cfb611b3e565b5b611d05826118a5565b9050602081019050919050565b5f611d24611d1f84611ce2565b611b9c565b905082815260208101848484011115611d4057611d3f611b3a565b5b611d4b848285611be6565b509392505050565b5f82601f830112611d6757611d66611b36565b5b8135611d77848260208601611d12565b91505092915050565b5f8060408385031215611d9657611d956117c2565b5b5f611da3858286016119d9565b925050602083013567ffffffffffffffff811115611dc457611dc36117c6565b5b611dd085828601611d53565b9150509250929050565b5f8060408385031215611df057611def6117c2565b5b5f611dfd858286016119d9565b9250506020611e0e858286016119d9565b9150509250929050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52602260045260245ffd5b5f6002820490506001821680611e5c57607f821691505b602082108103611e6f57611e6e611e18565b5b50919050565b5f606082019050611e885f83018661199b565b611e956020830185611a2b565b611ea2604083018461199b565b949350505050565b5f81905092915050565b5f611ebe8261187d565b611ec88185611eaa565b9350611ed8818560208601611897565b80840191505092915050565b5f611eef8285611eb4565b9150611efb8284611eb4565b91508190509392505050565b5f81519050919050565b5f82825260208201905092915050565b5f611f2b82611f07565b611f358185611f11565b9350611f45818560208601611897565b611f4e816118a5565b840191505092915050565b5f608082019050611f6c5f83018761199b565b611f79602083018661199b565b611f866040830185611a2b565b8181036060830152611f988184611f21565b905095945050505050565b5f81519050611fb1816117f5565b92915050565b5f60208284031215611fcc57611fcb6117c2565b5b5f611fd984828501611fa3565b91505092915050565b5f819050815f5260205f209050919050565b5f6020601f8301049050919050565b5f82821b905092915050565b5f6008830261203e7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82612003565b6120488683612003565b95508019841693508086168417925050509392505050565b5f819050919050565b5f61208361207e6120798461190d565b612060565b61190d565b9050919050565b5f819050919050565b61209c83612069565b6120b06120a88261208a565b84845461200f565b825550505050565b5f90565b6120c46120b8565b6120cf818484612093565b505050565b5b818110156120f2576120e75f826120bc565b6001810190506120d5565b5050565b601f8211156121375761210881611fe2565b61211184611ff4565b81016020851015612120578190505b61213461212c85611ff4565b8301826120d4565b50505b505050565b5f82821c905092915050565b5f6121575f198460080261213c565b1980831691505092915050565b5f61216f8383612148565b9150826002028217905092915050565b6121888261187d565b67ffffffffffffffff8111156121a1576121a0611b3e565b5b6121ab8254611e45565b6121b68282856120f6565b5f60209050601f8311600181146121e7575f84156121d5578287015190505b6121df8582612164565b865550612246565b601f1984166121f586611fe2565b5f5b8281101561221c578489015182556001820191506020850194506020810190506121f7565b868310156122395784890151612235601f891682612148565b8355505b6001600288020188555050505b505050505050565b5f6040820190506122615f83018561199b565b61226e6020830184611a2b565b9392505050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601260045260245ffdfea26469706673582212205626622105e62e1c0bcb3e77b6f60a0a044e8bd063b04c0f2337ed465dca618b64736f6c634300081a0033"
  };
  
  export default MyNFT;
  