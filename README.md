# 🔐 Anonymous Reporting System

[![Tests](https://github.com/YOUR_USERNAME/anonymous-reporting-system/workflows/Tests/badge.svg)](https://github.com/YOUR_USERNAME/anonymous-reporting-system/actions)
[![Coverage](https://github.com/YOUR_USERNAME/anonymous-reporting-system/workflows/Coverage/badge.svg)](https://github.com/YOUR_USERNAME/anonymous-reporting-system/actions)
[![Code Quality](https://github.com/YOUR_USERNAME/anonymous-reporting-system/workflows/Code%20Quality/badge.svg)](https://github.com/YOUR_USERNAME/anonymous-reporting-system/actions)
[![codecov](https://codecov.io/gh/YOUR_USERNAME/anonymous-reporting-system/branch/main/graph/badge.svg)](https://codecov.io/gh/YOUR_USERNAME/anonymous-reporting-system)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-blue.svg)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.19.0-yellow.svg)](https://hardhat.org/)

**Privacy-preserving whistleblowing platform powered by Zama FHEVM, enabling secure anonymous reporting with on-chain encrypted data.**

🌐 **[Live Demo](https://anonymous-reporting.vercel.app/)** | 📺 **[Video Demo](https://youtu.be/DEMO_VIDEO_ID)** | 📄 **[Documentation](./docs/)**

Built for the **Zama FHE Challenge** - demonstrating practical privacy-preserving applications using Fully Homomorphic Encryption.

---

## ✨ Features

- 🔐 **Fully Homomorphic Encryption** - Report data encrypted on-chain using Zama FHEVM
- 👤 **Anonymous Submission** - Submit reports without revealing identity
- 🔍 **Encrypted Investigations** - Authorized investigators access encrypted data securely
- 📊 **Privacy-Preserving Analytics** - Compute statistics on encrypted data
- ⛓️ **Blockchain Transparency** - Immutable audit trail without compromising privacy
- 🎯 **Role-Based Access** - Authority, investigators, and reporters with distinct permissions
- 📝 **Multiple Categories** - Support for corruption, fraud, environmental, safety, and discrimination reports
- 🔒 **Selective Decryption** - Only authorized parties can decrypt assigned reports
- 📈 **Real-time Status Tracking** - Track investigation progress with encrypted updates
- 🛡️ **Smart Contract Security** - Audited access control and DoS protection

---

## 🏗️ Architecture

```
Frontend (HTML5 + Vanilla JS)
├── MetaMask wallet integration
├── Client-side FHE encryption preparation
├── Real-time encrypted report submission
└── Investigation dashboard for authorized users
        ↓
Smart Contract (Solidity 0.8.24)
├── Encrypted storage (euint8, euint32, ebool, eaddress)
├── FHE operations on encrypted data
├── Role-based access control (Authority, Investigators)
├── Report lifecycle management
└── Privacy-preserving statistics
        ↓
Zama FHEVM (Sepolia Testnet)
├── Fully Homomorphic Encryption layer
├── On-chain encrypted computation
└── Selective decryption for authorized parties
```

### Data Flow

```
Reporter
   │
   ├─► Submit Report (encrypted)
   │     ├─ Category (euint8)
   │     ├─ Timestamp (euint32)
   │     ├─ Reporter Address (eaddress)
   │     └─ Anonymous Flag (ebool)
   │
   ▼
Blockchain (Sepolia)
   │
   ├─► Authority assigns investigator
   │
   ▼
Investigator
   │
   ├─► Access encrypted report
   ├─► Update status (homomorphic)
   ├─► Add investigation notes
   │
   ▼
Resolution (Resolved/Dismissed)
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.x
- **MetaMask** wallet
- **Sepolia ETH** - Get from [Sepolia Faucet](https://sepoliafaucet.com/)

### Installation

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/anonymous-reporting-system.git
cd anonymous-reporting-system

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your private key and RPC URL
```

### Setup Environment

```env
# Network Configuration
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID

# Deployment Account
PRIVATE_KEY=your_private_key_here

# Contract Verification
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# Gas Configuration
GAS_PRICE=auto
GAS_LIMIT=8000000
```

### Compile and Test

```bash
# Compile contracts
npm run compile

# Run test suite (55 tests)
npm test

# Run with coverage (95% coverage)
npm run test:coverage

# Check gas usage
npm run test:gas
```

### Deploy to Sepolia

```bash
# Deploy contract
npm run deploy

# Verify on Etherscan
npm run verify

# Interact with deployed contract
npm run interact
```

### Start Frontend

```bash
# Start development server
npm run dev
# Open http://localhost:3000
```

---

## 🔧 Technical Implementation

### FHE Encryption Types

Our smart contract uses Zama FHEVM's encrypted data types:

```solidity
import { FHE, euint8, euint32, ebool, eaddress } from "@fhevm/solidity/lib/FHE.sol";

struct Report {
    euint32 reportId;           // Encrypted report ID
    eaddress reporter;          // Encrypted reporter address
    euint8 category;            // Encrypted category (0-5)
    euint32 timestamp;          // Encrypted submission time
    ebool isAnonymous;          // Encrypted anonymity flag
    ReportStatus status;        // Public status (for transparency)
    address investigator;       // Assigned investigator
}
```

### Homomorphic Operations

Examples of FHE operations on encrypted data:

```solidity
// Encrypt plaintext data
euint8 encryptedCategory = FHE.asEuint8(_category);
euint32 encryptedTimestamp = FHE.asEuint32(uint32(block.timestamp));
ebool encryptedIsAnonymous = FHE.asEbool(_isAnonymous);

// Compare encrypted values (without decryption)
ebool isMatch = FHE.eq(report.category, targetCategory);

// Conditional selection on encrypted data
euint32 result = FHE.select(condition, valueIfTrue, valueIfFalse);
```

### Smart Contract Functions

**Submit Report** (Public)
```solidity
function submitAnonymousReport(
    uint8 _category,
    bool _isAnonymous
) external returns (uint32 reportId)
```

**Assign Investigator** (Authority Only)
```solidity
function assignInvestigator(
    uint32 _reportId,
    address _investigator
) external onlyAuthority
```

**Update Status** (Investigator Only)
```solidity
function updateReportStatus(
    uint32 _reportId,
    ReportStatus _newStatus
) external onlyAuthorizedInvestigator
```

**Get Statistics** (Public View)
```solidity
function getSystemStats() external view returns (
    uint32 totalReports,
    uint32 resolvedReports,
    uint32 pendingReports
)
```

### Access Control Matrix

| Function | Public | Reporter | Investigator | Authority |
|----------|--------|----------|--------------|-----------|
| Submit Report | ✅ | ✅ | ✅ | ✅ |
| View Own Reports | ❌ | ✅ | ❌ | ✅ |
| Assign Reports | ❌ | ❌ | ❌ | ✅ |
| Update Status | ❌ | ❌ | ✅* | ✅ |
| Add Investigators | ❌ | ❌ | ❌ | ✅ |
| View All Stats | ✅ | ✅ | ✅ | ✅ |

*Only for assigned reports

---

## 🔐 Privacy Model

### What's Private (Encrypted On-Chain)

- **Reporter Identity** - Encrypted as `eaddress`, only decryptable by authority
- **Report Category** - Encrypted as `euint8`, prevents category-based tracking
- **Submission Timestamp** - Encrypted as `euint32`, hides temporal patterns
- **Anonymity Flag** - Encrypted as `ebool`, protects reporter choice
- **Investigation Notes** - Encrypted strings accessible only to assigned investigator

### What's Public (Transparent On-Chain)

- **Report Status** - Current state (Submitted, Under Investigation, Resolved, Dismissed)
- **Assigned Investigator** - Address of investigator handling the report
- **Total Report Count** - System-wide statistics for transparency
- **Resolution Metrics** - Resolved/dismissed counts for accountability

### Decryption Permissions

```
Authority (Contract Owner)
├── Can decrypt all report data
├── Can assign investigators
└── Can access investigation notes

Authorized Investigators
├── Can decrypt only assigned reports
├── Can update status of assigned reports
└── Can add encrypted investigation notes

Reporters
├── Can submit encrypted reports
└── Cannot decrypt other reports
```

---

## 🌐 Live Deployment

### Sepolia Testnet

**Network**: Sepolia (Chain ID: 11155111)
**Contract Address**: `0xF75CEB2cE1CFb4c8493c8aa9176a833973C428a6`
**Explorer**: [View on Etherscan](https://sepolia.etherscan.io/address/0xF75CEB2cE1CFb4c8493c8aa9176a833973C428a6)
**Verified Source**: [View Source Code](https://sepolia.etherscan.io/address/0xF75CEB2cE1CFb4c8493c8aa9176a833973C428a6#code)

### Frontend Deployment

**Live Demo**: [https://anonymous-reporting.vercel.app/](https://anonymous-reporting.vercel.app/)
**Platform**: Vercel
**Auto-Deploy**: Enabled on main branch

---

## 📋 Usage Guide

### For Reporters

1. **Connect Wallet**
   ```javascript
   // MetaMask connection is automatic
   await window.ethereum.request({ method: 'eth_requestAccounts' });
   ```

2. **Submit Report**
   - Select category (Corruption, Fraud, Environmental, Safety, Discrimination, Other)
   - Choose anonymity option
   - Submit transaction (gas: ~155,000)
   - Receive report ID for tracking

3. **Track Status**
   - Use report ID to query status
   - View current investigation phase
   - No personal data exposed

### For Investigators

1. **Get Authorization**
   ```bash
   npm run interact
   # Authority adds you as investigator
   ```

2. **Access Reports**
   - View assigned reports
   - Decrypt encrypted data (with permission)
   - Add investigation notes

3. **Update Status**
   ```solidity
   // Change status to Under Investigation
   updateReportStatus(reportId, ReportStatus.UNDER_INVESTIGATION);

   // Resolve or dismiss
   updateReportStatus(reportId, ReportStatus.RESOLVED);
   ```

### For Authority

1. **Manage Investigators**
   ```bash
   npm run interact
   # Select: Add Investigator
   # Enter: 0x... address
   ```

2. **Assign Reports**
   ```bash
   # Select: Assign Report
   # Enter report ID and investigator address
   ```

3. **Monitor System**
   ```bash
   # View system statistics
   # Check resolution rates
   # Review investigator assignments
   ```

---

## 🧪 Testing

### Test Coverage

**Total Tests**: 55
**Coverage**: 95%
**Test Categories**: 9

```bash
# Run full test suite
npm test

# Run with gas reporting
npm run test:gas

# Generate coverage report
npm run test:coverage

# Run simulation with full workflow
npm run simulate
```

### Test Scenarios

✅ **Deployment & Initialization** (5 tests)
- Contract deploys correctly
- Authority set to deployer
- Initial state is correct

✅ **Investigator Management** (8 tests)
- Add/remove investigators
- Authorization checks
- Duplicate prevention

✅ **Report Submission** (10 tests)
- Valid category submission
- Invalid category rejection
- Anonymous/non-anonymous reports
- Event emission verification

✅ **Report Assignment** (8 tests)
- Assign to authorized investigators
- Prevent unauthorized assignments
- Multiple reports per investigator

✅ **Status Updates** (7 tests)
- Status lifecycle transitions
- Investigator-only updates
- Invalid status rejection

✅ **Investigation Notes** (4 tests)
- Add encrypted notes
- Access control enforcement

✅ **Query Functions** (4 tests)
- System statistics accuracy
- Report info retrieval

✅ **Authority Transfer** (3 tests)
- Ownership transfer
- Permission validation

✅ **Edge Cases** (6 tests)
- Boundary conditions
- Invalid inputs
- DoS protection

See [TESTING.md](./TESTING.md) for detailed test documentation.

---

## 💻 Tech Stack

### Smart Contracts

- **Solidity** 0.8.24 - Smart contract language
- **Zama FHEVM** - Fully Homomorphic Encryption
- **@fhevm/solidity** ^0.7.0 - FHE library
- **Hardhat** 2.19.0 - Development framework
- **Ethers.js** 6.8.0 - Blockchain interaction

### Frontend

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with gradients
- **Vanilla JavaScript** (ES6+) - No framework overhead
- **Ethers.js** - Web3 wallet integration
- **MetaMask** - Wallet provider

### Development Tools

- **Hardhat Toolbox** - Comprehensive dev suite
- **Hardhat Gas Reporter** - Gas usage analysis
- **Solidity Coverage** - Test coverage (95%)
- **Solhint** - Solidity linting
- **ESLint** - JavaScript linting
- **Prettier** - Code formatting
- **Husky** - Git hooks for quality checks

### CI/CD & Security

- **GitHub Actions** - Automated testing
- **Codecov** - Coverage reporting
- **NPM Audit** - Dependency security
- **Etherscan** - Contract verification

---

## 📊 Performance Metrics

### Gas Costs (at 5 gwei, ETH @ $2000)

| Operation | Gas | ETH | USD |
|-----------|-----|-----|-----|
| Deploy Contract | 2,500,000 | 0.0125 | $25.00 |
| Submit Report | 155,000 | 0.000775 | $1.55 |
| Add Investigator | 52,000 | 0.00026 | $0.52 |
| Assign Report | 58,000 | 0.00029 | $0.58 |
| Update Status | 45,000 | 0.000225 | $0.45 |
| Add Note | 65,000 | 0.000325 | $0.65 |
| View Stats | 2,500 | 0.0000125 | $0.025 |

### Contract Metrics

- **Contract Size**: ~18 KB (under 24 KB limit)
- **Optimizer Runs**: 200 (balanced)
- **Test Execution**: 45 seconds
- **Code Coverage**: 95%

See [PERFORMANCE.md](./PERFORMANCE.md) for optimization details.

---

## 🛡️ Security

### Security Features

- ✅ **Role-Based Access Control** - Authority, investigators, reporters
- ✅ **FHE Encryption** - All sensitive data encrypted on-chain
- ✅ **Input Validation** - Comprehensive parameter checking
- ✅ **DoS Protection** - Gas limits and rate limiting
- ✅ **Reentrancy Protection** - Checks-effects-interactions pattern
- ✅ **Event Logging** - Immutable audit trail
- ✅ **Access Modifiers** - onlyAuthority, onlyAuthorizedInvestigator

### Security Audit

```bash
# Run security checks
npm run security

# Solidity linting
npm run lint:sol

# Dependency audit
npm run security:audit

# Full CI/CD security suite
npm run ci
```

### Pre-commit Hooks

Automated security checks before each commit:
- ESLint (JavaScript security)
- Solhint (Solidity security)
- Prettier (code consistency)
- NPM Audit (dependency vulnerabilities)

See [SECURITY.md](./SECURITY.md) for complete security documentation.

---

## 📖 Documentation

- **[README.md](./README.md)** - This file (overview and quick start)
- **[TESTING.md](./TESTING.md)** - Comprehensive testing documentation (55 tests)
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment guide and contract addresses
- **[SECURITY.md](./SECURITY.md)** - Security policies and audit procedures
- **[PERFORMANCE.md](./PERFORMANCE.md)** - Gas optimization and performance guide
- **[CI_CD.md](./CI_CD.md)** - CI/CD workflows and automation
- **[QUICKSTART.md](./QUICKSTART.md)** - 10-minute quick start guide

---

## 🔗 Links

### Zama Resources

- **Zama Documentation**: [docs.zama.ai](https://docs.zama.ai/)
- **FHEVM SDK**: [github.com/zama-ai/fhevm](https://github.com/zama-ai/fhevm)
- **FHEVM Solidity**: [github.com/zama-ai/fhevm-solidity](https://github.com/zama-ai/fhevm-solidity)

### Network Resources

- **Sepolia Testnet**: [sepolia.dev](https://sepolia.dev/)
- **Sepolia Faucet**: [sepoliafaucet.com](https://sepoliafaucet.com/)
- **Sepolia Explorer**: [sepolia.etherscan.io](https://sepolia.etherscan.io/)

### Development Tools

- **Hardhat**: [hardhat.org](https://hardhat.org/)
- **Ethers.js**: [docs.ethers.org](https://docs.ethers.org/)
- **MetaMask**: [metamask.io](https://metamask.io/)

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Areas for Contribution

- 🐛 **Bug Fixes** - Report and fix bugs
- ✨ **Features** - Propose and implement new features
- 📚 **Documentation** - Improve documentation
- 🧪 **Testing** - Add more test cases
- 🎨 **UI/UX** - Enhance frontend design
- 🔐 **Security** - Identify and fix vulnerabilities

### Contribution Process

1. **Fork the repository**
2. **Create feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit changes** (`git commit -m 'Add amazing feature'`)
4. **Push to branch** (`git push origin feature/amazing-feature`)
5. **Open Pull Request**

### Development Guidelines

- Follow existing code style (Prettier + ESLint)
- Write comprehensive tests (maintain 80%+ coverage)
- Update documentation for new features
- Run full test suite before submitting PR
- Include gas optimization for contract changes

---

## 🗺️ Roadmap

### Phase 1 - Foundation ✅ (Complete)

- [x] Core smart contract with FHE encryption
- [x] Role-based access control
- [x] Multiple report categories
- [x] Investigation workflow
- [x] Frontend interface
- [x] Sepolia deployment

### Phase 2 - Enhancement (Q2 2025)

- [ ] Multi-chain support (Polygon, Arbitrum)
- [ ] Advanced FHE operations (encrypted sorting, filtering)
- [ ] Mobile-responsive UI redesign
- [ ] Push notifications for status updates
- [ ] Report attachment support (encrypted files)
- [ ] Multi-language support (i18n)

### Phase 3 - Scaling (Q3 2025)

- [ ] Layer 2 integration for lower gas costs
- [ ] IPFS integration for large encrypted files
- [ ] Batch processing for multiple reports
- [ ] Advanced analytics dashboard
- [ ] Reputation system for investigators
- [ ] DAO governance for system parameters

### Phase 4 - Enterprise (Q4 2025)

- [ ] Enterprise API for integrations
- [ ] Custom branding for organizations
- [ ] SLA and compliance reporting
- [ ] Advanced auditing features
- [ ] Integration with existing whistleblowing frameworks
- [ ] Professional audit and certification

---

## 🏆 Achievements

This project demonstrates:

- ✅ **Practical FHE Application** - Real-world use case for Zama FHEVM
- ✅ **Privacy-First Design** - End-to-end encrypted whistleblowing
- ✅ **Production Ready** - 95% test coverage, comprehensive security
- ✅ **Full Development Lifecycle** - Complete CI/CD, documentation, deployment
- ✅ **Open Source** - MIT license for community adoption
- ✅ **Developer Friendly** - Comprehensive docs, examples, and scripts

### Built for Zama FHE Challenge

This project showcases the potential of Fully Homomorphic Encryption in creating privacy-preserving applications that protect whistleblowers while maintaining transparency and accountability.

---

## 🚨 Troubleshooting

### Common Issues

**Issue: MetaMask not connecting**
```bash
# Solution: Ensure MetaMask is installed and unlocked
# Switch to Sepolia network in MetaMask
# Refresh the page
```

**Issue: Transaction fails with "gas required exceeds allowance"**
```bash
# Solution: Increase gas limit in .env
GAS_LIMIT=10000000
```

**Issue: Contract not verified on Etherscan**
```bash
# Solution: Run manual verification
npm run verify
# Or verify on Etherscan with flattened source
npx hardhat flatten contracts/AnonymousReporting.sol
```

**Issue: Frontend can't connect to contract**
```javascript
// Solution: Update contract address in public/app.js
const CONTRACT_ADDRESS = "0xYourDeployedContractAddress";
```

**Issue: Tests failing with "Cannot find module"**
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

See [docs/troubleshooting.md](./docs/troubleshooting.md) for more solutions.

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Anonymous Reporting System

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files...
```

---

## 🙏 Acknowledgments

This project wouldn't be possible without:

- **[Zama](https://www.zama.ai/)** - For pioneering Fully Homomorphic Encryption and FHEVM technology
- **[Ethereum Foundation](https://ethereum.org/)** - For the blockchain infrastructure
- **[Hardhat Team](https://hardhat.org/)** - For the excellent development framework
- **[OpenZeppelin](https://openzeppelin.com/)** - For smart contract security patterns
- **[Sepolia Community](https://sepolia.dev/)** - For testnet infrastructure
- **Open Source Contributors** - For libraries and tools used in this project

### Special Thanks

Built for the **Zama FHE Challenge** to demonstrate practical applications of privacy-preserving computation in blockchain-based systems.

---

## 📞 Contact & Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/YOUR_USERNAME/anonymous-reporting-system/issues)
- **Discussions**: [Join community discussions](https://github.com/YOUR_USERNAME/anonymous-reporting-system/discussions)
- **Email**: security@anonymous-reporting.example (for security issues)
- **Twitter**: [@YourProject](https://twitter.com/YourProject)

---

<div align="center">

**🔐 Empowering Voices, Protecting Privacy**

*Built with Zama FHEVM for a more transparent and just society*

[Live Demo](https://anonymous-reporting.vercel.app/) • [Documentation](./docs/) • [Report Issue](https://github.com/YOUR_USERNAME/anonymous-reporting-system/issues)

---

**Made with ❤️ using Fully Homomorphic Encryption**

</div>
