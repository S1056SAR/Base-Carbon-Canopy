const hre = require("hardhat");
const { ethers } = hre;

// Helper to convert USDC amounts (6 decimals) to smallest unit
function usdc(amount) {
    return ethers.parseUnits(amount.toString(), 6);
}

async function main() {
    const [deployer] = await ethers.getSigners();
    const ownerAddress = deployer.address; // Use deployer as the owner for both contracts
    const tradingFeePercentage = 1; // 1%

    console.log("Deploying contracts with the account:", ownerAddress);
    console.log("Account balance:", (await ethers.provider.getBalance(ownerAddress)).toString());

    // Deploy MockUSDC
    console.log("\nDeploying MockUSDC...");
    const MockUSDCFactory = await ethers.getContractFactory("MockUSDC");
    const mockUSDC = await MockUSDCFactory.deploy(ownerAddress);
    await mockUSDC.waitForDeployment();
    const mockUSDCAddress = await mockUSDC.getAddress();
    console.log("MockUSDC deployed to:", mockUSDCAddress);

    // Deploy CarbonCredit
    console.log("\nDeploying CarbonCredit...");
    const CarbonCreditFactory = await ethers.getContractFactory("CarbonCredit");
    const carbonCredit = await CarbonCreditFactory.deploy(
        mockUSDCAddress,
        ownerAddress,
        tradingFeePercentage
    );
    await carbonCredit.waitForDeployment();
    const carbonCreditAddress = await carbonCredit.getAddress();
    console.log("CarbonCredit deployed to:", carbonCreditAddress);

    // --- Post-Deployment Setup ---
    console.log("\n--- Starting Post-Deployment Setup ---");

    // 1. Mint Mock Projects
    console.log("\nMinting mock projects...");
    const projects = [
        { name: "Kenya Reforestation", location: "Kenya", supply: 500 },
        { name: "India Methane Capture", location: "India", supply: 1000 },
        { name: "Brazil Solar Farm", location: "Brazil", supply: 750 },
        { name: "Indonesia Peatland Restoration", location: "Indonesia", supply: 600 },
        { name: "Ghana Cookstoves", location: "Ghana", supply: 400 },
    ];

    for (let i = 0; i < projects.length; i++) {
        const p = projects[i];
        const tx = await carbonCredit.mintNewProject(p.name, p.location, p.supply, ownerAddress); // Mint to owner for now
        await tx.wait(); // Wait for transaction confirmation
        console.log(`  Minted Project ${i}: ${p.name} (${p.supply} tons)`);
    }
    console.log("Finished minting projects.");

    // 2. Distribute Mock USDC
    console.log("\nDistributing mock USDC...");
    const addressesToFund = [ownerAddress]; // Add other test addresses if needed
    const amountToFund = usdc(10000); // Fund each address with 10,000 mUSDC

    for (const addr of addressesToFund) {
        const tx = await mockUSDC.mint(addr, amountToFund);
        await tx.wait();
        console.log(`  Funded ${addr} with ${ethers.formatUnits(amountToFund, 6)} mUSDC`);
    }
    console.log("Finished distributing mock USDC.");

    console.log("\n--- Post-Deployment Setup Complete ---");
    console.log("Deployment successful!");
    console.log("MockUSDC Address:", mockUSDCAddress);
    console.log("CarbonCredit Address:", carbonCreditAddress);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 