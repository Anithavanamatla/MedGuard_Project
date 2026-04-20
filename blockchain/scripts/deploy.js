const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("Deploying ClaimRegistry...");

    const ClaimRegistry = await hre.ethers.getContractFactory("ClaimRegistry");
    const claimRegistry = await ClaimRegistry.deploy();

    await claimRegistry.waitForDeployment();
    const address = await claimRegistry.getAddress();

    console.log(`ClaimRegistry deployed to: ${address}`);

    // Save Config for Backend
    const artifact = await hre.artifacts.readArtifact("ClaimRegistry");
    const backendConfig = {
        address: address,
        abi: artifact.abi
    };

    const configPath = path.join(__dirname, "../../backend/blockchain_config.json");
    fs.writeFileSync(configPath, JSON.stringify(backendConfig, null, 2));
    console.log(`Config saved to ${configPath}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
