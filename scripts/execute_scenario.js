require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
    // The address of the deployed NFT Marketplace contract
    const marketplaceAddress = "0xbaB870169544Bd2759dAdb30fA04724ff2C6708D";

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

    // Step 2: Wallet 2 buys the NFT
    console.log("Wallet 2 is buying the NFT...");
    const tx2 = await marketplaceContractWithWallet2.executeSale(tokenId, { value: price });
    await tx2.wait();
    console.log(`Wallet 2 has bought the NFT with tokenId: ${tokenId.toString()}`);

    // Step 3: Wallet 2 updates the token price by 10%
    const updatedPrice = ethers.utils.parseEther("0.011");
    console.log("Wallet 2 is updating the token price...");
    const tx3 = await marketplaceContractWithWallet2.updateTokenPrice(tokenId, updatedPrice);
    await tx3.wait();
    console.log(`Token price updated to: ${ethers.utils.formatEther(updatedPrice)} ETH`);

    // Step 4: Wallet 2 lists the token for sale
    const listPrice = await marketplaceContractWithWallet2.getListPrice();
    console.log("Wallet 2 is listing the NFT for sale...");
    const tx4 = await marketplaceContractWithWallet2.listTokenForSale(tokenId, updatedPrice, { value: listPrice });
    await tx4.wait();
    console.log(`NFT listed for sale with new price: ${ethers.utils.formatEther(updatedPrice)} ETH`);

    // Step 5: Wallet 1 buys the token from Wallet 2
    console.log("Wallet 1 is buying the NFT back...");
    const tx5 = await marketplaceContractWithWallet1.executeSale(tokenId, { value: updatedPrice });
    await tx5.wait();
    console.log(`Wallet 1 has bought back the NFT with tokenId: ${tokenId.toString()}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
