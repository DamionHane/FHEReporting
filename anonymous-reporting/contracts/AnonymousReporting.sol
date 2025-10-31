// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint8, euint32, ebool, eaddress } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract AnonymousReporting is SepoliaConfig {

    address public authority;
    uint32 public totalReports;
    uint32 public resolvedReports;

    enum ReportCategory {
        CORRUPTION,
        FRAUD,
        ENVIRONMENTAL,
        SAFETY,
        DISCRIMINATION,
        OTHER
    }

    enum ReportStatus {
        SUBMITTED,
        UNDER_INVESTIGATION,
        RESOLVED,
        DISMISSED
    }

    struct Report {
        euint32 reportId;
        eaddress reporter; // Encrypted reporter address
        euint8 category;
        euint32 timestamp;
        ebool isAnonymous;
        ReportStatus status;
        bool exists;
        uint256 submissionTime;
        address investigator;
    }

    struct Investigation {
        uint32 reportId;
        address investigator;
        uint256 startTime;
        uint256 lastUpdate;
        bool isActive;
        string notes; // Only visible to authority
    }

    mapping(uint32 => Report) public reports;
    mapping(uint32 => Investigation) public investigations;
    mapping(address => uint32[]) public investigatorReports;
    mapping(address => bool) public authorizedInvestigators;

    // Events
    event ReportSubmitted(uint32 indexed reportId, uint8 category, uint256 timestamp);
    event ReportAssigned(uint32 indexed reportId, address indexed investigator);
    event ReportStatusChanged(uint32 indexed reportId, ReportStatus newStatus);
    event InvestigatorAdded(address indexed investigator);
    event InvestigatorRemoved(address indexed investigator);

    modifier onlyAuthority() {
        require(msg.sender == authority, "Only authority can perform this action");
        _;
    }

    modifier onlyAuthorizedInvestigator() {
        require(authorizedInvestigators[msg.sender], "Not an authorized investigator");
        _;
    }

    modifier reportExists(uint32 _reportId) {
        require(reports[_reportId].exists, "Report does not exist");
        _;
    }

    constructor() {
        authority = msg.sender;
        totalReports = 0;
        resolvedReports = 0;
    }

    // Submit anonymous report with encrypted data
    function submitAnonymousReport(
        uint8 _category,
        bool _isAnonymous
    ) external returns (uint32) {
        require(_category < 6, "Invalid category");

        totalReports++;
        uint32 reportId = totalReports;

        // Encrypt sensitive data
        euint32 encryptedId = FHE.asEuint32(reportId);
        eaddress encryptedReporter = FHE.asEaddress(msg.sender);
        euint8 encryptedCategory = FHE.asEuint8(_category);
        euint32 encryptedTimestamp = FHE.asEuint32(uint32(block.timestamp));
        ebool encryptedIsAnonymous = FHE.asEbool(_isAnonymous);

        reports[reportId] = Report({
            reportId: encryptedId,
            reporter: encryptedReporter,
            category: encryptedCategory,
            timestamp: encryptedTimestamp,
            isAnonymous: encryptedIsAnonymous,
            status: ReportStatus.SUBMITTED,
            exists: true,
            submissionTime: block.timestamp,
            investigator: address(0)
        });

        // Set access control permissions
        FHE.allowThis(encryptedId);
        FHE.allowThis(encryptedReporter);
        FHE.allowThis(encryptedCategory);
        FHE.allowThis(encryptedTimestamp);
        FHE.allowThis(encryptedIsAnonymous);

        // Allow authority to access encrypted data
        FHE.allow(encryptedId, authority);
        FHE.allow(encryptedReporter, authority);
        FHE.allow(encryptedCategory, authority);
        FHE.allow(encryptedTimestamp, authority);
        FHE.allow(encryptedIsAnonymous, authority);

        emit ReportSubmitted(reportId, _category, block.timestamp);

        return reportId;
    }

    // Authority assigns report to investigator
    function assignInvestigator(uint32 _reportId, address _investigator)
        external
        onlyAuthority
        reportExists(_reportId)
    {
        require(authorizedInvestigators[_investigator], "Investigator not authorized");
        require(reports[_reportId].status == ReportStatus.SUBMITTED, "Report already assigned");

        reports[_reportId].investigator = _investigator;
        reports[_reportId].status = ReportStatus.UNDER_INVESTIGATION;

        investigations[_reportId] = Investigation({
            reportId: _reportId,
            investigator: _investigator,
            startTime: block.timestamp,
            lastUpdate: block.timestamp,
            isActive: true,
            notes: ""
        });

        investigatorReports[_investigator].push(_reportId);

        // Grant investigator access to encrypted data
        FHE.allow(reports[_reportId].reportId, _investigator);
        FHE.allow(reports[_reportId].category, _investigator);
        FHE.allow(reports[_reportId].timestamp, _investigator);

        emit ReportAssigned(_reportId, _investigator);
    }

    // Update report status (only by assigned investigator or authority)
    function updateReportStatus(uint32 _reportId, ReportStatus _newStatus)
        external
        reportExists(_reportId)
    {
        require(
            msg.sender == authority ||
            (authorizedInvestigators[msg.sender] && reports[_reportId].investigator == msg.sender),
            "Not authorized to update this report"
        );

        ReportStatus oldStatus = reports[_reportId].status;
        reports[_reportId].status = _newStatus;

        if (_newStatus == ReportStatus.RESOLVED && oldStatus != ReportStatus.RESOLVED) {
            resolvedReports++;
            investigations[_reportId].isActive = false;
        }

        investigations[_reportId].lastUpdate = block.timestamp;

        emit ReportStatusChanged(_reportId, _newStatus);
    }

    // Add investigation notes (only by assigned investigator or authority)
    function addInvestigationNotes(uint32 _reportId, string memory _notes)
        external
        reportExists(_reportId)
    {
        require(
            msg.sender == authority ||
            (authorizedInvestigators[msg.sender] && reports[_reportId].investigator == msg.sender),
            "Not authorized to update this report"
        );

        investigations[_reportId].notes = _notes;
        investigations[_reportId].lastUpdate = block.timestamp;
    }

    // Authority functions
    function addInvestigator(address _investigator) external onlyAuthority {
        authorizedInvestigators[_investigator] = true;
        emit InvestigatorAdded(_investigator);
    }

    function removeInvestigator(address _investigator) external onlyAuthority {
        authorizedInvestigators[_investigator] = false;
        emit InvestigatorRemoved(_investigator);
    }

    // View functions
    function getReportBasicInfo(uint32 _reportId)
        external
        view
        reportExists(_reportId)
        returns (
            ReportStatus status,
            uint256 submissionTime,
            address investigator,
            bool exists
        )
    {
        Report storage report = reports[_reportId];
        return (
            report.status,
            report.submissionTime,
            report.investigator,
            report.exists
        );
    }

    function getInvestigationInfo(uint32 _reportId)
        external
        view
        reportExists(_reportId)
        returns (
            address investigator,
            uint256 startTime,
            uint256 lastUpdate,
            bool isActive
        )
    {
        Investigation storage investigation = investigations[_reportId];
        return (
            investigation.investigator,
            investigation.startTime,
            investigation.lastUpdate,
            investigation.isActive
        );
    }

    function getInvestigatorReports(address _investigator)
        external
        view
        returns (uint32[] memory)
    {
        require(
            msg.sender == authority || msg.sender == _investigator,
            "Not authorized to view this information"
        );
        return investigatorReports[_investigator];
    }

    function getSystemStats()
        external
        view
        returns (
            uint32 total,
            uint32 resolved,
            uint32 pending
        )
    {
        return (
            totalReports,
            resolvedReports,
            totalReports - resolvedReports
        );
    }

    // Check if user is authorized investigator
    function isAuthorizedInvestigator(address _user) external view returns (bool) {
        return authorizedInvestigators[_user];
    }

    // Emergency functions
    function transferAuthority(address _newAuthority) external onlyAuthority {
        require(_newAuthority != address(0), "Invalid authority address");
        authority = _newAuthority;
    }

    // Note: Decryption functionality can be implemented when needed
    // The encrypted data can be accessed by authorized parties using proper FHE decryption methods
}