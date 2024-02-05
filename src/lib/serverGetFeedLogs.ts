// TODO: delete this file
import "server-only";

import { createPublicClient, http, parseAbi, type PublicClient, type Transport, type Chain } from 'viem'
import { optimism } from "viem/chains";
import { OptimismContracts } from "@/lib/contracts/contracts";

const alchemyId = process.env.NEXT_PUBLIC_ALCHEMY_ID!;
const getContractAddresses = () => {
    const contractAdresses = [];
    for (const [key, value] of Object.entries(OptimismContracts)) {
        contractAdresses.push(value.address);
    }
    return contractAdresses as `0x${string}`[];
}


// TODO: frh -> go back to db style with 5 events and see if there are built queries already that could work for us
const fetchLogs = async (publicClient: PublicClient<Transport, Chain>, fromBlock: bigint, toBlock: bigint) => {
    const logs = await publicClient.getLogs({
        address: getContractAddresses(),
        events: parseAbi([
            // Should be done together DelegateChanged, DelegateVotesChanged
            // 'event DelegateChanged(address indexed delegator, address indexed fromDelegate, address indexed toDelegate)',
            // 'event DelegateVotesChanged(address indexed delegate, uint256 previousBalance, uint256 newBalance)'
            // 'event ProposalCreated(uint256 indexed proposalId, address indexed proposer, address indexed votingModule, bytes proposalData, uint256 startBlock, uint256 endBlock, string description, uint8 proposalType)',
            // 'event ProposalCreated(uint256 indexed proposalId, address indexed proposer, address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, uint256 startBlock, uint256 endBlock, string description, uint8 proposalType)',
            // 'event ProposalCreated(uint256 proposalId, address proposer, address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, uint256 startBlock, uint256 endBlock, string description)',
            // 'event ProposalCreated(uint256 proposalId, address proposer, address votingModule, bytes proposalData, uint256 startBlock, uint256 endBlock, string description)',
            'event VoteCast(address indexed proxy, address indexed voter, address[] authority, uint256 proposalId, uint8 support)',
            'event VoteCast(address indexed voter, uint256 proposalId, uint8 support, uint256 weight, string reason)',
            'event VotesCast(address[] proxies, address indexed voter, address[][] authorities, uint256 proposalId, uint8 support)',
            'event VoteCastWithParams(address indexed voter, uint256 proposalId, uint8 support, uint256 weight, string reason, bytes params)'
            // @ts-ignore
        ]).concat([
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
                        "components": [
                            {
                                "internalType": "uint8",
                                "name": "maxRedelegations",
                                "type": "uint8"
                            },
                            {
                                "internalType": "uint16",
                                "name": "blocksBeforeVoteCloses",
                                "type": "uint16"
                            },
                            {
                                "internalType": "uint32",
                                "name": "notValidBefore",
                                "type": "uint32"
                            },
                            {
                                "internalType": "uint32",
                                "name": "notValidAfter",
                                "type": "uint32"
                            },
                            {
                                "internalType": "address",
                                "name": "customRule",
                                "type": "address"
                            },
                            {
                                "internalType": "enum AllowanceType",
                                "name": "allowanceType",
                                "type": "uint8"
                            },
                            {
                                "internalType": "uint256",
                                "name": "allowance",
                                "type": "uint256"
                            }
                        ],
                        "indexed": false,
                        "internalType": "struct SubdelegationRules",
                        "name": "subdelegationRules",
                        "type": "tuple"
                    }
                ],
                "name": "SubDelegation",
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
                        "indexed": false,
                        "internalType": "address[]",
                        "name": "to",
                        "type": "address[]"
                    },
                    {
                        "components": [
                            {
                                "internalType": "uint8",
                                "name": "maxRedelegations",
                                "type": "uint8"
                            },
                            {
                                "internalType": "uint16",
                                "name": "blocksBeforeVoteCloses",
                                "type": "uint16"
                            },
                            {
                                "internalType": "uint32",
                                "name": "notValidBefore",
                                "type": "uint32"
                            },
                            {
                                "internalType": "uint32",
                                "name": "notValidAfter",
                                "type": "uint32"
                            },
                            {
                                "internalType": "address",
                                "name": "customRule",
                                "type": "address"
                            },
                            {
                                "internalType": "enum AllowanceType",
                                "name": "allowanceType",
                                "type": "uint8"
                            },
                            {
                                "internalType": "uint256",
                                "name": "allowance",
                                "type": "uint256"
                            }
                        ],
                        "indexed": false,
                        "internalType": "struct SubdelegationRules",
                        "name": "subdelegationRules",
                        "type": "tuple"
                    }
                ],
                "name": "SubDelegations",
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
                        "indexed": false,
                        "internalType": "address[]",
                        "name": "to",
                        "type": "address[]"
                    },
                    {
                        "components": [
                            {
                                "internalType": "uint8",
                                "name": "maxRedelegations",
                                "type": "uint8"
                            },
                            {
                                "internalType": "uint16",
                                "name": "blocksBeforeVoteCloses",
                                "type": "uint16"
                            },
                            {
                                "internalType": "uint32",
                                "name": "notValidBefore",
                                "type": "uint32"
                            },
                            {
                                "internalType": "uint32",
                                "name": "notValidAfter",
                                "type": "uint32"
                            },
                            {
                                "internalType": "address",
                                "name": "customRule",
                                "type": "address"
                            },
                            {
                                "internalType": "enum AllowanceType",
                                "name": "allowanceType",
                                "type": "uint8"
                            },
                            {
                                "internalType": "uint256",
                                "name": "allowance",
                                "type": "uint256"
                            }
                        ],
                        "indexed": false,
                        "internalType": "struct SubdelegationRules[]",
                        "name": "subdelegationRules",
                        "type": "tuple[]"
                    }
                ],
                "name": "SubDelegations",
                "type": "event"
            },
        ]),
        fromBlock: fromBlock,
        toBlock: toBlock
    });

    if (logs.length < 20) {
        // TODO: frh -> configure this depending on the event, for delegation and subdelegation is different
        let _fromBlock = fromBlock > 2000n ? fromBlock - 2000n : 0n;
        return await fetchLogs(publicClient, _fromBlock, toBlock - 2000n)
    } else {
        return logs;
    }
}

