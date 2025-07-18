const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Contract Verification Script
 * Verifies the deployed contract on Etherscan
 */
async function main() {
    console.log("=".repeat(60));
    console.log("Anonymous Reporting System - Verification Script");
    console.log("=".repeat(60));
    console.log();

    const network = hre.network.name;

    // Check if network supports verification
    if (network === "hardhat" || network === "localhost") {
        console.log("Verification is not needed for local networks.");
        console.log("Please deploy to a public testnet or mainnet to verify.");
        return;
    }

    // Check for Etherscan API key
    if (!process.env.ETHERSCAN_API_KEY) {
        console.log("Error: ETHERSCAN_API_KEY not found in .env file");
        console.log("Please add your Etherscan API key to .env:");
        console.log("ETHERSCAN_API_KEY=your_api_key_here");
        process.exit(1);
    }

    // Load deployment info
    const deploymentFile = path.join(__dirname, `../deployments/${network}.json`);

    if (!fs.existsSync(deploymentFile)) {
        console.log(`Error: Deployment file not found: ${deploymentFile}`);
        console.log("Please deploy the contract first using: npm run deploy");
        process.exit(1);
    }

    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
    const contractAddress = deploymentInfo.contractAddress;

    console.log("Network:", network);
    console.log("Contract Address:", contractAddress);
    console.log();

    console.log("Starting verification process...");
    console.log();

    try {
        // Verify the contract
        await hre.run("verify:verify", {
            address: contractAddress,
            constructorArguments: [], // AnonymousReporting has no constructor arguments
        });

        console.log();
        console.log("Contract verified successfully!");
        console.log(`View on Etherscan: https://${network}.etherscan.io/address/${contractAddress}#code`);
        console.log();

        // Update deployment info with verification status
        deploymentInfo.verified = true;
        deploymentInfo.verificationTime = new Date().toISOString();
        fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

    } catch (error) {
        if (error.message.includes("Already Verified")) {
            console.log("Contract is already verified!");
            console.log(`View on Etherscan: https://${network}.etherscan.io/address/${contractAddress}#code`);
        } else {
            console.log("Verification failed:");
            console.log(error.message);
            console.log();
            console.log("You can try verifying manually:");
            console.log(`npx hardhat verify --network ${network} ${contractAddress}`);
            process.exit(1);
        }
    }

    console.log("=".repeat(60));
}

main()
    .then(() => {
        console.log("\nVerification process completed!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\nVerification failed!");
        console.error(error);
        process.exit(1);
    });
