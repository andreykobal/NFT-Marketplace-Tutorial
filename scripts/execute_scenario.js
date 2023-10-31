require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
    // The address of the deployed NFT Marketplace contract
    const marketplaceAddress = "0x4A93f2231301180E27Da219B52d912F0c7E2DCdd";

    // The addresses of wallet 1 and wallet 2
    const wallet1 = new ethers.Wallet(process.env.privateKey, ethers.provider);
    const wallet2 = new ethers.Wallet(process.env.privateKey2, ethers.provider);

    // Attach the wallets to the marketplace contract
    const marketplaceContractWithWallet1 = await ethers.getContractAt("NFTMarketplace", marketplaceAddress, wallet1);
    const marketplaceContractWithWallet2 = await ethers.getContractAt("NFTMarketplace", marketplaceAddress, wallet2);

    // Step 1: Wallet 1 mints an NFT with a tokenURI
    console.log("Wallet 1 is minting an NFT...");
    const tokenURI = "ipfs://yourtokenuri";
    const price = ethers.utils.parseEther("0.01");
    const tx1 = await marketplaceContractWithWallet1.createToken(tokenURI, price, { value: price });
    const receipt1 = await tx1.wait();
    const tokenId = receipt1.events.find(event => event.event === "TokenListedSuccess").args.tokenId;
    console.log(`NFT minted with tokenId: ${tokenId.toString()}`);

    // Step 2: Wallet1 sets the price for the NFT (price is already set during the minting in your contract)
    // You can add additional logic here if you want to update the price after minting.

    // Step 3: Wallet 2 buys the NFT
    console.log("Wallet 2 is buying the NFT...");
    const tx3 = await marketplaceContractWithWallet2.executeSale(tokenId, { value: price });
    await tx3.wait();
    console.log(`Wallet 2 has bought the NFT with tokenId: ${tokenId.toString()}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
