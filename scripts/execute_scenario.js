require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
    // The address of the deployed NFT Marketplace contract
    const marketplaceAddress = "0x3E9801B44695D0C7310549Dd5751a19C4691D448";

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

    // Loop through wallets 2 to 10
    for (let i = 2; i <= 10; i++) {
        // Create a wallet
        const wallet = ethers.Wallet.createRandom().connect(ethers.provider);

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
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
