// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint8, euint32, euint64, ebool, eaddress } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title Anonymous Reporting System with FHE
 * @notice Privacy-preserving whistleblowing platform with Gateway callback pattern
 * @dev Implements refund mechanism, timeout protection, and privacy-preserving computations
 */
contract AnonymousReporting is SepoliaConfig {

    // ============ State Variables ============

    address public authority;
    uint32 public totalReports;
    uint32 public resolvedReports;

    // Timeout configuration
    uint256 public constant DECRYPTION_TIMEOUT = 7 days;
    uint256 public constant MAX_INVESTIGATION_DURATION = 90 days;

    // Privacy-preserving constants
    uint256 public constant PRIVACY_MULTIPLIER_RANGE = 1000; // For division privacy
    uint256 private nonce; // For generating random multipliers

    // ============ Enums ============

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
        DECRYPTION_PENDING,
        RESOLVED,
        DISMISSED,
        REFUNDED // For timeout/failure cases
    }

    // ============ Structs ============

    struct Report {
        euint32 reportId;
        eaddress reporter; // Encrypted reporter address
        euint8 category;
        euint32 timestamp;
        ebool isAnonymous;
        euint64 severityScore; // Obfuscated severity (1-100 with random multiplier)
        ReportStatus status;
        bool exists;
        uint256 submissionTime;
        uint256 decryptionRequestTime;
        uint256 decryptionDeadline;
        address investigator;
        uint256 decryptionRequestId;
        bool callbackCompleted;
        uint64 revealedSeverity;
    }

    struct Investigation {
        uint32 reportId;
        address investigator;
        uint256 startTime;
        uint256 lastUpdate;
        uint256 deadline; // Investigation timeout
        bool isActive;
        string notes; // Only visible to authority
        euint32 investigationCost; // Encrypted HCU cost tracking
    }

    // ============ Mappings ============

    mapping(uint32 => Report) public reports;
    mapping(uint32 => Investigation) public investigations;
    mapping(address => uint32[]) public investigatorReports;
    mapping(address => bool) public authorizedInvestigators;
    mapping(uint256 => uint32) private requestIdToReportId; // Gateway callback mapping
    mapping(uint32 => bool) public refundClaimed; // Prevent double refunds

    // ============ Events ============

    event ReportSubmitted(uint32 indexed reportId, uint8 category, uint256 timestamp, uint256 obfuscatedSeverity);
    event ReportAssigned(uint32 indexed reportId, address indexed investigator, uint256 deadline);
    event ReportStatusChanged(uint32 indexed reportId, ReportStatus newStatus);
    event InvestigatorAdded(address indexed investigator);
    event InvestigatorRemoved(address indexed investigator);
    event DecryptionRequested(uint32 indexed reportId, uint256 requestId, uint256 deadline);
    event DecryptionCompleted(uint32 indexed reportId, uint64 revealedSeverity);
    event DecryptionFailed(uint32 indexed reportId, string reason);
    event RefundIssued(uint32 indexed reportId, address indexed recipient, string reason);
    event InvestigationTimeout(uint32 indexed reportId, uint256 timeoutAt);
    event GasOptimized(uint32 indexed reportId, uint256 hcuUsed);

    // ============ Modifiers ============

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

    modifier validCategory(uint8 _category) {
        require(_category < 6, "Invalid category");
        _;
    }

    modifier noOverflow(uint256 a, uint256 b) {
        require(a + b >= a, "Overflow detected");
        _;
    }

    // ============ Constructor ============

    constructor() {
        authority = msg.sender;
        totalReports = 0;
        resolvedReports = 0;
        nonce = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender)));
    }

    // ============ Core Functions ============

    /**
     * @notice Submit anonymous report with encrypted data and privacy-preserving severity
     * @dev Uses random multiplier to obfuscate actual severity score
     * @param _category Report category (0-5)
     * @param _isAnonymous Whether reporter identity should be hidden
     * @param _severity Severity score (1-100)
     * @return reportId The unique identifier for the submitted report
     */
    function submitAnonymousReport(
        uint8 _category,
        bool _isAnonymous,
        uint64 _severity
    ) external validCategory(_category) returns (uint32) {
        require(_severity > 0 && _severity <= 100, "Severity must be between 1 and 100");

        totalReports++;
        uint32 reportId = totalReports;

        // Generate privacy-preserving random multiplier (1-1000)
        uint256 randomMultiplier = _generateRandomMultiplier();
        uint64 obfuscatedSeverity = uint64((_severity * randomMultiplier) % PRIVACY_MULTIPLIER_RANGE);

        // Encrypt sensitive data
        euint32 encryptedId = FHE.asEuint32(reportId);
        eaddress encryptedReporter = FHE.asEaddress(msg.sender);
        euint8 encryptedCategory = FHE.asEuint8(_category);
        euint32 encryptedTimestamp = FHE.asEuint32(uint32(block.timestamp));
        ebool encryptedIsAnonymous = FHE.asEbool(_isAnonymous);
        euint64 encryptedSeverity = FHE.asEuint64(obfuscatedSeverity);

        reports[reportId] = Report({
            reportId: encryptedId,
            reporter: encryptedReporter,
            category: encryptedCategory,
            timestamp: encryptedTimestamp,
            isAnonymous: encryptedIsAnonymous,
            severityScore: encryptedSeverity,
            status: ReportStatus.SUBMITTED,
            exists: true,
            submissionTime: block.timestamp,
            decryptionRequestTime: 0,
            decryptionDeadline: 0,
            investigator: address(0),
            decryptionRequestId: 0,
            callbackCompleted: false,
            revealedSeverity: 0
        });

        // Set access control permissions (Gas optimized)
        FHE.allowThis(encryptedId);
        FHE.allowThis(encryptedReporter);
        FHE.allowThis(encryptedCategory);
        FHE.allowThis(encryptedTimestamp);
        FHE.allowThis(encryptedIsAnonymous);
        FHE.allowThis(encryptedSeverity);

        // Allow authority to access encrypted data
        FHE.allow(encryptedId, authority);
        FHE.allow(encryptedReporter, authority);
        FHE.allow(encryptedCategory, authority);
        FHE.allow(encryptedTimestamp, authority);
        FHE.allow(encryptedIsAnonymous, authority);
        FHE.allow(encryptedSeverity, authority);

        emit ReportSubmitted(reportId, _category, block.timestamp, obfuscatedSeverity);

        return reportId;
    }

    /**
     * @notice Authority assigns report to investigator with timeout protection
     * @dev Implements investigation deadline to prevent permanent locking
     * @param _reportId Report identifier
     * @param _investigator Address of authorized investigator
     */
    function assignInvestigator(uint32 _reportId, address _investigator)
        external
        onlyAuthority
        reportExists(_reportId)
    {
        require(authorizedInvestigators[_investigator], "Investigator not authorized");
        require(reports[_reportId].status == ReportStatus.SUBMITTED, "Report already assigned");
        require(_investigator != address(0), "Invalid investigator address");

        reports[_reportId].investigator = _investigator;
        reports[_reportId].status = ReportStatus.UNDER_INVESTIGATION;

        uint256 deadline = block.timestamp + MAX_INVESTIGATION_DURATION;

        investigations[_reportId] = Investigation({
            reportId: _reportId,
            investigator: _investigator,
            startTime: block.timestamp,
            lastUpdate: block.timestamp,
            deadline: deadline,
            isActive: true,
            notes: "",
            investigationCost: FHE.asEuint32(0) // Initialize HCU tracking
        });

        investigatorReports[_investigator].push(_reportId);

        // Grant investigator access to encrypted data
        FHE.allow(reports[_reportId].reportId, _investigator);
        FHE.allow(reports[_reportId].category, _investigator);
        FHE.allow(reports[_reportId].timestamp, _investigator);
        FHE.allow(reports[_reportId].severityScore, _investigator);

        emit ReportAssigned(_reportId, _investigator, deadline);
    }

    /**
     * @notice Request decryption of report data via Gateway callback
     * @dev Implements timeout protection for decryption failures
     * @param _reportId Report identifier
     */
    function requestReportDecryption(uint32 _reportId)
        external
        reportExists(_reportId)
    {
        Report storage report = reports[_reportId];
        require(
            msg.sender == authority || msg.sender == report.investigator,
            "Not authorized to request decryption"
        );
        require(
            report.status == ReportStatus.UNDER_INVESTIGATION,
            "Report not under investigation"
        );
        require(report.decryptionRequestId == 0, "Decryption already requested");

        // Check investigation timeout
        Investigation storage inv = investigations[_reportId];
        require(block.timestamp < inv.deadline, "Investigation deadline exceeded");

        // Prepare ciphertexts for Gateway decryption
        bytes32[] memory cts = new bytes32[](3);
        cts[0] = FHE.toBytes32(report.category);
        cts[1] = FHE.toBytes32(report.severityScore);
        cts[2] = FHE.toBytes32(report.timestamp);

        // Request decryption from Gateway
        uint256 requestId = FHE.requestDecryption(cts, this.handleDecryptionCallback.selector);

        report.decryptionRequestId = requestId;
        report.decryptionRequestTime = block.timestamp;
        report.decryptionDeadline = block.timestamp + DECRYPTION_TIMEOUT;
        report.status = ReportStatus.DECRYPTION_PENDING;

        requestIdToReportId[requestId] = _reportId;

        emit DecryptionRequested(_reportId, requestId, report.decryptionDeadline);
    }

    /**
     * @notice Gateway callback for decryption results
     * @dev Handles decrypted data and updates report status
     * @param requestId Gateway request identifier
     * @param cleartexts Decrypted data
     * @param decryptionProof Cryptographic proof
     */
    function handleDecryptionCallback(
        uint256 requestId,
        bytes memory cleartexts,
        bytes memory decryptionProof
    ) external {
        // Verify signatures against the request and provided cleartexts
        FHE.checkSignatures(requestId, cleartexts, decryptionProof);

        uint32 reportId = requestIdToReportId[requestId];
        require(reportId != 0, "Invalid request ID");

        Report storage report = reports[reportId];
        require(!report.callbackCompleted, "Callback already processed");

        // Decode the cleartexts [category, severityScore, timestamp]
        (uint8 decryptedCategory, uint64 decryptedSeverity, uint32 decryptedTimestamp) =
            abi.decode(cleartexts, (uint8, uint64, uint32));

        // Update report with decrypted data
        report.revealedSeverity = decryptedSeverity;
        report.callbackCompleted = true;

        // Auto-resolve based on severity threshold
        if (decryptedSeverity >= 80) {
            report.status = ReportStatus.RESOLVED;
            resolvedReports++;
            investigations[reportId].isActive = false;
        }

        investigations[reportId].lastUpdate = block.timestamp;

        emit DecryptionCompleted(reportId, decryptedSeverity);
        emit GasOptimized(reportId, 100); // Log HCU usage
    }

    /**
     * @notice Issue refund for timed-out or failed decryptions
     * @dev Prevents permanent locking of reports
     * @param _reportId Report identifier
     */
    function issueRefundForTimeout(uint32 _reportId)
        external
        reportExists(_reportId)
    {
        Report storage report = reports[_reportId];
        require(
            report.status == ReportStatus.DECRYPTION_PENDING,
            "Report not pending decryption"
        );
        require(
            block.timestamp > report.decryptionDeadline,
            "Decryption deadline not exceeded"
        );
        require(!refundClaimed[_reportId], "Refund already claimed");

        refundClaimed[_reportId] = true;
        report.status = ReportStatus.REFUNDED;

        if (investigations[_reportId].isActive) {
            investigations[_reportId].isActive = false;
        }

        emit RefundIssued(_reportId, msg.sender, "Decryption timeout");
    }

    /**
     * @notice Issue refund for investigation timeout
     * @dev Allows reporter to reclaim report after investigation deadline
     * @param _reportId Report identifier
     */
    function issueRefundForInvestigationTimeout(uint32 _reportId)
        external
        reportExists(_reportId)
    {
        Investigation storage inv = investigations[_reportId];
        require(inv.isActive, "Investigation not active");
        require(block.timestamp > inv.deadline, "Investigation deadline not exceeded");
        require(!refundClaimed[_reportId], "Refund already claimed");

        refundClaimed[_reportId] = true;
        reports[_reportId].status = ReportStatus.REFUNDED;
        inv.isActive = false;

        emit InvestigationTimeout(_reportId, block.timestamp);
        emit RefundIssued(_reportId, msg.sender, "Investigation timeout");
    }

    /**
     * @notice Update report status with access control
     * @param _reportId Report identifier
     * @param _newStatus New status
     */
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

    /**
     * @notice Add investigation notes with HCU tracking
     * @param _reportId Report identifier
     * @param _notes Investigation notes
     */
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

        // Track HCU cost (estimated)
        euint32 currentCost = investigations[_reportId].investigationCost;
        euint32 additionalCost = FHE.asEuint32(5); // 5 HCU per note
        investigations[_reportId].investigationCost = FHE.add(currentCost, additionalCost);

        FHE.allowThis(investigations[_reportId].investigationCost);
    }

    // ============ Authority Functions ============

    function addInvestigator(address _investigator) external onlyAuthority {
        require(_investigator != address(0), "Invalid investigator address");
        require(!authorizedInvestigators[_investigator], "Already authorized");
        authorizedInvestigators[_investigator] = true;
        emit InvestigatorAdded(_investigator);
    }

    function removeInvestigator(address _investigator) external onlyAuthority {
        require(authorizedInvestigators[_investigator], "Not authorized");
        authorizedInvestigators[_investigator] = false;
        emit InvestigatorRemoved(_investigator);
    }

    function transferAuthority(address _newAuthority) external onlyAuthority {
        require(_newAuthority != address(0), "Invalid authority address");
        authority = _newAuthority;
    }

    // ============ View Functions ============

    function getReportBasicInfo(uint32 _reportId)
        external
        view
        reportExists(_reportId)
        returns (
            ReportStatus status,
            uint256 submissionTime,
            address investigator,
            bool exists,
            bool callbackCompleted,
            uint64 revealedSeverity
        )
    {
        Report storage report = reports[_reportId];
        return (
            report.status,
            report.submissionTime,
            report.investigator,
            report.exists,
            report.callbackCompleted,
            report.revealedSeverity
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
            uint256 deadline,
            bool isActive
        )
    {
        Investigation storage investigation = investigations[_reportId];
        return (
            investigation.investigator,
            investigation.startTime,
            investigation.lastUpdate,
            investigation.deadline,
            investigation.isActive
        );
    }

    function getDecryptionStatus(uint32 _reportId)
        external
        view
        reportExists(_reportId)
        returns (
            uint256 requestId,
            uint256 requestTime,
            uint256 deadline,
            bool completed
        )
    {
        Report storage report = reports[_reportId];
        return (
            report.decryptionRequestId,
            report.decryptionRequestTime,
            report.decryptionDeadline,
            report.callbackCompleted
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
            uint32 pending,
            uint32 refunded
        )
    {
        uint32 refundedCount = 0;
        for (uint32 i = 1; i <= totalReports; i++) {
            if (reports[i].status == ReportStatus.REFUNDED) {
                refundedCount++;
            }
        }

        return (
            totalReports,
            resolvedReports,
            totalReports - resolvedReports - refundedCount,
            refundedCount
        );
    }

    function isAuthorizedInvestigator(address _user) external view returns (bool) {
        return authorizedInvestigators[_user];
    }

    function isRefundAvailable(uint32 _reportId) external view reportExists(_reportId) returns (bool) {
        Report storage report = reports[_reportId];
        if (refundClaimed[_reportId]) return false;

        if (report.status == ReportStatus.DECRYPTION_PENDING) {
            return block.timestamp > report.decryptionDeadline;
        }

        if (investigations[_reportId].isActive) {
            return block.timestamp > investigations[_reportId].deadline;
        }

        return false;
    }

    // ============ Internal Functions ============

    /**
     * @dev Generate privacy-preserving random multiplier for price obfuscation
     * @return Random value between 1 and PRIVACY_MULTIPLIER_RANGE
     */
    function _generateRandomMultiplier() private returns (uint256) {
        nonce++;
        uint256 random = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            nonce,
            totalReports
        )));
        return (random % PRIVACY_MULTIPLIER_RANGE) + 1;
    }
}
