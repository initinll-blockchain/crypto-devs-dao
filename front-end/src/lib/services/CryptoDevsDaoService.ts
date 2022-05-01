import { BigNumber, Contract, ethers, Signer, type ContractInterface } from 'ethers';
import CRYPTODEVS_DAO_ABI from '$lib/abi/CryptoDevsDAO.json';
import CRYPTODEVS_NFT_ABI from '$lib/abi/CryptoDevsNFT.json';
import { Constants } from '$lib/helpers/Constants';
import { Networks } from "$lib/helpers/Networks";
import type { Proposal } from "$lib/models/proposal";

declare const window: any;

export async function checkIfWalletIsConnected(): Promise<string> {
    let account:string = "";

    try {
        const { ethereum } = window;

        if (!ethereum) {
            console.log("Make sure you have metamask!");
            return "";
        } else {
            console.log("We have the ethereum object", ethereum);
        }

        const accounts: string[] = await ethereum.request({ method: "eth_accounts" });

        if (accounts.length !== 0) {
            account = accounts[0];
            console.log("Found an authorized account:", account);
            return account;            
        } else {
            console.log("No authorized account found")
        }
    } catch (error) {
        throw error;
    }
    return account;
}

export async function connectWallet(): Promise<string> {
    let account:string = "";

    try {
        const { ethereum } = window;

        if (!ethereum) {
            alert("Make sure you have metamask!");
            return "";
        }

        const accounts: string[] = await ethereum.request({ method: "eth_requestAccounts" });

        if (accounts.length !== 0) {
            account = accounts[0];
            console.log("Found an authorized account:", account);
            return account;            
        } else {
            console.log("No authorized account found")
        }     
    } catch (error) {
        throw error;
    }

    return account;
}

export async function getNetwork(): Promise<string> {
    let network: string;

     try {
        const { ethereum } = window;

        if (!ethereum) {
            alert("Make sure you have metamask!");
            return "";
        }

        const chainId = await ethereum.request({ method: 'eth_chainId'});        
        network = Networks[chainId];
    } catch (error) {
        throw error;
    }

    return network;
}

export async function switchNetwork(chainId: string): Promise<void> {
    try {
        const { ethereum } = window;

        if (ethereum) {
            await ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: chainId }],
            });
        }
        else {
            alert('MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html');
        }
    } catch (error) {
        throw error;
    }
}

export function onChainChanged(handleChainChanged: any){
    try {
        const { ethereum } = window;

        if (!ethereum) {
            alert("Make sure you have metamask!");
            return;
        }

        ethereum.on('chainChanged', handleChainChanged);
    } catch (error) {
        throw error;
    }
}

export async function getDAOTreasuryBalance(): Promise<BigNumber> {
    let balance: BigNumber;

    try {
        const { ethereum } = window;

        if (ethereum) {
            const provider: ethers.providers.Web3Provider = new ethers.providers.Web3Provider(ethereum);
            balance = await provider.getBalance(Constants.CRYPTODEVS_DAO_CONTRACT_ADDRESS);        
        }        
    } catch (error) {
        throw error;
    }

    return balance;
}

export async function getNumProposalsInDAO(): Promise<string> {
    let numProposalsInDAO:string;
    try {
        const daoContract = getContract_dao();
        numProposalsInDAO = await daoContract.numProposals();
    } catch (error) {
        throw error;
    }
    return numProposalsInDAO;
}

export async function getUserNFTBalance(): Promise<string> {
    let nftBalance:string;
    try {
        const signer = getSigner();
        const nftContract = getContract_nft();
        nftBalance = await nftContract.balanceOf(signer.getAddress());
    } catch (error) {
        throw error;
    }
    return nftBalance;
}

export async function createProposal(fakeNftTokenId: any): Promise<void> {
    try {
        const daoContract = getContract_dao();
        const txn = await daoContract.createProposal(fakeNftTokenId);
        await txn.wait();
    } catch (error) {
        throw error;
    }
}

export async function fetchProposalById(id:any): Promise<Proposal> {
    try {
        const daoContract = getContract_dao();
        const proposal = await daoContract.proposals(id);
        const parsedProposal: Proposal = {
            proposalId: id,
            nftTokenId: proposal.nftTokenId.toString(),
            deadline: new Date(parseInt(proposal.deadline.toString()) * 1000),
            yayVotes: proposal.yayVotes.toString(),
            nayVotes: proposal.nayVotes.toString(),
            executed: proposal.executed,
          };
          return parsedProposal;
    } catch (error) {
        throw error;
    }
}

export async function fetchAllProposals(numProposals: any) : Promise<Array<Proposal>> {
    try {
        let proposals:Array<Proposal> = [];
        for (let i = 0; i < numProposals; i++) {
          const proposal: Proposal = await fetchProposalById(i);          
          proposals.push(proposal);
        }        
        return proposals;
    } catch (error) {
        throw error;
    }
}

export async function voteOnProposal(proposalId:number, _vote: string): Promise<void> {
    try {
        const daoContract = getContract_dao();

        let vote = _vote === "YAY" ? 0 : 1;
        const txn = await daoContract.voteOnProposal(proposalId, vote);
        await txn.wait();
    } catch (error) {
        throw error;
    }
}

export async function executeProposal(proposalId:number): Promise<void> {
    try {
        const daoContract = getContract_dao();
        const txn = await daoContract.executeProposal(proposalId);
        await txn.wait();
    } catch (error) {
        throw error; 
    }
}

function getContract_dao(): Contract {
    let cryptoDevsDaoContract: Contract;

    try {
        const signer: Signer = getSigner();
        let contractABI: ContractInterface = CRYPTODEVS_DAO_ABI.abi;
        let contractAddress: string = Constants.CRYPTODEVS_DAO_CONTRACT_ADDRESS;

        if (signer) {
            cryptoDevsDaoContract = new ethers.Contract(contractAddress, contractABI, signer);
            console.log("CryptoDevsDaoContract", cryptoDevsDaoContract.address);
        }
    } catch (error) {
        console.log("getContract_dao", error);
    }

    return cryptoDevsDaoContract;
}

function getContract_nft(): Contract {
    let cryptoDevsNftContract: Contract;

    try {
        const signer: Signer = getSigner();
        let contractABI: ContractInterface = CRYPTODEVS_NFT_ABI.abi;
        let contractAddress: string = Constants.CRYPTODEVS_NFT_CONTRACT_ADDRESS;

        if (signer) {
            cryptoDevsNftContract = new ethers.Contract(contractAddress, contractABI, signer);
            console.log("CryptoDevsNftContract", cryptoDevsNftContract.address);
        }
    } catch (error) {
        console.log("getContract_nft", error);
    }

    return cryptoDevsNftContract;
}

function getSigner(): Signer {
    let signer: Signer;

    try {
        const { ethereum } = window;

        if (ethereum) {
            const provider: ethers.providers.Web3Provider = new ethers.providers.Web3Provider(ethereum);
            signer = provider.getSigner();            
        }        
    } catch (error) {
        console.log("getSigner", error);
    }

    return signer;
}