const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Main deployment function for Anonymous Reporting System
 * Deploys the contract to the configured network (Sepolia recommended)
 */
async function main() {
    console.log("=".repeat(60));
    console.log("Anonymous Reporting System - Deployment Script");
    console.log("=".repeat(60));
    console.log();

    // Get network information
    const network = hre.network.name;
    const chainId = hre.network.config.chainId;

    console.log(`Network: ${network}`);
    console.log(`Chain ID: ${chainId}`);
    console.log();

    // Get deployer account
    const [deployer] = await hre.ethers.getSigners();
    const deployerAddress = await deployer.getAddress();
    const balance = await hre.ethers.provider.getBalance(deployerAddress);

    console.log("Deployer Information:");
    console.log(`  Address: ${deployerAddress}`);
    console.log(`  Balance: ${hre.ethers.formatEther(balance)} ETH`);
    console.log();

    // Check if deployer has enough balance
    if (balance === 0n) {
        throw new Error("Deployer account has zero balance. Please fund the account before deployment.");
    }

    // Get the contract factory
    console.log("Compiling contract...");
    const AnonymousReporting = await hre.ethers.getContractFactory("AnonymousReporting");
    console.log("Contract factory created successfully");
    console.log();

    // Estimate deployment gas
    console.log("Estimating deployment costs...");
    const deploymentData = AnonymousReporting.getDeployTransaction();

    // Deploy the contract
    console.log("Deploying AnonymousReporting contract...");
    const startTime = Date.now();

    const anonymousReporting = await AnonymousReporting.deploy();

    console.log(`  Transaction Hash: ${anonymousReporting.deploymentTransaction().hash}`);
    console.log("  Waiting for deployment confirmation...");

    await anonymousReporting.waitForDeployment();

    const contractAddress = await anonymousReporting.getAddress();
    const deployTime = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log();
    console.log("Deployment successful!");
    console.log(`  Contract Address: ${contractAddress}`);
    console.log(`  Deployment Time: ${deployTime}s`);
    console.log();

    // Get deployment transaction receipt
    const receipt = await anonymousReporting.deploymentTransaction().wait();

    console.log("Transaction Details:");
    console.log(`  Block Number: ${receipt.blockNumber}`);
    console.log(`  Gas Used: ${receipt.gasUsed.toString()}`);
    console.log(`  Effective Gas Price: ${hre.ethers.formatUnits(receipt.gasPrice, "gwei")} Gwei`);
    console.log(`  Total Cost: ${hre.ethers.formatEther(receipt.gasUsed * receipt.gasPrice)} ETH`);
    console.log();

    // Verify contract ownership
    const authority = await anonymousReporting.authority();
    console.log("Contract Configuration:");
    console.log(`  Authority Address: ${authority}`);
    console.log(`  Authority Match: ${authority.toLowerCase() === deployerAddress.toLowerCase() ? "Yes" : "No"}`);
    console.log();

    // Save deployment information
    const deploymentInfo = {
        contractName: "AnonymousReporting",
        contractAddress: contractAddress,
        network: network,
        chainId: chainId,
        deployer: deployerAddress,
        authority: authority,
        transactionHash: anonymousReporting.deploymentTransaction().hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        gasPrice: receipt.gasPrice.toString(),
        deploymentCost: hre.ethers.formatEther(receipt.gasUsed * receipt.gasPrice),
        timestamp: new Date().toISOString(),
        deploymentTime: deployTime
    };

    // Save to deployments directory
    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const deploymentFile = path.join(deploymentsDir, `${network}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log(`Deployment info saved to: ${deploymentFile}`);

    // Save contract info for frontend
    const publicDir = path.join(__dirname, "../public");
    if (fs.existsSync(publicDir)) {
        const contractInfoPath = path.join(publicDir, "contract-info.json");
        const frontendInfo = {
            address: contractAddress,
            network: network,
            chainId: chainId,
            deploymentTime: new Date().toISOString()
        };
        fs.writeFileSync(contractInfoPath, JSON.stringify(frontendInfo, null, 2));
        console.log(`Frontend config saved to: ${contractInfoPath}`);
    }
    console.log();

    // Contract verification on Etherscan
    if (network !== "hardhat" && network !== "localhost") {
        console.log("Preparing for contract verification...");
        console.log("Waiting for block confirmations (6 blocks)...");

        try {
            await anonymousReporting.deploymentTransaction().wait(6);

            console.log("Verifying contract on Etherscan...");
            await hre.run("verify:verify", {
                address: contractAddress,
                constructorArguments: [],
            });

            console.log("Contract verified successfully on Etherscan!");
            console.log(`  Etherscan URL: https://${network}.etherscan.io/address/${contractAddress}`);
        } catch (error) {
            console.log("Contract verification failed:");
            console.log(`  Error: ${error.message}`);
            console.log("  You can verify manually later using:");
            console.log(`  npx hardhat verify --network ${network} ${contractAddress}`);
        }
        console.log();
    }

    // Display summary
    console.log("=".repeat(60));
    console.log("DEPLOYMENT SUMMARY");
    console.log("=".repeat(60));
    console.log();
    console.log("Contract Information:");
    console.log(`  Name: AnonymousReporting`);
    console.log(`  Address: ${contractAddress}`);
    console.log(`  Network: ${network} (Chain ID: ${chainId})`);
    console.log(`  Deployer: ${deployerAddress}`);
    console.log();

    if (network !== "hardhat" && network !== "localhost") {
        console.log("Explorer Links:");
        console.log(`  Contract: https://${network}.etherscan.io/address/${contractAddress}`);
        console.log(`  Transaction: https://${network}.etherscan.io/tx/${anonymousReporting.deploymentTransaction().hash}`);
        console.log();
    }

    console.log("Next Steps:");
    console.log("  1. Run 'npm run verify' to verify the contract (if not auto-verified)");
    console.log("  2. Run 'npm run interact' to interact with the deployed contract");
    console.log("  3. Update frontend with contract address if needed");
    console.log("  4. Add authorized investigators using addInvestigator() function");
    console.log();
    console.log("=".repeat(60));
}

// Execute deployment
main()
    .then(() => {
        console.log("\nDeployment completed successfully!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\nDeployment failed!");
        console.error(error);
        process.exit(1);
    });
