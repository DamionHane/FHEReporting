const hre = require("hardhat");

/**
 * Simulation script for Anonymous Reporting System
 * Demonstrates a complete workflow with multiple scenarios
 */

// Report categories
const CATEGORIES = {
    CORRUPTION: 0,
    FRAUD: 1,
    ENVIRONMENTAL: 2,
    SAFETY: 3,
    DISCRIMINATION: 4,
    OTHER: 5
};

// Report statuses
const STATUS = {
    SUBMITTED: 0,
    UNDER_INVESTIGATION: 1,
    RESOLVED: 2,
    DISMISSED: 3
};

const CATEGORY_NAMES = ["CORRUPTION", "FRAUD", "ENVIRONMENTAL", "SAFETY", "DISCRIMINATION", "OTHER"];
const STATUS_NAMES = ["SUBMITTED", "UNDER_INVESTIGATION", "RESOLVED", "DISMISSED"];

async function main() {
    console.log("=".repeat(60));
    console.log("Anonymous Reporting System - Simulation Script");
    console.log("=".repeat(60));
    console.log();

    // Get signers
    const [authority, investigator1, investigator2, reporter1, reporter2, reporter3] = await hre.ethers.getSigners();

    console.log("Simulation Accounts:");
    console.log("  Authority:", await authority.getAddress());
    console.log("  Investigator 1:", await investigator1.getAddress());
    console.log("  Investigator 2:", await investigator2.getAddress());
    console.log("  Reporter 1:", await reporter1.getAddress());
    console.log("  Reporter 2:", await reporter2.getAddress());
    console.log("  Reporter 3:", await reporter3.getAddress());
    console.log();

    // Deploy contract
    console.log("Deploying contract...");
    const AnonymousReporting = await hre.ethers.getContractFactory("AnonymousReporting", authority);
    const contract = await AnonymousReporting.deploy();
    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();
    console.log("Contract deployed at:", contractAddress);
    console.log();

    // Verify initial state
    console.log("=".repeat(60));
    console.log("SCENARIO 1: Initial State Verification");
    console.log("=".repeat(60));
    const authorityAddress = await contract.authority();
    console.log("Contract authority:", authorityAddress);
    console.log("Authority matches deployer:", authorityAddress.toLowerCase() === (await authority.getAddress()).toLowerCase());

    const [total1, resolved1, pending1] = await contract.getSystemStats();
    console.log("Initial statistics:");
    console.log("  Total reports:", total1.toString());
    console.log("  Resolved reports:", resolved1.toString());
    console.log("  Pending reports:", pending1.toString());
    console.log();

    // Add investigators
    console.log("=".repeat(60));
    console.log("SCENARIO 2: Adding Authorized Investigators");
    console.log("=".repeat(60));

    const inv1Address = await investigator1.getAddress();
    const inv2Address = await investigator2.getAddress();

    console.log("Adding investigator 1...");
    let tx = await contract.connect(authority).addInvestigator(inv1Address);
    await tx.wait();
    console.log("  Investigator 1 added:", inv1Address);

    console.log("Adding investigator 2...");
    tx = await contract.connect(authority).addInvestigator(inv2Address);
    await tx.wait();
    console.log("  Investigator 2 added:", inv2Address);

    // Verify investigator status
    const isAuth1 = await contract.isAuthorizedInvestigator(inv1Address);
    const isAuth2 = await contract.isAuthorizedInvestigator(inv2Address);
    const isAuth3 = await contract.isAuthorizedInvestigator(await reporter1.getAddress());

    console.log("\nInvestigator authorization status:");
    console.log("  Investigator 1:", isAuth1 ? "Authorized" : "Not Authorized");
    console.log("  Investigator 2:", isAuth2 ? "Authorized" : "Not Authorized");
    console.log("  Reporter 1:", isAuth3 ? "Authorized" : "Not Authorized");
    console.log();

    // Submit reports
    console.log("=".repeat(60));
    console.log("SCENARIO 3: Submitting Anonymous Reports");
    console.log("=".repeat(60));

    const reports = [];

    // Report 1: Corruption (Anonymous)
    console.log("Reporter 1 submitting corruption report (anonymous)...");
    tx = await contract.connect(reporter1).submitAnonymousReport(CATEGORIES.CORRUPTION, true);
    let receipt = await tx.wait();
    let reportId = extractReportId(receipt, contract);
    reports.push(reportId);
    console.log(`  Report #${reportId} submitted - Category: CORRUPTION, Anonymous: Yes`);

    // Report 2: Fraud (Non-anonymous)
    console.log("Reporter 2 submitting fraud report (non-anonymous)...");
    tx = await contract.connect(reporter2).submitAnonymousReport(CATEGORIES.FRAUD, false);
    receipt = await tx.wait();
    reportId = extractReportId(receipt, contract);
    reports.push(reportId);
    console.log(`  Report #${reportId} submitted - Category: FRAUD, Anonymous: No`);

    // Report 3: Environmental (Anonymous)
    console.log("Reporter 3 submitting environmental report (anonymous)...");
    tx = await contract.connect(reporter3).submitAnonymousReport(CATEGORIES.ENVIRONMENTAL, true);
    receipt = await tx.wait();
    reportId = extractReportId(receipt, contract);
    reports.push(reportId);
    console.log(`  Report #${reportId} submitted - Category: ENVIRONMENTAL, Anonymous: Yes`);

    // Report 4: Safety (Anonymous)
    console.log("Reporter 1 submitting safety report (anonymous)...");
    tx = await contract.connect(reporter1).submitAnonymousReport(CATEGORIES.SAFETY, true);
    receipt = await tx.wait();
    reportId = extractReportId(receipt, contract);
    reports.push(reportId);
    console.log(`  Report #${reportId} submitted - Category: SAFETY, Anonymous: Yes`);

    const [total2, resolved2, pending2] = await contract.getSystemStats();
    console.log("\nUpdated statistics:");
    console.log("  Total reports:", total2.toString());
    console.log("  Pending reports:", pending2.toString());
    console.log();

    // Query report details
    console.log("=".repeat(60));
    console.log("SCENARIO 4: Querying Report Information");
    console.log("=".repeat(60));

    for (const id of reports) {
        const [status, submissionTime, investigator, exists] = await contract.getReportBasicInfo(id);
        console.log(`Report #${id}:`);
        console.log(`  Status: ${STATUS_NAMES[status]}`);
        console.log(`  Submission Time: ${new Date(Number(submissionTime) * 1000).toLocaleString()}`);
        console.log(`  Investigator: ${investigator === hre.ethers.ZeroAddress ? "Not assigned" : investigator}`);
        console.log(`  Exists: ${exists}`);
        console.log();
    }

    // Assign reports to investigators
    console.log("=".repeat(60));
    console.log("SCENARIO 5: Assigning Reports to Investigators");
    console.log("=".repeat(60));

    console.log(`Assigning Report #${reports[0]} to Investigator 1...`);
    tx = await contract.connect(authority).assignInvestigator(reports[0], inv1Address);
    await tx.wait();
    console.log("  Assigned successfully");

    console.log(`Assigning Report #${reports[1]} to Investigator 1...`);
    tx = await contract.connect(authority).assignInvestigator(reports[1], inv1Address);
    await tx.wait();
    console.log("  Assigned successfully");

    console.log(`Assigning Report #${reports[2]} to Investigator 2...`);
    tx = await contract.connect(authority).assignInvestigator(reports[2], inv2Address);
    await tx.wait();
    console.log("  Assigned successfully");

    console.log();

    // Add investigation notes
    console.log("=".repeat(60));
    console.log("SCENARIO 6: Adding Investigation Notes");
    console.log("=".repeat(60));

    console.log(`Investigator 1 adding notes to Report #${reports[0]}...`);
    tx = await contract.connect(investigator1).addInvestigationNotes(
        reports[0],
        "Initial investigation started. Collecting evidence and interviewing witnesses."
    );
    await tx.wait();
    console.log("  Notes added successfully");

    console.log(`Investigator 1 adding notes to Report #${reports[1]}...`);
    tx = await contract.connect(investigator1).addInvestigationNotes(
        reports[1],
        "Fraud case verified. Financial records obtained. Preparing report."
    );
    await tx.wait();
    console.log("  Notes added successfully");

    console.log();

    // Update report statuses
    console.log("=".repeat(60));
    console.log("SCENARIO 7: Updating Report Statuses");
    console.log("=".repeat(60));

    console.log(`Investigator 1 resolving Report #${reports[0]}...`);
    tx = await contract.connect(investigator1).updateReportStatus(reports[0], STATUS.RESOLVED);
    await tx.wait();
    console.log(`  Report #${reports[0]} marked as RESOLVED`);

    console.log(`Investigator 1 resolving Report #${reports[1]}...`);
    tx = await contract.connect(investigator1).updateReportStatus(reports[1], STATUS.RESOLVED);
    await tx.wait();
    console.log(`  Report #${reports[1]} marked as RESOLVED`);

    console.log(`Investigator 2 dismissing Report #${reports[2]}...`);
    tx = await contract.connect(investigator2).updateReportStatus(reports[2], STATUS.DISMISSED);
    await tx.wait();
    console.log(`  Report #${reports[2]} marked as DISMISSED`);

    console.log();

    // Final statistics
    console.log("=".repeat(60));
    console.log("SCENARIO 8: Final System Statistics");
    console.log("=".repeat(60));

    const [totalFinal, resolvedFinal, pendingFinal] = await contract.getSystemStats();
    console.log("Final statistics:");
    console.log("  Total reports:", totalFinal.toString());
    console.log("  Resolved reports:", resolvedFinal.toString());
    console.log("  Pending reports:", pendingFinal.toString());
    console.log("  Resolution rate:", ((Number(resolvedFinal) / Number(totalFinal)) * 100).toFixed(2) + "%");
    console.log();

    // Test access control
    console.log("=".repeat(60));
    console.log("SCENARIO 9: Testing Access Control");
    console.log("=".repeat(60));

    console.log("Testing unauthorized access attempts...");

    try {
        console.log("Reporter 1 attempting to add investigator (should fail)...");
        await contract.connect(reporter1).addInvestigator(await reporter2.getAddress());
        console.log("  ERROR: Should have failed!");
    } catch (error) {
        console.log("  Correctly rejected: Only authority can add investigators");
    }

    try {
        console.log("Reporter 1 attempting to assign investigator (should fail)...");
        await contract.connect(reporter1).assignInvestigator(reports[3], inv1Address);
        console.log("  ERROR: Should have failed!");
    } catch (error) {
        console.log("  Correctly rejected: Only authority can assign investigators");
    }

    console.log();

    // Display all report statuses
    console.log("=".repeat(60));
    console.log("FINAL REPORT SUMMARY");
    console.log("=".repeat(60));

    for (const id of reports) {
        const [status, submissionTime, investigator, exists] = await contract.getReportBasicInfo(id);
        console.log(`Report #${id}:`);
        console.log(`  Status: ${STATUS_NAMES[status]}`);
        console.log(`  Investigator: ${investigator === hre.ethers.ZeroAddress ? "Not assigned" : investigator.substring(0, 10) + "..."}`);
        console.log();
    }

    console.log("=".repeat(60));
    console.log("SIMULATION COMPLETED SUCCESSFULLY");
    console.log("=".repeat(60));
    console.log();
    console.log("All scenarios executed without errors!");
    console.log("Contract Address:", contractAddress);
    console.log();
}

// Helper function to extract report ID from transaction receipt
function extractReportId(receipt, contract) {
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
        return parsedEvent.args.reportId;
    }

    throw new Error("ReportSubmitted event not found in transaction");
}

// Execute simulation
main()
    .then(() => {
        console.log("Simulation script completed successfully!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\nSimulation failed!");
        console.error(error);
        process.exit(1);
    });
