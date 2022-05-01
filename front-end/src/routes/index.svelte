<script lang="ts">
    import { onMount } from 'svelte';
	import '../app.css';
    import cryptoDevs from '$lib/assets/0.svg';
    import { formatEther } from 'ethers/lib/utils';

    import { connectWallet,
        checkIfWalletIsConnected,
		getNetwork,
		switchNetwork,
		onChainChanged,
        getUserNFTBalance,
        getDAOTreasuryBalance,
        getNumProposalsInDAO
     } from "$lib/services/CryptoDevsDaoService";

    let loading: boolean = false;
	let account: string;
	let network: string;

    let selectedTab: string;

    let nftBalance:string;
    let treasuryBalance: string;
    let numProposals: string;

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
        <!-- {renderTabs()} -->
      </div>
      <div>
        <img class="image" alt="" src="{cryptoDevs}" />
      </div>
    </div>

    <footer class="footer">
      Made with &#10084; by Crypto Devs
    </footer>
  </div>
