// Contract configuration
const CONTRACT_ADDRESS = "0xF75CEB2cE1CFb4c8493c8aa9176a833973C428a6";
const CONTRACT_ABI = [
    "function submitAnonymousReport(uint8 _category, bool _isAnonymous) returns (uint32)",
    "function assignInvestigator(uint32 _reportId, address _investigator)",
    "function updateReportStatus(uint32 _reportId, uint8 _newStatus)",
    "function addInvestigationNotes(uint32 _reportId, string _notes)",
    "function addInvestigator(address _investigator)",
    "function removeInvestigator(address _investigator)",
    "function getReportBasicInfo(uint32 _reportId) view returns (uint8 status, uint256 submissionTime, address investigator, bool exists)",
    "function getSystemStats() view returns (uint32 total, uint32 resolved, uint32 pending)",
    "function isAuthorizedInvestigator(address _user) view returns (bool)",
    "function authority() view returns (address)",
    "event ReportSubmitted(uint32 indexed reportId, uint8 category, uint256 timestamp)",
    "event ReportStatusChanged(uint32 indexed reportId, uint8 newStatus)"
];

// Global variables
let provider;
let signer;
let contract;
let userAccount;

// Status mappings
const statusNames = {
    0: { name: "Submitted", class: "status-submitted" },
    1: { name: "Under Investigation", class: "status-investigating" },
    2: { name: "Resolved", class: "status-resolved" },
    3: { name: "Dismissed", class: "status-dismissed" }
};

const categoryNames = {
    0: "Corruption",
    1: "Fraud",
    2: "Environmental",
    3: "Safety",
    4: "Discrimination",
    5: "Other"
};

// Initialize the application
async function init() {
    try {
        await connectWallet();
        await loadStats();
    } catch (error) {
        console.error("Initialization failed:", error);
        showAlert('report-alert', 'error', 'Initialization failed: ' + error.message);
    }
}

// Connect to MetaMask wallet
async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            provider = new ethers.BrowserProvider(window.ethereum);
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            signer = await provider.getSigner();
            userAccount = await signer.getAddress();

            contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

            updateConnectionStatus(true);
            console.log("Connected to wallet:", userAccount);
        } catch (error) {
            updateConnectionStatus(false);
            throw new Error("Wallet connection failed: " + error.message);
        }
    } else {
        updateConnectionStatus(false);
        throw new Error("Please install MetaMask wallet");
    }
}

// Update connection status display
function updateConnectionStatus(connected) {
    const statusElement = document.getElementById('connection-status');
    if (connected) {
        statusElement.className = 'connection-status connected';
        statusElement.innerHTML = `🟢 Connected: ${userAccount ? userAccount.slice(0,6) + '...' + userAccount.slice(-4) : ''}`;
    } else {
        statusElement.className = 'connection-status disconnected';
        statusElement.innerHTML = '🔴 Wallet Not Connected';
    }
}

// Show/hide tabs
function showTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.classList.remove('active'));

    // Remove active class from all nav tabs
    const navTabs = document.querySelectorAll('.nav-tab');
    navTabs.forEach(tab => tab.classList.remove('active'));

    // Show selected tab
    document.getElementById(tabName + '-tab').classList.add('active');
    event.target.classList.add('active');
}

// Show alert messages
function showAlert(elementId, type, message) {
    const alertElement = document.getElementById(elementId);
    alertElement.className = `alert alert-${type}`;
    alertElement.textContent = message;
    alertElement.style.display = 'block';

    setTimeout(() => {
        alertElement.style.display = 'none';
    }, 5000);
}

// Submit report form handler
document.getElementById('reportForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
        if (!contract) {
            await connectWallet();
        }

        const category = document.getElementById('category').value;
        const isAnonymous = document.getElementById('anonymous').checked;
        const privacyAgree = document.getElementById('privacy-agree').checked;

        if (!privacyAgree) {
            showAlert('report-alert', 'error', 'Please agree to the privacy protection terms first');
            return;
        }

        showAlert('report-alert', 'success', 'Submitting report, please wait for blockchain confirmation...');

        const tx = await contract.submitAnonymousReport(
            parseInt(category),
            isAnonymous
        );

        const receipt = await tx.wait();

        // Get report ID from event
        const event = receipt.logs?.find(log => {
            try {
                const parsed = contract.interface.parseLog(log);
                return parsed.name === 'ReportSubmitted';
            } catch {
                return false;
            }
        });

        let reportId = 'N/A';
        if (event) {
            const parsed = contract.interface.parseLog(event);
            reportId = parsed.args.reportId.toString();
        }

        showAlert('report-alert', 'success',
            `Report submitted successfully! Your report ID is: ${reportId}. Please record this ID to track progress.`);

        // Reset form
        document.getElementById('reportForm').reset();
        document.getElementById('anonymous').checked = true;

    } catch (error) {
        console.error("Submit report error:", error);
        showAlert('report-alert', 'error', 'Report submission failed: ' + error.message);
    }
});

