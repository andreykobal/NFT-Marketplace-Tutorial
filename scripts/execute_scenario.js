require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
    // The address of the deployed NFT Marketplace contract
    const marketplaceAddress = "0xaC7e4Ad5d7557B78ebc84Dff668A06709f5Dc62B";

    // The address of wallet 1
    const wallet1 = new ethers.Wallet(process.env.privateKey, ethers.provider);

    // Attach the wallet to the marketplace contract
    const marketplaceContractWithWallet1 = await ethers.getContractAt("NFTMarketplace", marketplaceAddress, wallet1);

    // Step 1: Wallet 1 mints an NFT with a tokenURI
    console.log("Wallet 1 is minting an NFT...");
    const tokenURI = "ipfs://yourtokenuri";
    let price = ethers.utils.parseEther("0.001");
    const tx1 = await marketplaceContractWithWallet1.createToken(tokenURI, price, { value: price });
    const receipt1 = await tx1.wait();
    const tokenId = receipt1.events.find(event => event.event === "TokenListedSuccess").args.tokenId;
    console.log(`NFT minted with tokenId: ${tokenId.toString()}`);

    let createdWallets = [];


    // Loop through wallets 2 to 10
    for (let i = 2; i <= 10; i++) {
        // Create a wallet
        const wallet = ethers.Wallet.createRandom().connect(ethers.provider);

        // Store the created wallet
        createdWallets.push(wallet);


        // Send 0.015 ETH from Wallet 1 to the new wallet
        console.log(`Creating Wallet ${i} and sending 0.003 ETH to it...`);
        const tx2 = await wallet1.sendTransaction({
            to: wallet.address,
            value: ethers.utils.parseEther("0.003"),
        });
        await tx2.wait();
        console.log(`0.003 ETH sent to Wallet ${i} at address: ${wallet.address}`);

        // Buy the token from Wallet 2
        const marketplaceContractWithWallet = await ethers.getContractAt("NFTMarketplace", marketplaceAddress, wallet);
        console.log(`Wallet ${i} is buying the NFT...`);
        const tx3 = await marketplaceContractWithWallet.executeSale(tokenId, { value: price });
        await tx3.wait();
        console.log(`Wallet ${i} has bought the NFT with tokenId: ${tokenId.toString()}`);

        // Update the token price by a random percentage within the range of -10% to +10%
        const originalPrice = ethers.utils.formatUnits(price, 18); // Convert to a decimal number
        const randomPercentage = Math.random() * 0.2 - 0.1; // Random value between -0.1 and +0.1
        const newPrice = originalPrice * (1 + randomPercentage);
        // Round the new price to 6 decimal places
        price = ethers.utils.parseEther(newPrice.toFixed(6));
        console.log(`Wallet ${i} is updating the token price...`);
        const tx4 = await marketplaceContractWithWallet.updateTokenPrice(tokenId, price);
        await tx4.wait();
        console.log(`Token price updated to: ${ethers.utils.formatEther(price)} ETH`);

        // List the token for sale
        const listPrice = await marketplaceContractWithWallet.getListPrice();
        console.log(`Wallet ${i} is listing the NFT for sale...`);
        const tx5 = await marketplaceContractWithWallet.listTokenForSale(tokenId, price, { value: listPrice });
        await tx5.wait();
        console.log(`NFT listed for sale with new price: ${ethers.utils.formatEther(price)} ETH`);
    }

    // After the loop, send the remaining balances to wallet 1
    for (const wallet of createdWallets) {
        const balance = await ethers.provider.getBalance(wallet.address);
        if (balance.gt(0)) { // Check if the balance is greater than 0
            // Estimate the gas for the transaction
            const gasPrice = await ethers.provider.getGasPrice();
            const gasLimit = ethers.BigNumber.from(21000); // 21000 is the standard gas limit for sending ETH
            const gasCost = gasPrice.mul(gasLimit);

            // Check if the balance covers the gas cost
            if (balance.sub(gasCost).gt(0)) {
                const amountToSend = balance.sub(gasCost);

                const amountToSendInEth = ethers.utils.formatEther(amountToSend);

                console.log(`Sending remaining balance: ${amountToSendInEth} ETH from Wallet at address ${wallet.address} to Wallet 1...`);
                const tx = await wallet.sendTransaction({
                    to: wallet1.address,
                    value: amountToSend,
                    gasLimit: gasLimit, // Set the gas limit
                    gasPrice: gasPrice, // Set the gas price
                });
                await tx.wait();
                console.log(`Remaining balance sent to Wallet 1 from address: ${wallet.address}`);
            } else {
                console.log(`Wallet at address ${wallet.address} does not have enough balance to cover gas costs.`);
            }
        }
    }
}

async function loop() {
    while (true) {
        try {
            await main();
            // If you want some delay between each iteration
            // you can use the following line to pause for a specified time (e.g., 5 seconds)
            // await new Promise(resolve => setTimeout(resolve, 5000));
        } catch (error) {
            console.error('An error occurred:', error);
            // Decide how you want to handle errors; either:
            // - continue with the next iteration, or
            // - break out of the loop, or
            // - retry the same step after a delay
            // For example, to pause for 10 seconds before retrying, you could use:
            // await new Promise(resolve => setTimeout(resolve, 10000));
        }
    }
}

loop()
    .then(() => console.log("Loop has started"))
    .catch((error) => {
        console.error('Loop has encountered an error and stopped:', error);
        process.exit(1);
    });