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

    // Step 2: Create Wallet 2 at runtime and send 0.15 ETH from Wallet 1 to Wallet 2
    console.log("Creating Wallet 2 and sending 0.015 ETH to it...");
    const wallet2 = ethers.Wallet.createRandom().connect(ethers.provider);
    const tx2 = await wallet1.sendTransaction({
        to: wallet2.address,
        value: ethers.utils.parseEther("0.015"),
    });
    await tx2.wait();
    console.log(`0.015 ETH sent to Wallet 2 at address: ${wallet2.address}`);

    // Step 3: Wallet 2 buys the token from Wallet 2
    const marketplaceContractWithWallet2 = await ethers.getContractAt("NFTMarketplace", marketplaceAddress, wallet2);
    console.log("Wallet 2 is buying the NFT...");
    const tx3 = await marketplaceContractWithWallet2.executeSale(tokenId, { value: price });
    await tx3.wait();
    console.log(`Wallet 2 has bought the NFT with tokenId: ${tokenId.toString()}`);

    // Step 4: Wallet 2 updates the token price by 10%
    price = ethers.utils.parseEther("0.0012");
    console.log("Wallet 2 is updating the token price...");
    const tx4 = await marketplaceContractWithWallet2.updateTokenPrice(tokenId, price);
    await tx4.wait();
    console.log(`Token price updated to: ${ethers.utils.formatEther(price)} ETH`);

    // Step 5: Wallet 2 lists the token for sale
    let listPrice = await marketplaceContractWithWallet2.getListPrice();
    console.log("Wallet 2 is listing the NFT for sale...");
    const tx5 = await marketplaceContractWithWallet2.listTokenForSale(tokenId, price, { value: listPrice });
    await tx5.wait();
    console.log(`NFT listed for sale with new price: ${ethers.utils.formatEther(price)} ETH`);


    // Step 6: Create Wallet 3 at runtime and send 0.15 ETH from Wallet 1 to Wallet 3
    console.log("Creating Wallet 3 and sending 0.015 ETH to it...");
    const wallet3 = ethers.Wallet.createRandom().connect(ethers.provider);
    const tx6 = await wallet1.sendTransaction({
        to: wallet3.address,
        value: ethers.utils.parseEther("0.015"),
    });
    await tx6.wait();
    console.log(`0.015 ETH sent to Wallet 3 at address: ${wallet3.address}`);

    // Step 7: Wallet 3 buys the token from Wallet 2
    const marketplaceContractWithWallet3 = await ethers.getContractAt("NFTMarketplace", marketplaceAddress, wallet3);
    console.log("Wallet 3 is buying the NFT...");
    const tx7 = await marketplaceContractWithWallet3.executeSale(tokenId, { value: price });
    await tx7.wait();
    console.log(`Wallet 3 has bought the NFT with tokenId: ${tokenId.toString()}`);

    // Step 8: Wallet 3 updates the token price by 10%
    price = ethers.utils.parseEther("0.0012");
    console.log("Wallet 3 is updating the token price...");
    const tx8 = await marketplaceContractWithWallet3.updateTokenPrice(tokenId, price);
    await tx8.wait();
    console.log(`Token price updated to: ${ethers.utils.formatEther(price)} ETH`);

    // Step 9: Wallet 3 lists the token for sale
    listPrice = await marketplaceContractWithWallet3.getListPrice();
    console.log("Wallet 3 is listing the NFT for sale...");
    const tx9 = await marketplaceContractWithWallet3.listTokenForSale(tokenId, price, { value: listPrice });
    await tx9.wait();
    console.log(`NFT listed for sale with new price: ${ethers.utils.formatEther(price)} ETH`);

    // Step 10: Create Wallet 4 at runtime and send 0.15 ETH from Wallet 1 to Wallet 4
    // Similar code as above  

    
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
