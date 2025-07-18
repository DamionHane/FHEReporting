const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

/**
 * Interactive script for Anonymous Reporting System contract
 * Allows interaction with deployed contract functions
 */

// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Helper function to prompt user
function prompt(question) {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
}

// Report category names
const CATEGORIES = {
    0: "CORRUPTION",
    1: "FRAUD",
    2: "ENVIRONMENTAL",
    3: "SAFETY",
    4: "DISCRIMINATION",
    5: "OTHER"
};

// Report status names
const STATUS = {
    0: "SUBMITTED",
    1: "UNDER_INVESTIGATION",
    2: "RESOLVED",
    3: "DISMISSED"
};

async function main() {
    console.log("=".repeat(60));
    console.log("Anonymous Reporting System - Interaction Script");
    console.log("=".repeat(60));
    console.log();

    const network = hre.network.name;

    // Load deployment info
    const deploymentFile = path.join(__dirname, `../deployments/${network}.json`);

    if (!fs.existsSync(deploymentFile)) {
        console.log(`Error: Deployment file not found for network: ${network}`);
        console.log("Please deploy the contract first using: npm run deploy");
        process.exit(1);
    }

    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
    const contractAddress = deploymentInfo.contractAddress;

    console.log("Network:", network);
    console.log("Contract Address:", contractAddress);
    console.log();

    // Get contract instance
    const AnonymousReporting = await hre.ethers.getContractFactory("AnonymousReporting");
    const contract = AnonymousReporting.attach(contractAddress);

    // Get signer
    const [signer] = await hre.ethers.getSigners();
    const signerAddress = await signer.getAddress();

    console.log("Your Address:", signerAddress);
    console.log();

    // Check if user is authority
    const authority = await contract.authority();
    const isAuthority = authority.toLowerCase() === signerAddress.toLowerCase();

    console.log("Authority Address:", authority);
    console.log("You are authority:", isAuthority ? "Yes" : "No");
    console.log();

    // Main menu
    while (true) {
        console.log("\n" + "=".repeat(60));
        console.log("MAIN MENU");
        console.log("=".repeat(60));
        console.log("1. Submit Anonymous Report");
        console.log("2. Query Report Status");
        console.log("3. View System Statistics");
        console.log("4. Check if Address is Authorized Investigator");
        console.log();
        if (isAuthority) {
            console.log("=== AUTHORITY FUNCTIONS ===");
            console.log("5. Add Investigator");
            console.log("6. Remove Investigator");
            console.log("7. Assign Report to Investigator");
            console.log("8. Update Report Status");
            console.log("9. Add Investigation Notes");
            console.log();
        }
        console.log("0. Exit");
        console.log("=".repeat(60));

        const choice = await prompt("\nEnter your choice: ");

        try {
            switch (choice) {
                case "1":
                    await submitReport(contract);
                    break;
                case "2":
                    await queryReport(contract);
                    break;
                case "3":
                    await viewStats(contract);
                    break;
                case "4":
                    await checkInvestigator(contract);
                    break;
                case "5":
                    if (isAuthority) await addInvestigator(contract);
                    break;
                case "6":
                    if (isAuthority) await removeInvestigator(contract);
                    break;
                case "7":
                    if (isAuthority) await assignInvestigator(contract);
                    break;
                case "8":
                    if (isAuthority) await updateStatus(contract);
                    break;
                case "9":
                    if (isAuthority) await addNotes(contract);
                    break;
                case "0":
                    console.log("\nGoodbye!");
                    rl.close();
                    process.exit(0);
                default:
                    console.log("\nInvalid choice. Please try again.");
            }
        } catch (error) {
            console.error("\nError:", error.message);
        }
    }
}

// Function implementations
async function submitReport(contract) {
    console.log("\n=== Submit Anonymous Report ===");
    console.log("\nReport Categories:");
    Object.entries(CATEGORIES).forEach(([key, value]) => {
        console.log(`  ${key}. ${value}`);
    });

    const categoryInput = await prompt("\nEnter category (0-5): ");
    const category = parseInt(categoryInput);

    if (category < 0 || category > 5) {
        console.log("Invalid category!");
        return;
    }

    const anonymousInput = await prompt("Submit anonymously? (y/n): ");
    const isAnonymous = anonymousInput.toLowerCase() === "y";

    console.log("\nSubmitting report...");
    const tx = await contract.submitAnonymousReport(category, isAnonymous);
    console.log("Transaction Hash:", tx.hash);

    const receipt = await tx.wait();
    console.log("Transaction confirmed in block:", receipt.blockNumber);

    // Extract report ID from event
    const event = receipt.logs.find(log => {
        try {
            const parsed = contract.interface.parseLog(log);
            return parsed && parsed.name === "ReportSubmitted";
        } catch {
            return false;
        }
    });

    if (event) {
        const parsedEvent = contract.interface.parseLog(event);
        const reportId = parsedEvent.args.reportId;
        console.log("\nReport submitted successfully!");
        console.log("Report ID:", reportId.toString());
        console.log("Category:", CATEGORIES[category]);
        console.log("Anonymous:", isAnonymous ? "Yes" : "No");
    }
}

