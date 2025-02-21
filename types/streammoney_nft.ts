export type StreammoneyNft ={
  "version": "0.1.0",
  "name": "streammoney_nft",
  "docs": [
      "stream money nft program entrypoint"
  ],
  "instructions": [
      {
          "name": "initProtocolState",
          "accounts": [
              {
                  "name": "admin",
                  "isMut": true,
                  "isSigner": true,
                  "docs": [
                      "CHECK - we are setting this ourselves"
                  ]
              },
              {
                  "name": "protocolState",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "systemProgram",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "treasury",
                  "isMut": false,
                  "isSigner": false,
                  "docs": [
                      "CHECK - we are setting this"
                  ]
              }
          ],
          "args": [
              {
                  "name": "protocolFeePercentage",
                  "type": "f64"
              }
          ]
      },
      {
          "name": "updateProtocolState",
          "accounts": [
              {
                  "name": "admin",
                  "isMut": true,
                  "isSigner": true,
                  "docs": [
                      "CHECK - we are setting this ourselves"
                  ]
              },
              {
                  "name": "protocolState",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "systemProgram",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "treasury",
                  "isMut": false,
                  "isSigner": false,
                  "docs": [
                      "CHECK - we are setting this"
                  ]
              }
          ],
          "args": [
              {
                  "name": "newTreasury",
                  "type": {
                      "option": "publicKey"
                  }
              },
              {
                  "name": "newFees",
                  "type": {
                      "option": "f64"
                  }
              },
              {
                  "name": "newAdmin",
                  "type": {
                      "option": "publicKey"
                  }
              }
          ]
      },
      {
          "name": "initPartner",
          "accounts": [
              {
                  "name": "signer",
                  "isMut": true,
                  "isSigner": true,
                  "docs": [
                      "CHECK - we are setting this ourselves"
                  ]
              },
              {
                  "name": "partnerManager",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "collectionMint",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "protocolState",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "metadataAccount",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "systemProgram",
                  "isMut": false,
                  "isSigner": false
              }
          ],
          "args": [
              {
                  "name": "partnerFeesPercentage",
                  "type": {
                      "option": "f64"
                  }
              },
              {
                  "name": "partnerTreasury",
                  "type": {
                      "option": "publicKey"
                  }
              }
          ]
      },
      {
          "name": "initRent",
          "accounts": [
              {
                  "name": "initializer",
                  "isMut": true,
                  "isSigner": true
              },
              {
                  "name": "mint",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "assetManager",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "vaultAccount",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "initializerDepositTokenAccount",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "tokenMetadataAccount",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "metadataProgram",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "whitelist",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "edition",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "systemProgram",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "rent",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "tokenProgram",
                  "isMut": false,
                  "isSigner": false
              }
          ],
          "args": [
              {
                  "name": "rate",
                  "type": "u64"
              },
              {
                  "name": "offerDurationInMinutes",
                  "type": "u64"
              },
              {
                  "name": "fixedDurationInMinutes",
                  "type": "u64"
              },
              {
                  "name": "rentIsFixed",
                  "type": "bool"
              },
              {
                  "name": "ownerRevenue",
                  "type": "u64"
              },
              {
                  "name": "trialType",
                  "type": {
                      "option": "string"
                  }
              },
              {
                  "name": "trialFees",
                  "type": {
                      "option": "u64"
                  }
              }
          ]
      },
      {
          "name": "cancelRent",
          "accounts": [
              {
                  "name": "initializer",
                  "isMut": true,
                  "isSigner": true
              },
              {
                  "name": "mint",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "metadataProgram",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "vaultAccount",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "initializerDepositTokenAccount",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "assetManager",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "tokenProgram",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "edition",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "metadataAccount",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "systemProgram",
                  "isMut": false,
                  "isSigner": false
              }
          ],
          "args": []
      },
      {
          "name": "processRent",
          "accounts": [
              {
                  "name": "initializer",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "taker",
                  "isMut": true,
                  "isSigner": true
              },
              {
                  "name": "takerTokenAccount",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "initializerTokenAccount",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "assetManager",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "vaultAccount",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "mint",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "edition",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "metadataAccount",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "metadataProgram",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "tokenProgram",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "associatedTokenProgram",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "systemProgram",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "rent",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "protocolState",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "treasury",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "partnerTreasury",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "partnerManager",
                  "isMut": false,
                  "isSigner": false
              }
          ],
          "args": [
              {
                  "name": "timeInMinutes",
                  "type": "u64"
              }
          ]
      },
      {
          "name": "expireRent",
          "accounts": [
              {
                  "name": "payer",
                  "isMut": true,
                  "isSigner": true
              },
              {
                  "name": "holder",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "holderTokenAccount",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "assetManager",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "vaultAccount",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "initializerTokenAccount",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "initializer",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "mint",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "edition",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "metadataAccount",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "tokenProgram",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "systemProgram",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "metadataProgram",
                  "isMut": false,
                  "isSigner": false
              }
          ],
          "args": []
      },
      {
          "name": "initBidPool",
          "accounts": [
              {
                  "name": "biddingPoolPda",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "payer",
                  "isMut": true,
                  "isSigner": true
              },
              {
                  "name": "nftCollectionAccount",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "systemProgram",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "protocolState",
                  "isMut": false,
                  "isSigner": false
              }
          ],
          "args": [
              {
                  "name": "loanDurationInMinutes",
                  "type": "u16"
              },
              {
                  "name": "gracePeriodInMinutes",
                  "type": "u16"
              },
              {
                  "name": "interestRateLender",
                  "type": "u16"
              },
              {
                  "name": "interestRateProtocol",
                  "type": "u16"
              }
          ]
      },
      {
          "name": "initBidManager",
          "accounts": [
              {
                  "name": "biddingManager",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "bidder",
                  "isMut": true,
                  "isSigner": true
              },
              {
                  "name": "biddingPoolPda",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "systemProgram",
                  "isMut": false,
                  "isSigner": false
              }
          ],
          "args": [
              {
                  "name": "biddingAmountInLamports",
                  "type": "u64"
              },
              {
                  "name": "totalBids",
                  "type": "u64"
              },
              {
                  "name": "biddingEscrowBump",
                  "type": "u8"
              }
          ]
      },
      {
          "name": "processLoan",
          "accounts": [
              {
                  "name": "borrower",
                  "isMut": true,
                  "isSigner": true
              },
              {
                  "name": "biddingManager",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "borrowerTokenAccount",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "nftEdition",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "nftMint",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "biddingPool",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "tokenMetadataAccount",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "assetManager",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "vaultAccount",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "protocolTreasury",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "protocolState",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "metadataProgram",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "tokenProgram",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "systemProgram",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "rent",
                  "isMut": false,
                  "isSigner": false
              }
          ],
          "args": []
      },
      {
          "name": "repayLoan",
          "accounts": [
              {
                  "name": "borrowerAccount",
                  "isMut": true,
                  "isSigner": true
              },
              {
                  "name": "lenderAccount",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "metadataProgram",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "biddingManager",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "borrowerTokenAccount",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "nftEdition",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "nftMint",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "tokenProgram",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "systemProgram",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "biddingPoolAccount",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "assetManager",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "tokenMetadata",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "vaultAccount",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "protocolState",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "treasury",
                  "isMut": true,
                  "isSigner": false
              }
          ],
          "args": []
      },
      {
          "name": "expireLoan",
          "accounts": [
              {
                  "name": "lenderAccount",
                  "isMut": true,
                  "isSigner": true
              },
              {
                  "name": "metadataProgram",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "biddingManager",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "assetInitializer",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "borrowerTokenAccount",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "nftEdition",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "nftMint",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "tokenProgram",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "systemProgram",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "lenderTokenAccount",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "metadataAccount",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "biddingPoolAccount",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "assetManager",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "vaultAccount",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "associatedTokenProgram",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "rent",
                  "isMut": false,
                  "isSigner": false
              }
          ],
          "args": []
      },
      {
          "name": "cancelBidPool",
          "accounts": [
              {
                  "name": "initiator",
                  "isMut": true,
                  "isSigner": true
              },
              {
                  "name": "biddingPool",
                  "isMut": true,
                  "isSigner": false
              }
          ],
          "args": []
      },
      {
          "name": "cancelBidManager",
          "accounts": [
              {
                  "name": "lenderAccount",
                  "isMut": true,
                  "isSigner": true
              },
              {
                  "name": "biddingManager",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "biddingPool",
                  "isMut": true,
                  "isSigner": false
              }
          ],
          "args": []
      }
  ],
  "accounts": [
      {
          "name": "AssetManager",
          "type": {
              "kind": "struct",
              "fields": [
                  {
                      "name": "collection",
                      "type": "publicKey"
                  },
                  {
                      "name": "fixedDuration",
                      "type": "u64"
                  },
                  {
                      "name": "holder",
                      "type": "publicKey"
                  },
                  {
                      "name": "holderTokenAccount",
                      "type": "publicKey"
                  },
                  {
                      "name": "initializerKey",
                      "type": "publicKey"
                  },
                  {
                      "name": "initializerTokenAccount",
                      "type": "publicKey"
                  },
                  {
                      "name": "loanBidManagerKey",
                      "type": "publicKey"
                  },
                  {
                      "name": "loanExpiry",
                      "type": "u64"
                  },
                  {
                      "name": "lockedInVault",
                      "type": "bool"
                  },
                  {
                      "name": "minDuration",
                      "type": "u64"
                  },
                  {
                      "name": "mint",
                      "type": "publicKey"
                  },
                  {
                      "name": "offerExpiry",
                      "type": "u64"
                  },
                  {
                      "name": "ownerRevenue",
                      "type": "u64"
                  },
                  {
                      "name": "rentExpiry",
                      "type": "u64"
                  },
                  {
                      "name": "rentIsFixed",
                      "type": "bool"
                  },
                  {
                      "name": "rate",
                      "type": "u64"
                  },
                  {
                      "name": "state",
                      "type": {
                          "defined": "AssetState"
                      }
                  },
                  {
                      "name": "trialFees",
                      "type": "u64"
                  },
                  {
                      "name": "trialType",
                      "type": {
                          "option": {
                              "defined": "TrialType"
                          }
                      }
                  },
                  {
                      "name": "vaultAccount",
                      "type": "publicKey"
                  },
                  {
                      "name": "whitelist",
                      "type": "publicKey"
                  }
              ]
          }
      },
      {
          "name": "BidPool",
          "type": {
              "kind": "struct",
              "fields": [
                  {
                      "name": "initializerKey",
                      "type": "publicKey"
                  },
                  {
                      "name": "collectionAddress",
                      "type": "publicKey"
                  },
                  {
                      "name": "biddingNftFloorPrice",
                      "type": "f32"
                  },
                  {
                      "name": "loanDurationInMinutes",
                      "type": "u64"
                  },
                  {
                      "name": "gracePeriodInMinutes",
                      "type": "u64"
                  },
                  {
                      "name": "apy",
                      "type": "f32"
                  },
                  {
                      "name": "interestRateLender",
                      "type": "f32"
                  },
                  {
                      "name": "interestRateProtocol",
                      "type": "f32"
                  },
                  {
                      "name": "totalBidManager",
                      "type": "u64"
                  },
                  {
                      "name": "lastBidLamports",
                      "type": "u64"
                  }
              ]
          }
      },
      {
          "name": "BidManager",
          "type": {
              "kind": "struct",
              "fields": [
                  {
                      "name": "bidderPubkey",
                      "type": "publicKey"
                  },
                  {
                      "name": "biddingAmountInLamports",
                      "type": "u64"
                  },
                  {
                      "name": "biddingPoolAddress",
                      "type": "publicKey"
                  },
                  {
                      "name": "biddingManagerBump",
                      "type": "u8"
                  },
                  {
                      "name": "totalBids",
                      "type": "u64"
                  },
                  {
                      "name": "pendingLoans",
                      "type": "u64"
                  }
              ]
          }
      },
      {
          "name": "ProtocolState",
          "type": {
              "kind": "struct",
              "fields": [
                  {
                      "name": "percentageFees",
                      "type": "f64"
                  },
                  {
                      "name": "treasuryAddress",
                      "type": "publicKey"
                  },
                  {
                      "name": "adminAddress",
                      "type": "publicKey"
                  }
              ]
          }
      },
      {
          "name": "PartnerManager",
          "type": {
              "kind": "struct",
              "fields": [
                  {
                      "name": "treasuryAddress",
                      "type": "publicKey"
                  },
                  {
                      "name": "percentageFees",
                      "type": "f64"
                  },
                  {
                      "name": "collectionMint",
                      "type": "publicKey"
                  }
              ]
          }
      }
  ],
  "types": [
      {
          "name": "AssetState",
          "type": {
              "kind": "enum",
              "variants": [
                  {
                      "name": "Init"
                  },
                  {
                      "name": "Stale"
                  },
                  {
                      "name": "Rent"
                  },
                  {
                      "name": "Loan"
                  },
                  {
                      "name": "RentAndLoan"
                  },
                  {
                      "name": "StaleAndLoan"
                  }
              ]
          }
      },
      {
          "name": "TrialType",
          "type": {
              "kind": "enum",
              "variants": [
                  {
                      "name": "TimeBased"
                  },
                  {
                      "name": "UseBased"
                  }
              ]
          }
      }
  ],
  "events": [
      {
          "name": "TreasuryAddressUpdated",
          "fields": [
              {
                  "name": "admin",
                  "type": "publicKey",
                  "index": false
              },
              {
                  "name": "treasury",
                  "type": "publicKey",
                  "index": false
              }
          ]
      }
  ],
  "errors": [
      {
          "code": 6000,
          "name": "PublicKeyMismatch",
          "msg": "Public Key Mismatch"
      },
      {
          "code": 6001,
          "name": "AmountMismatch",
          "msg": "Payment Amount Mismatch"
      },
      {
          "code": 6002,
          "name": "TimeNotValid",
          "msg": "Time Not In Range"
      },
      {
          "code": 6003,
          "name": "RentNotAvailable",
          "msg": "NFT Not Available For Rent"
      },
      {
          "code": 6004,
          "name": "NFTNotOnLoan",
          "msg": "NFT Not On Loan"
      },
      {
          "code": 6005,
          "name": "NFTAlreadyLend",
          "msg": "Loan Already Taken for the NFT"
      },
      {
          "code": 6006,
          "name": "NFTAlreadyRent",
          "msg": "Rent Already Taken for the NFT"
      },
      {
          "code": 6007,
          "name": "LoanExpiryInvalid",
          "msg": "Loan Expiry must be more than Rent Expiry"
      },
      {
          "code": 6008,
          "name": "RentalNotExpired",
          "msg": "Rental Is Not Expired Yet"
      },
      {
          "code": 6009,
          "name": "AccountDataEmpty",
          "msg": "Account Data Is Empty"
      },
      {
          "code": 6010,
          "name": "RenteeNotWhitelisted",
          "msg": "Rentee Is Not Whitelisted"
      },
      {
          "code": 6011,
          "name": "NotLoanExpiryYet",
          "msg": "Loan period has not expired"
      },
      {
          "code": 6012,
          "name": "NFTDoesNotBelongsToCollection",
          "msg": "NFT doesn't belong to collection"
      },
      {
          "code": 6013,
          "name": "NotEnoughSolToRepayLoan",
          "msg": "Not enough Sol to Repay loan"
      },
      {
          "code": 6014,
          "name": "InvalidTreasuryAccount",
          "msg": "Invalid Treasury Account"
      },
      {
          "code": 6015,
          "name": "TotalBidsExpired",
          "msg": "Total Bids Expired"
      },
      {
          "code": 6016,
          "name": "InstructionMismatch",
          "msg": "Instruction Details Mismatch"
      },
      {
          "code": 6017,
          "name": "ActiveBidEscrow",
          "msg": "Cant cancel with active bid escrows"
      },
      {
          "code": 6018,
          "name": "NotInClaimableState",
          "msg": "Not In Claimable State"
      },
      {
          "code": 6019,
          "name": "NotInitializerKey",
          "msg": "Only initializer Can Cancel before Offer Expiry"
      },
      {
          "code": 6020,
          "name": "AccountNotInitialized",
          "msg": "Account not Initialized"
      },
      {
          "code": 6021,
          "name": "InvalidCollectionMint",
          "msg": "Mint address isn't a collection mint address"
      }
  ]
};

