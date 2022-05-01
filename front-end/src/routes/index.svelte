<script lang="ts">
    import { onMount } from 'svelte';
    import { formatEther } from 'ethers/lib/utils';

	import '../app.css';

    import cryptoDevs from '$lib/assets/0.svg';
    import type { Proposal } from '$lib/models/proposal';    

    import { connectWallet,
        checkIfWalletIsConnected,
		getNetwork,
		switchNetwork,
		onChainChanged,
        getUserNFTBalance,
        getDAOTreasuryBalance,
        getNumProposalsInDAO,
        createProposal,
        fetchAllProposals,
        voteOnProposal,
        executeProposal
     } from "$lib/services/CryptoDevsDaoService";
import { logger } from 'ethers';

    let loading: boolean = false;
	let account: string;
	let network: string;

    let selectedTab:string;

    //$: console.log(selectedTab);

    let nftBalance:number;
    let treasuryBalance: string;
    let fakeNftTokenId: number;
    let numProposals: number;
    let proposals: Array<Proposal>;

    onMount(async () => {
		try {            
            loading = true;
			account = await checkIfWalletIsConnected();
			network = await getNetwork();
			onChainChanged(handleChainChanged);
			await loadData();
            loading = false;
		} catch (error) {
			console.log('OnMount Error', error);
		}
	});

    async function connect() {
        loading = true;
		account = await connectWallet();
        await loadData();        
        loading = false;
	}

    function handleChainChanged(_chainId: any) {
		window.location.reload();
	}

    async function loadData() {
        nftBalance = await getUserNFTBalance();
        treasuryBalance = formatEther(await getDAOTreasuryBalance());
        numProposals = await getNumProposalsInDAO();        
        proposals = await fetchAllProposals(numProposals);
    }

    async function vote(proposalId:number, _vote: string) {        
        loading = true;
        await voteOnProposal(proposalId, _vote);
        numProposals = await getNumProposalsInDAO();
        proposals = await fetchAllProposals(numProposals);
        loading = false;
    }

    async function execute(proposalId:number) {
        await executeProposal(proposalId);
        numProposals = await getNumProposalsInDAO();
        proposals = await fetchAllProposals(numProposals);
    }
    async function create(fakeNftTokenId:number) {
        loading = true;
        await createProposal(fakeNftTokenId)
        await loadData();
        loading = false;
    }

</script>

<div>
    <div class="main">
      <div>
        <h1 class="title">Welcome to Crypto Devs!</h1>
        <div class="description">Welcome to the DAO!</div>
        <div class="description">
          Your CryptoDevs NFT Balance: {nftBalance}
          <br />
          Treasury Balance: {treasuryBalance} ETH
          <br />
          Total Number of Proposals: {numProposals}
        </div>
        <div class="flex">
          <button class="button" on:click={() => selectedTab = "Create Proposal"}>
            Create Proposal
          </button>
          <button class="button" on:click={() => selectedTab = "View Proposals"}>
            View Proposals
          </button>
        </div>
        {#if selectedTab == "Create Proposal"}
            {#if loading}
                <div class="description">
                    Loading... Waiting for transaction...
                </div>
            {:else if nftBalance == 0}
                <div class="description">
                    You do not own any CryptoDevs NFTs. <br />
                    <b>You cannot create or vote on proposals</b>
                </div>
            {:else}
                <div class="container">
                    <label>Fake NFT Token ID to Purchase: </label>
                    <input placeholder="0" type="number" bind:value={fakeNftTokenId}/>
                    <button class="button2" on:click={() => create(fakeNftTokenId)}>Create</button>
                </div>
            {/if}
        {:else if selectedTab == "View Proposals"}
            {#if loading}            
                <div class="description">
                    Loading... Waiting for transaction...
                </div>
            {:else if proposals == null || proposals != null && proposals.length === 0}            
                <div class="description">
                    No proposals have been created
                </div>
            {:else}            
                <div>
                    {#each proposals as proposal}
                        <div class="proposalCard">
                            <p>Proposal ID: {proposal.proposalId}</p>
                            <p>Fake NFT to Purchase: {proposal.nftTokenId}</p>
                            <p>Deadline: {proposal.deadline.toLocaleString()}</p>
                            <p>Yay Votes: {proposal.yayVotes}</p>
                            <p>Nay Votes: {proposal.nayVotes}</p>
                            <p>Executed?: {proposal.executed.toString()}</p>

                            {#if proposal.deadline.getTime() > Date.now() && !proposal.executed}
                                <div class="flex">
                                    <button class="button2" onClick={() => vote(proposal.proposalId, "YAY")}>
                                        Vote YAY
                                    </button>
                                    <button class="button2" onClick={() => vote(proposal.proposalId, "NAY")}>
                                        Vote NAY
                                    </button>
                                </div>
                            {:else if proposal.deadline.getTime() < Date.now() && !proposal.executed}
                                <div class="flex">
                                    <button class="button2" onClick={() => execute(proposal.proposalId)}>
                                        Execute Proposal{" "}
                                        {proposal.yayVotes > proposal.nayVotes ? "(YAY)" : "(NAY)"}
                                    </button>
                                </div>
                            {:else}
                                <div class="description">Proposal Executed</div>
                            {/if}
                        </div>
                    {/each}
                </div>
            {/if}
        {/if}
      </div>
      <div>
        <img class="image" alt="" src="{cryptoDevs}" />
      </div>
    </div>

    <footer class="footer">
      Made with &#10084; by Crypto Devs
    </footer>
  </div>