export default async function getFeedLogs() {
    console.time("answer time");
    console.timeLog("answer time");
    console.log("hola 1");
    const publicClient = createPublicClient({
        chain: optimism,
        transport: http(`https://opt-mainnet.g.alchemy.com/v2/${alchemyId}`)
    }) as PublicClient<Transport, Chain>;

    // TODO: frh -> delete this if not needed
    const block = await publicClient.getBlock();
    let { number: toBlock } = block;
    //  You can make eth_getLogs requests with up to a 2K block range and no limit on the response size
    let fromBlock = toBlock - 2000n;
    console.timeLog("answer time");
    console.log("hola 2");
    const logs = await fetchLogs(publicClient, fromBlock, toBlock);
    console.timeEnd("answer time");
    console.log("hola 3");
    return logs;
    // const _logs = logs.map(async (log) => {
    //     const { timestamp } = await publicClient.getBlock({ blockNumber: log.blockNumber });
    //     return {
    //         ...log,
    //         timestamp
    //     }
    // });

    // return await Promise.all(_logs);
}

// Other OP events we are not tracking
// 'event AdminChanged(address previousAdmin, address newAdmin)',
// 'event Approval(address indexed owner, address indexed spender, uint256 value)',
// 'event BeaconUpgraded(address indexed beacon)', // Beacon has never been upgraded yet
// 'event DelegateVotesChanged(address indexed delegate, uint256 previousBalance, uint256 newBalance)'
// 'event Initialized(uint8 version)',
// 'event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)',
// 'event Paused(address account)',
// 'event ProposalCanceled(uint256 proposalId)',
// 'event ProposalDeadlineUpdated(uint256 proposalId, uint64 deadline)',
// 'event ProposalExecuted(uint256 proposalId)',
// 'event ProposalThresholdSet(uint256 oldProposalThreshold, uint256 newProposalThreshold)',
// 'event ProposalTypeSet(uint256 indexed proposalTypeId, uint16 quorum, uint16 approvalThreshold, string name)',
// 'event ProposalTypeUpdated(uint256 indexed proposalId, uint8 proposalType)', // Not on center db since there have been 0 events
// 'event QuorumNumeratorUpdated(uint256 oldQuorumNumerator, uint256 newQuorumNumerator)',
// 'event Transfer(address indexed from, address indexed to, uint256 value)',
// 'event Unpaused(address account)',
// 'event Upgraded(address indexed implementation)',
// 'event VotingDelaySet(uint256 oldVotingDelay, uint256 newVotingDelay)',
// 'event VotingPeriodSet(uint256 oldVotingPeriod, uint256 newVotingPeriod)'