export const IDL: StreammoneyNft = {
  "version": "0.1.0",
  "name": "streammoney_nft",
  "docs": [
      "stream money nft program entrypoint"
  ],
  "instructions": [
      {
          "name": "initProtocolState",
          "accounts": [
              {
                  "name": "admin",
                  "isMut": true,
                  "isSigner": true,
                  "docs": [
                      "CHECK - we are setting this ourselves"
                  ]
              },
              {
                  "name": "protocolState",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "systemProgram",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "treasury",
                  "isMut": false,
                  "isSigner": false,
                  "docs": [
                      "CHECK - we are setting this"
                  ]
              }
          ],
          "args": [
              {
                  "name": "protocolFeePercentage",
                  "type": "f64"
              }
          ]
      },
      {
          "name": "updateProtocolState",
          "accounts": [
              {
                  "name": "admin",
                  "isMut": true,
                  "isSigner": true,
                  "docs": [
                      "CHECK - we are setting this ourselves"
                  ]
              },
              {
                  "name": "protocolState",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "systemProgram",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "treasury",
                  "isMut": false,
                  "isSigner": false,
                  "docs": [
                      "CHECK - we are setting this"
                  ]
              }
          ],
          "args": [
              {
                  "name": "newTreasury",
                  "type": {
                      "option": "publicKey"
                  }
              },
              {
                  "name": "newFees",
                  "type": {
                      "option": "f64"
                  }
              },
              {
                  "name": "newAdmin",
                  "type": {
                      "option": "publicKey"
                  }
              }
          ]
      },
      {
          "name": "initPartner",
          "accounts": [
              {
                  "name": "signer",
                  "isMut": true,
                  "isSigner": true,
                  "docs": [
                      "CHECK - we are setting this ourselves"
                  ]
              },
              {
                  "name": "partnerManager",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "collectionMint",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "protocolState",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "metadataAccount",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "systemProgram",
                  "isMut": false,
                  "isSigner": false
              }
          ],
          "args": [
              {
                  "name": "partnerFeesPercentage",
                  "type": {
                      "option": "f64"
                  }
              },
              {
                  "name": "partnerTreasury",
                  "type": {
                      "option": "publicKey"
                  }
              }
          ]
      },
      {
          "name": "initRent",
          "accounts": [
              {
                  "name": "initializer",
                  "isMut": true,
                  "isSigner": true
              },
              {
                  "name": "mint",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "assetManager",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "vaultAccount",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "initializerDepositTokenAccount",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "tokenMetadataAccount",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "metadataProgram",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "whitelist",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "edition",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "systemProgram",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "rent",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "tokenProgram",
                  "isMut": false,
                  "isSigner": false
              }
          ],
          "args": [
              {
                  "name": "rate",
                  "type": "u64"
              },
              {
                  "name": "offerDurationInMinutes",
                  "type": "u64"
              },
              {
                  "name": "fixedDurationInMinutes",
                  "type": "u64"
              },
              {
                  "name": "rentIsFixed",
                  "type": "bool"
              },
              {
                  "name": "ownerRevenue",
                  "type": "u64"
              },
              {
                  "name": "trialType",
                  "type": {
                      "option": "string"
                  }
              },
              {
                  "name": "trialFees",
                  "type": {
                      "option": "u64"
                  }
              }
          ]
      },
      {
          "name": "cancelRent",
          "accounts": [
              {
                  "name": "initializer",
                  "isMut": true,
                  "isSigner": true
              },
              {
                  "name": "mint",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "metadataProgram",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "vaultAccount",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "initializerDepositTokenAccount",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "assetManager",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "tokenProgram",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "edition",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "metadataAccount",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "systemProgram",
                  "isMut": false,
                  "isSigner": false
              }
          ],
          "args": []
      },
      {
          "name": "processRent",
          "accounts": [
              {
                  "name": "initializer",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "taker",
                  "isMut": true,
                  "isSigner": true
              },
              {
                  "name": "takerTokenAccount",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "initializerTokenAccount",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "assetManager",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "vaultAccount",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "mint",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "edition",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "metadataAccount",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "metadataProgram",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "tokenProgram",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "associatedTokenProgram",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "systemProgram",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "rent",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "protocolState",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "treasury",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "partnerTreasury",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "partnerManager",
                  "isMut": false,
                  "isSigner": false
              }
          ],
          "args": [
              {
                  "name": "timeInMinutes",
                  "type": "u64"
              }
          ]
      },
      {
          "name": "expireRent",
          "accounts": [
              {
                  "name": "payer",
                  "isMut": true,
                  "isSigner": true
              },
              {
                  "name": "holder",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "holderTokenAccount",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "assetManager",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "vaultAccount",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "initializerTokenAccount",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "initializer",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "mint",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "edition",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "metadataAccount",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "tokenProgram",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "systemProgram",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "metadataProgram",
                  "isMut": false,
                  "isSigner": false
              }
          ],
          "args": []
      },
      {
          "name": "initBidPool",
          "accounts": [
              {
                  "name": "biddingPoolPda",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "payer",
                  "isMut": true,
                  "isSigner": true
              },
              {
                  "name": "nftCollectionAccount",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "systemProgram",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "protocolState",
                  "isMut": false,
                  "isSigner": false
              }
          ],
          "args": [
              {
                  "name": "loanDurationInMinutes",
                  "type": "u16"
              },
              {
                  "name": "gracePeriodInMinutes",
                  "type": "u16"
              },
              {
                  "name": "interestRateLender",
                  "type": "u16"
              },
              {
                  "name": "interestRateProtocol",
                  "type": "u16"
              }
          ]
      },
      {
          "name": "initBidManager",
          "accounts": [
              {
                  "name": "biddingManager",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "bidder",
                  "isMut": true,
                  "isSigner": true
              },
              {
                  "name": "biddingPoolPda",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "systemProgram",
                  "isMut": false,
                  "isSigner": false
              }
          ],
          "args": [
              {
                  "name": "biddingAmountInLamports",
                  "type": "u64"
              },
              {
                  "name": "totalBids",
                  "type": "u64"
              },
              {
                  "name": "biddingEscrowBump",
                  "type": "u8"
              }
          ]
      },
      {
          "name": "processLoan",
          "accounts": [
              {
                  "name": "borrower",
                  "isMut": true,
                  "isSigner": true
              },
              {
                  "name": "biddingManager",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "borrowerTokenAccount",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "nftEdition",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "nftMint",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "biddingPool",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "tokenMetadataAccount",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "assetManager",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "vaultAccount",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "protocolTreasury",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "protocolState",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "metadataProgram",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "tokenProgram",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "systemProgram",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "rent",
                  "isMut": false,
                  "isSigner": false
              }
          ],
          "args": []
      },
      {
          "name": "repayLoan",
          "accounts": [
              {
                  "name": "borrowerAccount",
                  "isMut": true,
                  "isSigner": true
              },
              {
                  "name": "lenderAccount",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "metadataProgram",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "biddingManager",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "borrowerTokenAccount",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "nftEdition",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "nftMint",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "tokenProgram",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "systemProgram",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "biddingPoolAccount",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "assetManager",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "tokenMetadata",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "vaultAccount",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "protocolState",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "treasury",
                  "isMut": true,
                  "isSigner": false
              }
          ],
          "args": []
      },
      {
          "name": "expireLoan",
          "accounts": [
              {
                  "name": "lenderAccount",
                  "isMut": true,
                  "isSigner": true
              },
              {
                  "name": "metadataProgram",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "biddingManager",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "assetInitializer",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "borrowerTokenAccount",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "nftEdition",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "nftMint",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "tokenProgram",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "systemProgram",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "lenderTokenAccount",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "metadataAccount",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "biddingPoolAccount",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "assetManager",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "vaultAccount",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "associatedTokenProgram",
                  "isMut": false,
                  "isSigner": false
              },
              {
                  "name": "rent",
                  "isMut": false,
                  "isSigner": false
              }
          ],
          "args": []
      },
      {
          "name": "cancelBidPool",
          "accounts": [
              {
                  "name": "initiator",
                  "isMut": true,
                  "isSigner": true
              },
              {
                  "name": "biddingPool",
                  "isMut": true,
                  "isSigner": false
              }
          ],
          "args": []
      },
      {
          "name": "cancelBidManager",
          "accounts": [
              {
                  "name": "lenderAccount",
                  "isMut": true,
                  "isSigner": true
              },
              {
                  "name": "biddingManager",
                  "isMut": true,
                  "isSigner": false
              },
              {
                  "name": "biddingPool",
                  "isMut": true,
                  "isSigner": false
              }
          ],
          "args": []
      }
  ],
  "accounts": [
      {
          "name": "AssetManager",
          "type": {
              "kind": "struct",
              "fields": [
                  {
                      "name": "collection",
                      "type": "publicKey"
                  },
                  {
                      "name": "fixedDuration",
                      "type": "u64"
                  },
                  {
                      "name": "holder",
                      "type": "publicKey"
                  },
                  {
                      "name": "holderTokenAccount",
                      "type": "publicKey"
                  },
                  {
                      "name": "initializerKey",
                      "type": "publicKey"
                  },
                  {
                      "name": "initializerTokenAccount",
                      "type": "publicKey"
                  },
                  {
                      "name": "loanBidManagerKey",
                      "type": "publicKey"
                  },
                  {
                      "name": "loanExpiry",
                      "type": "u64"
                  },
                  {
                      "name": "lockedInVault",
                      "type": "bool"
                  },
                  {
                      "name": "minDuration",
                      "type": "u64"
                  },
                  {
                      "name": "mint",
                      "type": "publicKey"
                  },
                  {
                      "name": "offerExpiry",
                      "type": "u64"
                  },
                  {
                      "name": "ownerRevenue",
                      "type": "u64"
                  },
                  {
                      "name": "rentExpiry",
                      "type": "u64"
                  },
                  {
                      "name": "rentIsFixed",
                      "type": "bool"
                  },
                  {
                      "name": "rate",
                      "type": "u64"
                  },
                  {
                      "name": "state",
                      "type": {
                          "defined": "AssetState"
                      }
                  },
                  {
                      "name": "trialFees",
                      "type": "u64"
                  },
                  {
                      "name": "trialType",
                      "type": {
                          "option": {
                              "defined": "TrialType"
                          }
                      }
                  },
                  {
                      "name": "vaultAccount",
                      "type": "publicKey"
                  },
                  {
                      "name": "whitelist",
                      "type": "publicKey"
                  }
              ]
          }
      },
      {
          "name": "BidPool",
          "type": {
              "kind": "struct",
              "fields": [
                  {
                      "name": "initializerKey",
                      "type": "publicKey"
                  },
                  {
                      "name": "collectionAddress",
                      "type": "publicKey"
                  },
                  {
                      "name": "biddingNftFloorPrice",
                      "type": "f32"
                  },
                  {
                      "name": "loanDurationInMinutes",
                      "type": "u64"
                  },
                  {
                      "name": "gracePeriodInMinutes",
                      "type": "u64"
                  },
                  {
                      "name": "apy",
                      "type": "f32"
                  },
                  {
                      "name": "interestRateLender",
                      "type": "f32"
                  },
                  {
                      "name": "interestRateProtocol",
                      "type": "f32"
                  },
                  {
                      "name": "totalBidManager",
                      "type": "u64"
                  },
                  {
                      "name": "lastBidLamports",
                      "type": "u64"
                  }
              ]
          }
      },
      {
          "name": "BidManager",
          "type": {
              "kind": "struct",
              "fields": [
                  {
                      "name": "bidderPubkey",
                      "type": "publicKey"
                  },
                  {
                      "name": "biddingAmountInLamports",
                      "type": "u64"
                  },
                  {
                      "name": "biddingPoolAddress",
                      "type": "publicKey"
                  },
                  {
                      "name": "biddingManagerBump",
                      "type": "u8"
                  },
                  {
                      "name": "totalBids",
                      "type": "u64"
                  },
                  {
                      "name": "pendingLoans",
                      "type": "u64"
                  }
              ]
          }
      },
      {
          "name": "ProtocolState",
          "type": {
              "kind": "struct",
              "fields": [
                  {
                      "name": "percentageFees",
                      "type": "f64"
                  },
                  {
                      "name": "treasuryAddress",
                      "type": "publicKey"
                  },
                  {
                      "name": "adminAddress",
                      "type": "publicKey"
                  }
              ]
          }
      },
      {
          "name": "PartnerManager",
          "type": {
              "kind": "struct",
              "fields": [
                  {
                      "name": "treasuryAddress",
                      "type": "publicKey"
                  },
                  {
                      "name": "percentageFees",
                      "type": "f64"
                  },
                  {
                      "name": "collectionMint",
                      "type": "publicKey"
                  }
              ]
          }
      }
  ],
  "types": [
      {
          "name": "AssetState",
          "type": {
              "kind": "enum",
              "variants": [
                  {
                      "name": "Init"
                  },
                  {
                      "name": "Stale"
                  },
                  {
                      "name": "Rent"
                  },
                  {
                      "name": "Loan"
                  },
                  {
                      "name": "RentAndLoan"
                  },
                  {
                      "name": "StaleAndLoan"
                  }
              ]
          }
      },
      {
          "name": "TrialType",
          "type": {
              "kind": "enum",
              "variants": [
                  {
                      "name": "TimeBased"
                  },
                  {
                      "name": "UseBased"
                  }
              ]
          }
      }
  ],
  "events": [
      {
          "name": "TreasuryAddressUpdated",
          "fields": [
              {
                  "name": "admin",
                  "type": "publicKey",
                  "index": false
              },
              {
                  "name": "treasury",
                  "type": "publicKey",
                  "index": false
              }
          ]
      }
  ],
  "errors": [
      {
          "code": 6000,
          "name": "PublicKeyMismatch",
          "msg": "Public Key Mismatch"
      },
      {
          "code": 6001,
          "name": "AmountMismatch",
          "msg": "Payment Amount Mismatch"
      },
      {
          "code": 6002,
          "name": "TimeNotValid",
          "msg": "Time Not In Range"
      },
      {
          "code": 6003,
          "name": "RentNotAvailable",
          "msg": "NFT Not Available For Rent"
      },
      {
          "code": 6004,
          "name": "NFTNotOnLoan",
          "msg": "NFT Not On Loan"
      },
      {
          "code": 6005,
          "name": "NFTAlreadyLend",
          "msg": "Loan Already Taken for the NFT"
      },
      {
          "code": 6006,
          "name": "NFTAlreadyRent",
          "msg": "Rent Already Taken for the NFT"
      },
      {
          "code": 6007,
          "name": "LoanExpiryInvalid",
          "msg": "Loan Expiry must be more than Rent Expiry"
      },
      {
          "code": 6008,
          "name": "RentalNotExpired",
          "msg": "Rental Is Not Expired Yet"
      },
      {
          "code": 6009,
          "name": "AccountDataEmpty",
          "msg": "Account Data Is Empty"
      },
      {
          "code": 6010,
          "name": "RenteeNotWhitelisted",
          "msg": "Rentee Is Not Whitelisted"
      },
      {
          "code": 6011,
          "name": "NotLoanExpiryYet",
          "msg": "Loan period has not expired"
      },
      {
          "code": 6012,
          "name": "NFTDoesNotBelongsToCollection",
          "msg": "NFT doesn't belong to collection"
      },
      {
          "code": 6013,
          "name": "NotEnoughSolToRepayLoan",
          "msg": "Not enough Sol to Repay loan"
      },
      {
          "code": 6014,
          "name": "InvalidTreasuryAccount",
          "msg": "Invalid Treasury Account"
      },
      {
          "code": 6015,
          "name": "TotalBidsExpired",
          "msg": "Total Bids Expired"
      },
      {
          "code": 6016,
          "name": "InstructionMismatch",
          "msg": "Instruction Details Mismatch"
      },
      {
          "code": 6017,
          "name": "ActiveBidEscrow",
          "msg": "Cant cancel with active bid escrows"
      },
      {
          "code": 6018,
          "name": "NotInClaimableState",
          "msg": "Not In Claimable State"
      },
      {
          "code": 6019,
          "name": "NotInitializerKey",
          "msg": "Only initializer Can Cancel before Offer Expiry"
      },
      {
          "code": 6020,
          "name": "AccountNotInitialized",
          "msg": "Account not Initialized"
      },
      {
          "code": 6021,
          "name": "InvalidCollectionMint",
          "msg": "Mint address isn't a collection mint address"
      }
  ]
};