async function queryReport(contract) {
    console.log("\n=== Query Report Status ===");
    const reportIdInput = await prompt("\nEnter Report ID: ");
    const reportId = parseInt(reportIdInput);

    console.log("\nQuerying report...");
    const [status, submissionTime, investigator, exists] = await contract.getReportBasicInfo(reportId);

    if (!exists) {
        console.log("Report does not exist!");
        return;
    }

    console.log("\nReport Information:");
    console.log("  Report ID:", reportId);
    console.log("  Status:", STATUS[status]);
    console.log("  Submission Time:", new Date(Number(submissionTime) * 1000).toLocaleString());
    console.log("  Investigator:", investigator === hre.ethers.ZeroAddress ? "Not assigned" : investigator);
}

async function viewStats(contract) {
    console.log("\n=== System Statistics ===");
    const [total, resolved, pending] = await contract.getSystemStats();

    console.log("\nCurrent Statistics:");
    console.log("  Total Reports:", total.toString());
    console.log("  Resolved Reports:", resolved.toString());
    console.log("  Pending Reports:", pending.toString());

    if (total > 0) {
        const resolutionRate = (Number(resolved) / Number(total) * 100).toFixed(2);
        console.log("  Resolution Rate:", resolutionRate + "%");
    }
}

async function checkInvestigator(contract) {
    console.log("\n=== Check Investigator Authorization ===");
    const addressInput = await prompt("\nEnter address to check: ");

    const isAuthorized = await contract.isAuthorizedInvestigator(addressInput);
    console.log("\nAddress:", addressInput);
    console.log("Authorized Investigator:", isAuthorized ? "Yes" : "No");
}

async function addInvestigator(contract) {
    console.log("\n=== Add Investigator ===");
    const addressInput = await prompt("\nEnter investigator address: ");

    console.log("\nAdding investigator...");
    const tx = await contract.addInvestigator(addressInput);
    console.log("Transaction Hash:", tx.hash);

    await tx.wait();
    console.log("\nInvestigator added successfully!");
    console.log("Address:", addressInput);
}

async function removeInvestigator(contract) {
    console.log("\n=== Remove Investigator ===");
    const addressInput = await prompt("\nEnter investigator address: ");

    console.log("\nRemoving investigator...");
    const tx = await contract.removeInvestigator(addressInput);
    console.log("Transaction Hash:", tx.hash);

    await tx.wait();
    console.log("\nInvestigator removed successfully!");
    console.log("Address:", addressInput);
}

async function assignInvestigator(contract) {
    console.log("\n=== Assign Report to Investigator ===");
    const reportIdInput = await prompt("\nEnter Report ID: ");
    const reportId = parseInt(reportIdInput);

    const investigatorInput = await prompt("Enter investigator address: ");

    console.log("\nAssigning report...");
    const tx = await contract.assignInvestigator(reportId, investigatorInput);
    console.log("Transaction Hash:", tx.hash);

    await tx.wait();
    console.log("\nReport assigned successfully!");
    console.log("Report ID:", reportId);
    console.log("Investigator:", investigatorInput);
}

async function updateStatus(contract) {
    console.log("\n=== Update Report Status ===");
    const reportIdInput = await prompt("\nEnter Report ID: ");
    const reportId = parseInt(reportIdInput);

    console.log("\nAvailable Statuses:");
    Object.entries(STATUS).forEach(([key, value]) => {
        console.log(`  ${key}. ${value}`);
    });

    const statusInput = await prompt("\nEnter new status (0-3): ");
    const newStatus = parseInt(statusInput);

    if (newStatus < 0 || newStatus > 3) {
        console.log("Invalid status!");
        return;
    }

    console.log("\nUpdating report status...");
    const tx = await contract.updateReportStatus(reportId, newStatus);
    console.log("Transaction Hash:", tx.hash);

    await tx.wait();
    console.log("\nReport status updated successfully!");
    console.log("Report ID:", reportId);
    console.log("New Status:", STATUS[newStatus]);
}

async function addNotes(contract) {
    console.log("\n=== Add Investigation Notes ===");
    const reportIdInput = await prompt("\nEnter Report ID: ");
    const reportId = parseInt(reportIdInput);

    const notes = await prompt("Enter investigation notes: ");

    console.log("\nAdding notes...");
    const tx = await contract.addInvestigationNotes(reportId, notes);
    console.log("Transaction Hash:", tx.hash);

    await tx.wait();
    console.log("\nNotes added successfully!");
    console.log("Report ID:", reportId);
}

// Execute interaction script
main()
    .then(() => {
        rl.close();
        process.exit(0);
    })
    .catch((error) => {
        console.error("\nError occurred!");
        console.error(error);
        rl.close();
        process.exit(1);
    });
