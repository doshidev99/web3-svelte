<script>
	import { onMount } from "svelte";
	import { ethers } from "ethers";
	import TipJarABI from '../../../solidity/artifacts/contracts/TipJar.sol/TipJar.json'

	const contractAddress =  "0x036F0f9f837bd76c31Ed1Ac9649c239fc4b0E1a2"
	let userAddress = null;
	let network = null;
	let balance = null;
	let isConnected = false;
	let sendingTip = false;
	let provider =null;
	let contract = null;
	let allTips = []

	async function setupContract() {
		if(isConnected) {
			contract = new ethers.Contract(contractAddress, TipJarABI.abi, provider);
			contract.on('NewTip', async() => {
				balance = await provider.getBalance(userAddress);
				await getAllTips(); // update the tips
				// Mining process end
				sendingTip = false;
			})
		}
	}

	async function getAllTips() {
		if(isConnected) {
			try{
				const tips = await contract.getAllTips();
				console.log('típ', tips)
				allTips = [
					...tips.map((item) => {
						return {
							address: item.sender,
							timestamp: new Date(item.timestamp * 1000).toLocaleDateString(),
							name: item.name,
							amount: ethers.utils.formatEther(item.amount.toString()),
							message: item.message
						}
					}) 
				]
			}catch(e) {
				console.log({e})
			}
		}
	}

	async function setup(accounts) {
		userAddress = accounts[0]
		try {
			provider = new ethers.providers.Web3Provider(window.ethereum);
			network = await provider.getNetwork();
			balance = await provider.getBalance(userAddress);
			isConnected = true;
			await setupContract();
			await getAllTips()
			
		} catch (e) {
			console.error(e);
		}
	}


	onMount(async () => {
		if(window.ethereum) {
			const accounts = await window.ethereum.request({
				method: 'eth_requestAccounts'
			})
			if(accounts.length > 0) {
				await setup(accounts)
			} else {
				alert('No accounts found');
			}
		} else {
			alert('No ethereum found')
		}
	})

	async function sendTip(event) {
		sendingTip = true;
		const formData = new FormData(event.target);
		const data = {};
		for (let field of formData) {
			const [key, value] = field;
			data[key] = value;
		}

		// perform the transaction
		// get the signer of the transaction and a read-write instance of the contract
		const rwContract = new ethers.Contract(contractAddress, TipJarABI.abi, provider.getSigner());
		const transaction = await rwContract.sendTip(data.message, data.name, {
			value: ethers.utils.parseEther(data.amount)
		});
		await transaction.wait();
		sendingTip = false;
	}

</script>

{#if userAddress}
<div>
	<p class="text-xl text-dark-600">Address: {userAddress}</p>
	<p class="text-xl text-dark-600">Network: </p>
	<p class="text-xl text-dark-600">Balance: {balance} ETH</p>
</div>

<div>
	<form
		class="w-2/3 mx-auto border rounded-md border-indigo-200 flex flex-col gap-8 p-6 mt-4"
		on:submit|preventDefault={sendTip}
	>
		<div class="grid grid-cols-2">
			<label for="tipAmount"> Send me an ethereum tip! </label>
			<input type="string" name="amount" placeholder="0.001" />
		</div>
		<div class="grid grid-cols-2">
			<label for="tipName"> Your name </label>
			<input type="text" name="name" placeholder="Name" />
		</div>
		<div class="grid grid-cols-2">
			<label for="tipMessage"> A quick message </label>
			<input type="text" name="message" placeholder="Message" />
		</div>
		<button
			disabled={sendingTip}
			type="submit"
			class="bg-green-500 text-gray-50 shadow-md rounded-md px-2 py-2 text-center w-1/3 self-center hover:bg-green-600"
			>{#if sendingTip} Sending... {:else} Send a tip! {/if}</button
		>
	</form>
</div>

<div>
	<div class="flex flex-col">
		<div class="overflow-x-auto sm:-mx-6 lg:-mx-8">
			<div class="py-2 inline-block min-w-full sm:px-6 lg:px-8">
				<div class="overflow-hidden">
					<table class="min-w-full">
						<thead class="border-b">
							<tr>
								<th scope="col" class="text-sm font-medium text-gray-900 px-6 py-4 text-left">
									#
								</th>
								<th scope="col" class="text-sm font-medium text-gray-900 px-6 py-4 text-left">
									Name
								</th>
								<th scope="col" class="text-sm font-medium text-gray-900 px-6 py-4 text-left">
									Message
								</th>
								<th scope="col" class="text-sm font-medium text-gray-900 px-6 py-4 text-left">
									Amount
								</th>
								<th scope="col" class="text-sm font-medium text-gray-900 px-6 py-4 text-left">
									Address
								</th>
							</tr>
						</thead>
						<tbody>
							{#each allTips as item, idx}
							<tr class="bg-white border-b">
								<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{idx + 1}</td>
								<td class="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
									{item.name}
								</td>
								<td class="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
									{item.message}
								</td>
								<td class="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
									{item.amount}
								</td>
								<td class="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
									{item.address}
								</td>
							</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
</div>
{:else} 
		<button class="bg-blue-600 text-gray-50 shadow-md rounded-md px-2 py-8 text-center"
		>
			connect
		</button>
{/if}