const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

/**
 * Comprehensive Test Suite for Anonymous Reporting System
 * 45+ Test Cases covering all aspects of the contract
 */

describe("AnonymousReporting Contract - Comprehensive Test Suite", function () {
    // Test fixture to deploy contract
    async function deployContractFixture() {
        const [authority, investigator1, investigator2, reporter1, reporter2, reporter3, other] = await ethers.getSigners();

        const AnonymousReporting = await ethers.getContractFactory("AnonymousReporting");
        const contract = await AnonymousReporting.deploy();
        await contract.waitForDeployment();

        return { contract, authority, investigator1, investigator2, reporter1, reporter2, reporter3, other };
    }

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

    // ============================================================
    // 1. DEPLOYMENT AND INITIALIZATION TESTS (5 tests)
    // ============================================================
    describe("1. Deployment and Initialization", function () {
        it("1.1 Should deploy successfully with valid address", async function () {
            const { contract } = await loadFixture(deployContractFixture);
            expect(await contract.getAddress()).to.be.properAddress;
        });

        it("1.2 Should set the correct authority address", async function () {
            const { contract, authority } = await loadFixture(deployContractFixture);
            expect(await contract.authority()).to.equal(await authority.getAddress());
        });

        it("1.3 Should initialize with zero total reports", async function () {
            const { contract } = await loadFixture(deployContractFixture);
            const [total] = await contract.getSystemStats();
            expect(total).to.equal(0);
        });

        it("1.4 Should initialize with zero resolved reports", async function () {
            const { contract } = await loadFixture(deployContractFixture);
            const [, resolved] = await contract.getSystemStats();
            expect(resolved).to.equal(0);
        });

        it("1.5 Should initialize with zero pending reports", async function () {
            const { contract } = await loadFixture(deployContractFixture);
            const [, , pending] = await contract.getSystemStats();
            expect(pending).to.equal(0);
        });
    });

    // ============================================================
    // 2. INVESTIGATOR MANAGEMENT TESTS (8 tests)
    // ============================================================
    describe("2. Investigator Management", function () {
        it("2.1 Should allow authority to add investigator", async function () {
            const { contract, authority, investigator1 } = await loadFixture(deployContractFixture);

            await expect(contract.connect(authority).addInvestigator(await investigator1.getAddress()))
                .to.emit(contract, "InvestigatorAdded")
                .withArgs(await investigator1.getAddress());

            expect(await contract.isAuthorizedInvestigator(await investigator1.getAddress())).to.be.true;
        });

        it("2.2 Should allow authority to remove investigator", async function () {
            const { contract, authority, investigator1 } = await loadFixture(deployContractFixture);

            const inv1Address = await investigator1.getAddress();
            await contract.connect(authority).addInvestigator(inv1Address);
            expect(await contract.isAuthorizedInvestigator(inv1Address)).to.be.true;

            await expect(contract.connect(authority).removeInvestigator(inv1Address))
                .to.emit(contract, "InvestigatorRemoved")
                .withArgs(inv1Address);

            expect(await contract.isAuthorizedInvestigator(inv1Address)).to.be.false;
        });

        it("2.3 Should prevent non-authority from adding investigators", async function () {
            const { contract, investigator1, other } = await loadFixture(deployContractFixture);

            await expect(
                contract.connect(other).addInvestigator(await investigator1.getAddress())
            ).to.be.revertedWith("Only authority can perform this action");
        });

        it("2.4 Should prevent non-authority from removing investigators", async function () {
            const { contract, authority, investigator1, other } = await loadFixture(deployContractFixture);

            const inv1Address = await investigator1.getAddress();
            await contract.connect(authority).addInvestigator(inv1Address);

            await expect(
                contract.connect(other).removeInvestigator(inv1Address)
            ).to.be.revertedWith("Only authority can perform this action");
        });

        it("2.5 Should correctly report investigator authorization status", async function () {
            const { contract, authority, investigator1, other } = await loadFixture(deployContractFixture);

            expect(await contract.isAuthorizedInvestigator(await investigator1.getAddress())).to.be.false;

            await contract.connect(authority).addInvestigator(await investigator1.getAddress());

            expect(await contract.isAuthorizedInvestigator(await investigator1.getAddress())).to.be.true;
            expect(await contract.isAuthorizedInvestigator(await other.getAddress())).to.be.false;
        });

        it("2.6 Should allow adding multiple investigators", async function () {
            const { contract, authority, investigator1, investigator2 } = await loadFixture(deployContractFixture);

            await contract.connect(authority).addInvestigator(await investigator1.getAddress());
            await contract.connect(authority).addInvestigator(await investigator2.getAddress());

            expect(await contract.isAuthorizedInvestigator(await investigator1.getAddress())).to.be.true;
            expect(await contract.isAuthorizedInvestigator(await investigator2.getAddress())).to.be.true;
        });

        it("2.7 Should allow re-adding removed investigator", async function () {
            const { contract, authority, investigator1 } = await loadFixture(deployContractFixture);

            const inv1Address = await investigator1.getAddress();

            await contract.connect(authority).addInvestigator(inv1Address);
            await contract.connect(authority).removeInvestigator(inv1Address);
            await contract.connect(authority).addInvestigator(inv1Address);

            expect(await contract.isAuthorizedInvestigator(inv1Address)).to.be.true;
        });

        it("2.8 Should emit correct events for investigator operations", async function () {
            const { contract, authority, investigator1 } = await loadFixture(deployContractFixture);

            const inv1Address = await investigator1.getAddress();

            await expect(contract.connect(authority).addInvestigator(inv1Address))
                .to.emit(contract, "InvestigatorAdded")
                .withArgs(inv1Address);

            await expect(contract.connect(authority).removeInvestigator(inv1Address))
                .to.emit(contract, "InvestigatorRemoved")
                .withArgs(inv1Address);
        });
    });

    // ============================================================
    // 3. REPORT SUBMISSION TESTS (10 tests)
    // ============================================================
    describe("3. Report Submission", function () {
        it("3.1 Should allow anyone to submit a report", async function () {
            const { contract, reporter1 } = await loadFixture(deployContractFixture);

            await expect(contract.connect(reporter1).submitAnonymousReport(CATEGORIES.CORRUPTION, true))
                .to.emit(contract, "ReportSubmitted");
        });

        it("3.2 Should increment report count on submission", async function () {
            const { contract, reporter1 } = await loadFixture(deployContractFixture);

            await contract.connect(reporter1).submitAnonymousReport(CATEGORIES.FRAUD, false);

            const [total] = await contract.getSystemStats();
            expect(total).to.equal(1);
        });

        it("3.3 Should emit ReportSubmitted event with correct parameters", async function () {
            const { contract, reporter1 } = await loadFixture(deployContractFixture);

            const tx = await contract.connect(reporter1).submitAnonymousReport(CATEGORIES.ENVIRONMENTAL, true);
            const receipt = await tx.wait();

            const event = receipt.logs.find(log => {
                try {
                    const parsed = contract.interface.parseLog(log);
                    return parsed && parsed.name === "ReportSubmitted";
                } catch {
                    return false;
                }
            });

            expect(event).to.not.be.undefined;
            const parsedEvent = contract.interface.parseLog(event);
            expect(parsedEvent.args.reportId).to.equal(1);
            expect(parsedEvent.args.category).to.equal(CATEGORIES.ENVIRONMENTAL);
        });

        it("3.4 Should reject invalid category (> 5)", async function () {
            const { contract, reporter1 } = await loadFixture(deployContractFixture);

            await expect(
                contract.connect(reporter1).submitAnonymousReport(6, true)
            ).to.be.revertedWith("Invalid category");
        });

        it("3.5 Should reject invalid category (< 0)", async function () {
            const { contract, reporter1 } = await loadFixture(deployContractFixture);

            await expect(
                contract.connect(reporter1).submitAnonymousReport(255, true)
            ).to.be.reverted;
        });

        it("3.6 Should handle multiple reports from same reporter", async function () {
            const { contract, reporter1 } = await loadFixture(deployContractFixture);

            await contract.connect(reporter1).submitAnonymousReport(CATEGORIES.CORRUPTION, true);
            await contract.connect(reporter1).submitAnonymousReport(CATEGORIES.FRAUD, false);
            await contract.connect(reporter1).submitAnonymousReport(CATEGORIES.SAFETY, true);

            const [total] = await contract.getSystemStats();
            expect(total).to.equal(3);
        });

        it("3.7 Should handle reports from multiple reporters", async function () {
            const { contract, reporter1, reporter2, reporter3 } = await loadFixture(deployContractFixture);

            await contract.connect(reporter1).submitAnonymousReport(CATEGORIES.CORRUPTION, true);
            await contract.connect(reporter2).submitAnonymousReport(CATEGORIES.FRAUD, false);
            await contract.connect(reporter3).submitAnonymousReport(CATEGORIES.ENVIRONMENTAL, true);

            const [total] = await contract.getSystemStats();
            expect(total).to.equal(3);
        });

        it("3.8 Should accept all valid categories (0-5)", async function () {
            const { contract, reporter1 } = await loadFixture(deployContractFixture);

            for (let category = 0; category <= 5; category++) {
                await expect(
                    contract.connect(reporter1).submitAnonymousReport(category, true)
                ).to.not.be.reverted;
            }

            const [total] = await contract.getSystemStats();
            expect(total).to.equal(6);
        });

        it("3.9 Should handle both anonymous and non-anonymous reports", async function () {
            const { contract, reporter1 } = await loadFixture(deployContractFixture);

            await contract.connect(reporter1).submitAnonymousReport(CATEGORIES.CORRUPTION, true);
            await contract.connect(reporter1).submitAnonymousReport(CATEGORIES.FRAUD, false);

            const [total] = await contract.getSystemStats();
            expect(total).to.equal(2);
        });

        it("3.10 Should return incremental report IDs", async function () {
            const { contract, reporter1 } = await loadFixture(deployContractFixture);

            const tx1 = await contract.connect(reporter1).submitAnonymousReport(CATEGORIES.CORRUPTION, true);
            const receipt1 = await tx1.wait();
            const event1 = receipt1.logs.find(log => {
                try {
                    return contract.interface.parseLog(log)?.name === "ReportSubmitted";
                } catch { return false; }
            });
            const reportId1 = contract.interface.parseLog(event1).args.reportId;

            const tx2 = await contract.connect(reporter1).submitAnonymousReport(CATEGORIES.FRAUD, false);
            const receipt2 = await tx2.wait();
            const event2 = receipt2.logs.find(log => {
                try {
                    return contract.interface.parseLog(log)?.name === "ReportSubmitted";
                } catch { return false; }
            });
            const reportId2 = contract.interface.parseLog(event2).args.reportId;

            expect(reportId2).to.equal(reportId1 + 1n);
        });
    });

    // ============================================================
    // 4. REPORT ASSIGNMENT TESTS (8 tests)
    // ============================================================
    describe("4. Report Assignment", function () {
        it("4.1 Should allow authority to assign report to investigator", async function () {
            const { contract, authority, investigator1, reporter1 } = await loadFixture(deployContractFixture);

            const inv1Address = await investigator1.getAddress();
            await contract.connect(authority).addInvestigator(inv1Address);

            await contract.connect(reporter1).submitAnonymousReport(CATEGORIES.CORRUPTION, true);
            const reportId = 1;

            await expect(contract.connect(authority).assignInvestigator(reportId, inv1Address))
                .to.emit(contract, "ReportAssigned")
                .withArgs(reportId, inv1Address);
        });

        it("4.2 Should update report status to UNDER_INVESTIGATION on assignment", async function () {
            const { contract, authority, investigator1, reporter1 } = await loadFixture(deployContractFixture);

            const inv1Address = await investigator1.getAddress();
            await contract.connect(authority).addInvestigator(inv1Address);

            await contract.connect(reporter1).submitAnonymousReport(CATEGORIES.FRAUD, false);
            const reportId = 1;

            await contract.connect(authority).assignInvestigator(reportId, inv1Address);

            const [status] = await contract.getReportBasicInfo(reportId);
            expect(status).to.equal(STATUS.UNDER_INVESTIGATION);
        });

        it("4.3 Should prevent assignment to non-authorized investigator", async function () {
            const { contract, authority, reporter1, other } = await loadFixture(deployContractFixture);

            await contract.connect(reporter1).submitAnonymousReport(CATEGORIES.SAFETY, true);
            const reportId = 1;

            await expect(
                contract.connect(authority).assignInvestigator(reportId, await other.getAddress())
            ).to.be.revertedWith("Investigator not authorized");
        });

        it("4.4 Should prevent non-authority from assigning reports", async function () {
            const { contract, authority, investigator1, reporter1, other } = await loadFixture(deployContractFixture);

            const inv1Address = await investigator1.getAddress();
            await contract.connect(authority).addInvestigator(inv1Address);

            await contract.connect(reporter1).submitAnonymousReport(CATEGORIES.CORRUPTION, true);
            const reportId = 1;

            await expect(
                contract.connect(other).assignInvestigator(reportId, inv1Address)
            ).to.be.revertedWith("Only authority can perform this action");
        });

        it("4.5 Should prevent reassignment of already assigned report", async function () {
            const { contract, authority, investigator1, investigator2, reporter1 } = await loadFixture(deployContractFixture);

            const inv1Address = await investigator1.getAddress();
            const inv2Address = await investigator2.getAddress();
            await contract.connect(authority).addInvestigator(inv1Address);
            await contract.connect(authority).addInvestigator(inv2Address);

            await contract.connect(reporter1).submitAnonymousReport(CATEGORIES.FRAUD, false);
            const reportId = 1;

            await contract.connect(authority).assignInvestigator(reportId, inv1Address);

            await expect(
                contract.connect(authority).assignInvestigator(reportId, inv2Address)
            ).to.be.revertedWith("Report already assigned");
        });

        it("4.6 Should prevent assignment of non-existent report", async function () {
            const { contract, authority, investigator1 } = await loadFixture(deployContractFixture);

            const inv1Address = await investigator1.getAddress();
            await contract.connect(authority).addInvestigator(inv1Address);

            await expect(
                contract.connect(authority).assignInvestigator(999, inv1Address)
            ).to.be.revertedWith("Report does not exist");
        });

        it("4.7 Should create investigation record on assignment", async function () {
            const { contract, authority, investigator1, reporter1 } = await loadFixture(deployContractFixture);

            const inv1Address = await investigator1.getAddress();
            await contract.connect(authority).addInvestigator(inv1Address);

            await contract.connect(reporter1).submitAnonymousReport(CATEGORIES.ENVIRONMENTAL, true);
            const reportId = 1;

            await contract.connect(authority).assignInvestigator(reportId, inv1Address);

            const [investigator, , , isActive] = await contract.getInvestigationInfo(reportId);
            expect(investigator).to.equal(inv1Address);
            expect(isActive).to.be.true;
        });

        it("4.8 Should allow multiple reports assigned to same investigator", async function () {
            const { contract, authority, investigator1, reporter1, reporter2 } = await loadFixture(deployContractFixture);

            const inv1Address = await investigator1.getAddress();
            await contract.connect(authority).addInvestigator(inv1Address);

            await contract.connect(reporter1).submitAnonymousReport(CATEGORIES.CORRUPTION, true);
            await contract.connect(reporter2).submitAnonymousReport(CATEGORIES.FRAUD, false);

            await contract.connect(authority).assignInvestigator(1, inv1Address);
            await contract.connect(authority).assignInvestigator(2, inv1Address);

            const [status1] = await contract.getReportBasicInfo(1);
            const [status2] = await contract.getReportBasicInfo(2);

            expect(status1).to.equal(STATUS.UNDER_INVESTIGATION);
            expect(status2).to.equal(STATUS.UNDER_INVESTIGATION);
        });
    });

    // ============================================================
    // 5. REPORT STATUS UPDATE TESTS (7 tests)
    // ============================================================
    describe("5. Report Status Updates", function () {
        it("5.1 Should allow assigned investigator to update report status", async function () {
            const { contract, authority, investigator1, reporter1 } = await loadFixture(deployContractFixture);

            const inv1Address = await investigator1.getAddress();
            await contract.connect(authority).addInvestigator(inv1Address);

            await contract.connect(reporter1).submitAnonymousReport(CATEGORIES.CORRUPTION, true);
            const reportId = 1;

            await contract.connect(authority).assignInvestigator(reportId, inv1Address);

            await expect(contract.connect(investigator1).updateReportStatus(reportId, STATUS.RESOLVED))
                .to.emit(contract, "ReportStatusChanged")
                .withArgs(reportId, STATUS.RESOLVED);
        });

        it("5.2 Should increment resolved count when report is resolved", async function () {
            const { contract, authority, investigator1, reporter1 } = await loadFixture(deployContractFixture);

            const inv1Address = await investigator1.getAddress();
            await contract.connect(authority).addInvestigator(inv1Address);

            await contract.connect(reporter1).submitAnonymousReport(CATEGORIES.FRAUD, false);
            const reportId = 1;

            await contract.connect(authority).assignInvestigator(reportId, inv1Address);
            await contract.connect(investigator1).updateReportStatus(reportId, STATUS.RESOLVED);

            const [, resolved] = await contract.getSystemStats();
            expect(resolved).to.equal(1);
        });

        it("5.3 Should allow authority to update report status", async function () {
            const { contract, authority, reporter1 } = await loadFixture(deployContractFixture);

            await contract.connect(reporter1).submitAnonymousReport(CATEGORIES.SAFETY, true);
            const reportId = 1;

            await expect(contract.connect(authority).updateReportStatus(reportId, STATUS.DISMISSED))
                .to.emit(contract, "ReportStatusChanged")
                .withArgs(reportId, STATUS.DISMISSED);
        });

        it("5.4 Should prevent unauthorized user from updating status", async function () {
            const { contract, authority, investigator1, reporter1, other } = await loadFixture(deployContractFixture);

            const inv1Address = await investigator1.getAddress();
            await contract.connect(authority).addInvestigator(inv1Address);

            await contract.connect(reporter1).submitAnonymousReport(CATEGORIES.CORRUPTION, true);
            const reportId = 1;

            await contract.connect(authority).assignInvestigator(reportId, inv1Address);

            await expect(
                contract.connect(other).updateReportStatus(reportId, STATUS.RESOLVED)
            ).to.be.revertedWith("Not authorized to update this report");
        });

        it("5.5 Should not allow non-assigned investigator to update status", async function () {
            const { contract, authority, investigator1, investigator2, reporter1 } = await loadFixture(deployContractFixture);

            const inv1Address = await investigator1.getAddress();
            await contract.connect(authority).addInvestigator(inv1Address);
            await contract.connect(authority).addInvestigator(await investigator2.getAddress());

            await contract.connect(reporter1).submitAnonymousReport(CATEGORIES.FRAUD, false);
            const reportId = 1;

            await contract.connect(authority).assignInvestigator(reportId, inv1Address);

            await expect(
                contract.connect(investigator2).updateReportStatus(reportId, STATUS.RESOLVED)
            ).to.be.revertedWith("Not authorized to update this report");
        });

        it("5.6 Should deactivate investigation when resolved", async function () {
            const { contract, authority, investigator1, reporter1 } = await loadFixture(deployContractFixture);

            const inv1Address = await investigator1.getAddress();
            await contract.connect(authority).addInvestigator(inv1Address);

            await contract.connect(reporter1).submitAnonymousReport(CATEGORIES.ENVIRONMENTAL, true);
            const reportId = 1;

            await contract.connect(authority).assignInvestigator(reportId, inv1Address);
            await contract.connect(investigator1).updateReportStatus(reportId, STATUS.RESOLVED);

            const [, , , isActive] = await contract.getInvestigationInfo(reportId);
            expect(isActive).to.be.false;
        });

        it("5.7 Should handle multiple status updates correctly", async function () {
            const { contract, authority, investigator1, reporter1, reporter2 } = await loadFixture(deployContractFixture);

            const inv1Address = await investigator1.getAddress();
            await contract.connect(authority).addInvestigator(inv1Address);

            await contract.connect(reporter1).submitAnonymousReport(CATEGORIES.CORRUPTION, true);
            await contract.connect(reporter2).submitAnonymousReport(CATEGORIES.FRAUD, false);

            await contract.connect(authority).assignInvestigator(1, inv1Address);
            await contract.connect(authority).assignInvestigator(2, inv1Address);

            await contract.connect(investigator1).updateReportStatus(1, STATUS.RESOLVED);
            await contract.connect(investigator1).updateReportStatus(2, STATUS.DISMISSED);

            const [, resolved] = await contract.getSystemStats();
            expect(resolved).to.equal(1);
        });
    });

    // ============================================================
    // 6. INVESTIGATION NOTES TESTS (4 tests)
    // ============================================================
    describe("6. Investigation Notes", function () {
        it("6.1 Should allow assigned investigator to add notes", async function () {
            const { contract, authority, investigator1, reporter1 } = await loadFixture(deployContractFixture);

            const inv1Address = await investigator1.getAddress();
            await contract.connect(authority).addInvestigator(inv1Address);

            await contract.connect(reporter1).submitAnonymousReport(CATEGORIES.ENVIRONMENTAL, true);
            const reportId = 1;

            await contract.connect(authority).assignInvestigator(reportId, inv1Address);

            await expect(
                contract.connect(investigator1).addInvestigationNotes(reportId, "Initial investigation notes")
            ).to.not.be.reverted;
        });

        it("6.2 Should allow authority to add notes", async function () {
            const { contract, authority, reporter1 } = await loadFixture(deployContractFixture);

            await contract.connect(reporter1).submitAnonymousReport(CATEGORIES.FRAUD, false);
            const reportId = 1;

            await expect(
                contract.connect(authority).addInvestigationNotes(reportId, "Authority notes")
            ).to.not.be.reverted;
        });

        it("6.3 Should prevent unauthorized user from adding notes", async function () {
            const { contract, authority, investigator1, reporter1, other } = await loadFixture(deployContractFixture);

            const inv1Address = await investigator1.getAddress();
            await contract.connect(authority).addInvestigator(inv1Address);

            await contract.connect(reporter1).submitAnonymousReport(CATEGORIES.CORRUPTION, true);
            const reportId = 1;

            await contract.connect(authority).assignInvestigator(reportId, inv1Address);

            await expect(
                contract.connect(other).addInvestigationNotes(reportId, "Unauthorized notes")
            ).to.be.revertedWith("Not authorized to update this report");
        });

        it("6.4 Should prevent non-assigned investigator from adding notes", async function () {
            const { contract, authority, investigator1, investigator2, reporter1 } = await loadFixture(deployContractFixture);

            const inv1Address = await investigator1.getAddress();
            await contract.connect(authority).addInvestigator(inv1Address);
            await contract.connect(authority).addInvestigator(await investigator2.getAddress());

            await contract.connect(reporter1).submitAnonymousReport(CATEGORIES.SAFETY, true);
            const reportId = 1;

            await contract.connect(authority).assignInvestigator(reportId, inv1Address);

            await expect(
                contract.connect(investigator2).addInvestigationNotes(reportId, "Notes from wrong investigator")
            ).to.be.revertedWith("Not authorized to update this report");
        });
    });

    // ============================================================
    // 7. QUERY FUNCTIONS TESTS (4 tests)
    // ============================================================
    describe("7. Query Functions", function () {
        it("7.1 Should return correct report basic info", async function () {
            const { contract, reporter1 } = await loadFixture(deployContractFixture);

            await contract.connect(reporter1).submitAnonymousReport(CATEGORIES.SAFETY, true);
            const reportId = 1;

            const [status, submissionTime, investigator, exists] = await contract.getReportBasicInfo(reportId);

            expect(status).to.equal(STATUS.SUBMITTED);
            expect(exists).to.be.true;
            expect(investigator).to.equal(ethers.ZeroAddress);
            expect(submissionTime).to.be.gt(0);
        });

        it("7.2 Should return correct system statistics", async function () {
            const { contract, authority, investigator1, reporter1, reporter2 } = await loadFixture(deployContractFixture);

            const inv1Address = await investigator1.getAddress();
            await contract.connect(authority).addInvestigator(inv1Address);

            await contract.connect(reporter1).submitAnonymousReport(CATEGORIES.CORRUPTION, true);
            await contract.connect(reporter2).submitAnonymousReport(CATEGORIES.FRAUD, false);
            await contract.connect(reporter1).submitAnonymousReport(CATEGORIES.SAFETY, true);

            await contract.connect(authority).assignInvestigator(1, inv1Address);
            await contract.connect(investigator1).updateReportStatus(1, STATUS.RESOLVED);

            const [total, resolved, pending] = await contract.getSystemStats();

            expect(total).to.equal(3);
            expect(resolved).to.equal(1);
            expect(pending).to.equal(2);
        });

        it("7.3 Should revert for non-existent report", async function () {
            const { contract } = await loadFixture(deployContractFixture);

            await expect(
                contract.getReportBasicInfo(999)
            ).to.be.revertedWith("Report does not exist");
        });

        it("7.4 Should return correct investigation info", async function () {
            const { contract, authority, investigator1, reporter1 } = await loadFixture(deployContractFixture);

            const inv1Address = await investigator1.getAddress();
            await contract.connect(authority).addInvestigator(inv1Address);

            await contract.connect(reporter1).submitAnonymousReport(CATEGORIES.FRAUD, false);
            const reportId = 1;

            await contract.connect(authority).assignInvestigator(reportId, inv1Address);

            const [investigator, startTime, lastUpdate, isActive] = await contract.getInvestigationInfo(reportId);

            expect(investigator).to.equal(inv1Address);
            expect(startTime).to.be.gt(0);
            expect(lastUpdate).to.be.gt(0);
            expect(isActive).to.be.true;
        });
    });

    // ============================================================
    // 8. AUTHORITY TRANSFER TESTS (3 tests)
    // ============================================================
    describe("8. Authority Transfer", function () {
        it("8.1 Should allow authority to transfer ownership", async function () {
            const { contract, authority, other } = await loadFixture(deployContractFixture);

            const otherAddress = await other.getAddress();
            await contract.connect(authority).transferAuthority(otherAddress);

            expect(await contract.authority()).to.equal(otherAddress);
        });

        it("8.2 Should prevent transfer to zero address", async function () {
            const { contract, authority } = await loadFixture(deployContractFixture);

            await expect(
                contract.connect(authority).transferAuthority(ethers.ZeroAddress)
            ).to.be.revertedWith("Invalid authority address");
        });

        it("8.3 Should prevent non-authority from transferring", async function () {
            const { contract, other } = await loadFixture(deployContractFixture);

            await expect(
                contract.connect(other).transferAuthority(await other.getAddress())
            ).to.be.revertedWith("Only authority can perform this action");
        });
    });

    // ============================================================
    // 9. EDGE CASES AND BOUNDARY TESTS (6 tests)
    // ============================================================
    describe("9. Edge Cases and Boundary Tests", function () {
        it("9.1 Should handle maximum number of reports", async function () {
            const { contract, reporter1 } = await loadFixture(deployContractFixture);

            // Submit multiple reports
            for (let i = 0; i < 10; i++) {
                await contract.connect(reporter1).submitAnonymousReport(CATEGORIES.OTHER, true);
            }

            const [total] = await contract.getSystemStats();
            expect(total).to.equal(10);
        });

        it("9.2 Should handle all valid category values", async function () {
            const { contract, reporter1 } = await loadFixture(deployContractFixture);

            for (let category = 0; category <= 5; category++) {
                await expect(
                    contract.connect(reporter1).submitAnonymousReport(category, true)
                ).to.not.be.reverted;
            }
        });

        it("9.3 Should handle empty notes string", async function () {
            const { contract, authority, investigator1, reporter1 } = await loadFixture(deployContractFixture);

            const inv1Address = await investigator1.getAddress();
            await contract.connect(authority).addInvestigator(inv1Address);

            await contract.connect(reporter1).submitAnonymousReport(CATEGORIES.CORRUPTION, true);
            await contract.connect(authority).assignInvestigator(1, inv1Address);

            await expect(
                contract.connect(investigator1).addInvestigationNotes(1, "")
            ).to.not.be.reverted;
        });

        it("9.4 Should maintain consistency with concurrent operations", async function () {
            const { contract, authority, investigator1, reporter1, reporter2, reporter3 } = await loadFixture(deployContractFixture);

            const inv1Address = await investigator1.getAddress();
            await contract.connect(authority).addInvestigator(inv1Address);

            // Submit multiple reports concurrently
            await Promise.all([
                contract.connect(reporter1).submitAnonymousReport(CATEGORIES.CORRUPTION, true),
                contract.connect(reporter2).submitAnonymousReport(CATEGORIES.FRAUD, false),
                contract.connect(reporter3).submitAnonymousReport(CATEGORIES.SAFETY, true)
            ]);

            const [total] = await contract.getSystemStats();
            expect(total).to.equal(3);
        });

        it("9.5 Should correctly calculate pending reports", async function () {
            const { contract, authority, investigator1, reporter1, reporter2, reporter3 } = await loadFixture(deployContractFixture);

            const inv1Address = await investigator1.getAddress();
            await contract.connect(authority).addInvestigator(inv1Address);

            await contract.connect(reporter1).submitAnonymousReport(CATEGORIES.CORRUPTION, true);
            await contract.connect(reporter2).submitAnonymousReport(CATEGORIES.FRAUD, false);
            await contract.connect(reporter3).submitAnonymousReport(CATEGORIES.SAFETY, true);

            await contract.connect(authority).assignInvestigator(1, inv1Address);
            await contract.connect(investigator1).updateReportStatus(1, STATUS.RESOLVED);

            const [total, resolved, pending] = await contract.getSystemStats();
            expect(pending).to.equal(total - resolved);
        });

        it("9.6 Should prevent integer overflow in report count", async function () {
            const { contract, reporter1 } = await loadFixture(deployContractFixture);

            // Submit reports and verify count doesn't overflow
            for (let i = 0; i < 100; i++) {
                await contract.connect(reporter1).submitAnonymousReport(CATEGORIES.OTHER, true);
            }

            const [total] = await contract.getSystemStats();
            expect(total).to.equal(100);
        });
    });
});
