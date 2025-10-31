# Anonymous Reporting System 🛡️

A blockchain-based privacy-protected reporting platform built with Fully Homomorphic Encryption (FHE) technology, enabling secure and anonymous whistleblowing.

## 🌟 Overview

The Anonymous Reporting System is a decentralized application that allows users to submit confidential reports about various violations while maintaining complete privacy. Built on blockchain technology with advanced FHE encryption, this platform ensures that sensitive information remains protected throughout the entire reporting and investigation process.

**Live Demo**: [https://anonymous-reporting.vercel.app/](https://anonymous-reporting.vercel.app/)

**Repository**: [https://github.com/DamionHane/AnonymousReporting](https://github.com/DamionHane/AnonymousReporting)

## 🎯 Core Concept

### Privacy-First Whistleblowing with FHE Technology

Traditional reporting systems often expose the identity of reporters, creating risks of retaliation and discouraging people from coming forward. Our system solves this fundamental problem by leveraging:

- **Fully Homomorphic Encryption (FHE)**: All sensitive data is encrypted on-chain, allowing computations on encrypted data without revealing the underlying information
- **Blockchain Transparency**: All actions are recorded immutably while maintaining privacy
- **Decentralized Governance**: No single authority controls the system, ensuring fairness and preventing censorship

### How It Works

1. **Anonymous Submission**: Users submit reports with optional anonymity. Report details are encrypted using FHE before being stored on-chain
2. **Secure Storage**: Encrypted reports are stored on the blockchain, ensuring data integrity and preventing tampering
3. **Authorized Investigation**: Only authorized investigators can process reports, updating statuses and adding notes
4. **Transparent Tracking**: Anyone can track report status using the report ID, maintaining transparency without compromising privacy
5. **Statistical Dashboard**: System-wide statistics provide insights into reporting patterns and resolution rates

## 🔐 Key Features

### For Reporters

- **Complete Anonymity**: Submit reports without revealing your identity
- **Multiple Categories**: Report various types of violations including corruption, fraud, environmental issues, safety concerns, and discrimination
- **Progress Tracking**: Monitor your report status using a unique report ID
- **Privacy Protection**: All sensitive information is encrypted with FHE technology

### For Investigators

- **Report Management**: Update report statuses and assign investigators
- **Investigation Notes**: Add encrypted notes to document the investigation process
- **Investigator Access Control**: Only authorized investigators can access and process reports
- **Workflow Management**: Change report status through investigation lifecycle (Submitted → Under Investigation → Resolved/Dismissed)

### For Administrators

- **Investigator Management**: Add or remove authorized investigators
- **System Oversight**: Monitor overall system statistics and performance
- **Access Control**: Manage permissions and ensure only qualified personnel can investigate reports

## 📊 System Statistics

The platform provides real-time statistics including:

- Total number of reports submitted
- Number of resolved cases
- Pending investigations
- Overall success/resolution rate

## 🔗 Smart Contract

**Contract Address**: `0xF75CEB2cE1CFb4c8493c8aa9176a833973C428a6`

The smart contract handles all core functionality including:

- Report submission with FHE encryption
- Status management and workflow
- Investigator authorization
- Event emission for transparency

### Main Functions

```solidity
// Report submission
submitAnonymousReport(uint8 _category, bool _isAnonymous)

// Investigation management
updateReportStatus(uint32 _reportId, uint8 _newStatus)
addInvestigationNotes(uint32 _reportId, string _notes)
assignInvestigator(uint32 _reportId, address _investigator)

// Access control
addInvestigator(address _investigator)
removeInvestigator(address _investigator)

// Query functions
getReportBasicInfo(uint32 _reportId)
getSystemStats()
isAuthorizedInvestigator(address _user)
```

## 🎥 Demo & Screenshots

### Demo Video

AnonymousReporting.mp4 showcasing the complete workflow is available, including:
- Wallet connection
- Report submission process
- Progress tracking functionality
- Investigation management panel
- Real-time statistics dashboard

### On-Chain Transaction Screenshots
AnonymousReporting.png


## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Blockchain**: Ethereum / EVM-compatible chains
- **Smart Contracts**: Solidity
- **Encryption**: Fully Homomorphic Encryption (FHE)
- **Web3**: ethers.js v6
- **Development**: Hardhat
- **Hosting**: Vercel

## 📋 Report Categories

The system supports the following report categories:

1. **Corruption** - Bribery, embezzlement, abuse of power
2. **Fraud** - Financial fraud, identity theft, scams
3. **Environmental** - Pollution, illegal dumping, environmental violations
4. **Safety** - Workplace safety, public safety concerns
5. **Discrimination** - Unfair treatment based on protected characteristics
6. **Other** - Any other violations not covered above

## 🔄 Report Status Lifecycle

Reports progress through the following states:

1. **Submitted** (0) - Initial state when report is filed
2. **Under Investigation** (1) - Assigned to an investigator and being reviewed
3. **Resolved** (2) - Investigation completed and issue addressed
4. **Dismissed** (3) - Determined to be invalid or unfounded

## 🌐 Network Requirements

To use the Anonymous Reporting System, you need:

- A Web3 wallet (MetaMask recommended)
- Connection to the appropriate blockchain network
- Small amount of native cryptocurrency for transaction fees

## 🔒 Privacy & Security

### Privacy Guarantees

- **Reporter Identity Protection**: Optional anonymous submission hides reporter identity
- **Data Encryption**: All sensitive data encrypted with FHE before blockchain storage
- **Selective Access**: Only authorized investigators can access encrypted details
- **No Data Leakage**: Computations on encrypted data never expose plaintext
- **Immutable Audit Trail**: All actions recorded on blockchain for accountability

### Security Measures

- **Smart Contract Security**: Contract code follows security best practices
- **Access Control**: Multi-level permission system prevents unauthorized access
- **Immutable Records**: Blockchain storage prevents data tampering
- **Event Logging**: All actions logged for transparency and accountability
- **FHE Protection**: Cryptographic guarantees ensure data privacy

## 🎨 User Interface

The platform features a modern, intuitive interface with:

- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Tab Navigation**: Easy switching between submit, track, investigate, and statistics sections
- **Real-time Feedback**: Instant confirmation of transactions and status updates
- **Status Badges**: Clear visual indicators for report status
- **Connection Indicators**: Display of wallet connection status

## 🌍 Use Cases

### Corporate Whistleblowing
Employees can safely report workplace violations without fear of identification or retaliation.

### Government Transparency
Citizens can report corruption and misconduct in public institutions while remaining anonymous.

### Environmental Protection
Witnesses can report environmental violations and illegal activities affecting communities.

### Safety Compliance
Workers can flag safety hazards and violations without risking their employment.

### Academic Integrity
Students and faculty can report academic misconduct while protecting their identity.

## 💡 Why FHE Matters

Fully Homomorphic Encryption is a breakthrough cryptographic technology that allows:

- **Computation on Encrypted Data**: Process and verify reports without decrypting sensitive information
- **End-to-End Privacy**: Data remains encrypted from submission through investigation
- **Selective Disclosure**: Only authorized parties can decrypt specific information
- **Regulatory Compliance**: Meet privacy regulations while maintaining transparency

## 🤝 Contributing

We welcome contributions to improve the Anonymous Reporting System! Areas for contribution include:

- Feature enhancements
- Security improvements
- Documentation updates
- Bug fixes
- UI/UX improvements

Please visit our GitHub repository to get started: [https://github.com/DamionHane/AnonymousReporting](https://github.com/DamionHane/AnonymousReporting)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For questions, issues, or feature requests:

- **GitHub Issues**: [https://github.com/DamionHane/AnonymousReporting/issues](https://github.com/DamionHane/AnonymousReporting/issues)
- **Live Platform**: [https://anonymous-reporting.vercel.app/](https://anonymous-reporting.vercel.app/)

## 🙏 Acknowledgments

This project leverages cutting-edge blockchain and cryptography technologies to create a safer, more transparent world where anyone can report violations without fear of retaliation.

Special thanks to the open-source community and contributors who make privacy-preserving technologies accessible to everyone.

## 🚀 Future Roadmap

- Multi-chain support for broader accessibility
- Enhanced FHE features for additional data types
- Mobile native applications
- Integration with existing whistleblowing frameworks
- Advanced analytics for trend detection
- Multi-language support

---

**Empowering Voices, Protecting Privacy** 🛡️

*Built with blockchain and FHE technology for a more transparent and just society.*