// Track report progress
async function trackReport() {
    try {
        if (!contract) {
            await connectWallet();
        }

        const reportId = document.getElementById('reportId').value;
        if (!reportId) {
            alert('Please enter report ID');
            return;
        }

        const reportInfo = await contract.getReportBasicInfo(parseInt(reportId));

        if (!reportInfo.exists) {
            alert('Report ID not found');
            return;
        }

        const status = statusNames[reportInfo.status] || { name: "Unknown", class: "status-submitted" };
        const submissionDate = new Date(Number(reportInfo.submissionTime) * 1000).toLocaleString('en-US');
        const investigator = reportInfo.investigator !== ethers.ZeroAddress
            ? reportInfo.investigator
            : 'Not assigned';

        document.getElementById('reportInfo').innerHTML = `
            <div class="form-group">
                <label>Report ID:</label>
                <p>${reportId}</p>
            </div>
            <div class="form-group">
                <label>Current Status:</label>
                <span class="status-badge ${status.class}">${status.name}</span>
            </div>
            <div class="form-group">
                <label>Submission Time:</label>
                <p>${submissionDate}</p>
            </div>
            <div class="form-group">
                <label>Investigator:</label>
                <p>${investigator}</p>
            </div>
        `;

        document.getElementById('trackResult').style.display = 'block';

    } catch (error) {
        console.error("Track report error:", error);
        alert('Query failed: ' + error.message);
    }
}

// Update report status (for investigators)
async function updateReportStatus() {
    try {
        if (!contract) {
            await connectWallet();
        }

        const reportId = document.getElementById('investigateReportId').value;
        const newStatus = document.getElementById('newStatus').value;

        if (!reportId || !newStatus) {
            alert('Please fill in all information');
            return;
        }

        const tx = await contract.updateReportStatus(
            parseInt(reportId),
            parseInt(newStatus)
        );

        await tx.wait();
        alert('Status updated successfully!');

    } catch (error) {
        console.error("Update status error:", error);
        alert('Status update failed: ' + error.message);
    }
}

// Add investigation notes
async function addNotes() {
    try {
        if (!contract) {
            await connectWallet();
        }

        const reportId = document.getElementById('investigateReportId').value;
        const notes = document.getElementById('notes').value;

        if (!reportId || !notes) {
            alert('Please fill in all information');
            return;
        }

        const tx = await contract.addInvestigationNotes(
            parseInt(reportId),
            notes
        );

        await tx.wait();
        alert('Notes added successfully!');
        document.getElementById('notes').value = '';

    } catch (error) {
        console.error("Add notes error:", error);
        alert('Adding notes failed: ' + error.message);
    }
}

// Add investigator
async function addInvestigator() {
    try {
        if (!contract) {
            await connectWallet();
        }

        const address = document.getElementById('investigatorAddress').value;

        if (!address || !ethers.isAddress(address)) {
            alert('Please enter a valid Ethereum address');
            return;
        }

        const tx = await contract.addInvestigator(address);
        await tx.wait();

        alert('Investigator added successfully!');
        document.getElementById('investigatorAddress').value = '';

    } catch (error) {
        console.error("Add investigator error:", error);
        alert('Adding investigator failed: ' + error.message);
    }
}

// Remove investigator
async function removeInvestigator() {
    try {
        if (!contract) {
            await connectWallet();
        }

        const address = document.getElementById('investigatorAddress').value;

        if (!address || !ethers.isAddress(address)) {
            alert('Please enter a valid Ethereum address');
            return;
        }

        const tx = await contract.removeInvestigator(address);
        await tx.wait();

        alert('Investigator removed successfully!');
        document.getElementById('investigatorAddress').value = '';

    } catch (error) {
        console.error("Remove investigator error:", error);
        alert('Removing investigator failed: ' + error.message);
    }
}

// Load system statistics
async function loadStats() {
    try {
        if (!contract) {
            await connectWallet();
        }

        const stats = await contract.getSystemStats();

        const total = Number(stats.total);
        const resolved = Number(stats.resolved);
        const pending = Number(stats.pending);
        const successRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

        document.getElementById('totalReports').textContent = total;
        document.getElementById('resolvedReports').textContent = resolved;
        document.getElementById('pendingReports').textContent = pending;
        document.getElementById('successRate').textContent = successRate + '%';

    } catch (error) {
        console.error("Load stats error:", error);
        // Set default values if contract not deployed
        document.getElementById('totalReports').textContent = '0';
        document.getElementById('resolvedReports').textContent = '0';
        document.getElementById('pendingReports').textContent = '0';
        document.getElementById('successRate').textContent = '0%';
    }
}

// Handle account changes
if (window.ethereum) {
    window.ethereum.on('accountsChanged', async (accounts) => {
        if (accounts.length === 0) {
            updateConnectionStatus(false);
        } else {
            await init();
        }
    });

    window.ethereum.on('chainChanged', () => {
        window.location.reload();
    });
}

// Initialize when page loads
window.addEventListener('load', () => {
    // Don't auto-init if contract address is not set
    if (CONTRACT_ADDRESS && CONTRACT_ADDRESS !== "YOUR_CONTRACT_ADDRESS_HERE") {
        init();
    } else {
        console.log("Please set CONTRACT_ADDRESS in app.js");
        updateConnectionStatus(false);
        loadStats(); // Load default stats
    }
});