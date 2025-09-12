# Security Policy

## Overview

This document outlines the security policies, procedures, and best practices for the Anonymous Reporting System. Security is paramount for a privacy-focused whistleblowing platform that handles sensitive encrypted data.

## Table of Contents

- [Supported Versions](#supported-versions)
- [Security Architecture](#security-architecture)
- [Vulnerability Reporting](#vulnerability-reporting)
- [Security Audit Procedures](#security-audit-procedures)
- [Security Tools and Checks](#security-tools-and-checks)
- [Smart Contract Security](#smart-contract-security)
- [Access Control](#access-control)
- [Data Privacy](#data-privacy)
- [Deployment Security](#deployment-security)
- [Incident Response](#incident-response)
- [Security Checklist](#security-checklist)

## Supported Versions

We provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Security Architecture

### Fully Homomorphic Encryption (FHE)

The system uses Zama's FHE implementation for privacy-preserving encrypted data:

- **Encrypted Reports**: All report content is encrypted using FHE
- **Encrypted Severity**: Report severity levels are encrypted
- **Access Control**: Only authorized investigators can decrypt assigned reports
- **Authority Override**: System authority can access all reports for oversight

### Key Security Features

1. **Privacy by Design**: End-to-end encryption of sensitive data
2. **Role-Based Access Control (RBAC)**: Strict permission management
3. **Investigator Authorization**: Only approved investigators can be assigned reports
4. **Report Status Tracking**: Immutable audit trail of all report actions
5. **Authority Transfer**: Secure ownership transfer mechanism

## Vulnerability Reporting

### Reporting a Vulnerability

If you discover a security vulnerability, please follow these steps:

1. **DO NOT** disclose the vulnerability publicly
2. **DO NOT** exploit the vulnerability beyond verification
3. Submit a detailed report via one of these channels:
   - Email: security@anonymous-reporting.example (create this)
   - GitHub Security Advisories: Use "Report a vulnerability" button
   - Encrypted communication: Use PGP key if available

### What to Include

Your vulnerability report should include:

- **Description**: Clear explanation of the vulnerability
- **Impact**: Potential security impact and severity
- **Steps to Reproduce**: Detailed reproduction steps
- **Affected Components**: Smart contracts, scripts, or frontend
- **Proof of Concept**: Code or screenshots demonstrating the issue
- **Suggested Fix**: Proposed remediation (if available)
- **Environment**: Network (mainnet/testnet), version, dependencies

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**:
  - Critical: 24-72 hours
  - High: 1-2 weeks
  - Medium: 2-4 weeks
  - Low: 4-8 weeks

### Bug Bounty

We currently do not have a formal bug bounty program, but we acknowledge security researchers who responsibly disclose vulnerabilities in our README and documentation.

## Security Audit Procedures

### Automated Security Checks

Our CI/CD pipeline includes automated security checks:

```bash
# Run all security checks
npm run security

# Individual security checks
npm run security:audit    # NPM dependency audit
npm run security:check    # Solidity linting
npm run security:fix      # Attempt to fix vulnerabilities
```

### Manual Audit Process

1. **Code Review**: All code changes require peer review
2. **Smart Contract Audit**: Professional audit before mainnet deployment
3. **Penetration Testing**: Regular security testing of deployed contracts
4. **Dependency Review**: Monthly review of all dependencies

### Pre-commit Security Checks

Git hooks automatically run security checks before commits:

```bash
# .husky/pre-commit runs:
- ESLint (JavaScript security)
- Solhint (Solidity security)
- Prettier (code consistency)
- NPM audit (dependency security)
```

### Pre-push Testing

Before pushing code:

```bash
# .husky/pre-push runs:
- Full test suite
- Gas usage analysis
- Contract compilation
```

## Security Tools and Checks

### Solidity Security (Solhint)

Configuration: `.solhint.json`

Key security rules enforced:
- `avoid-call-value`: Prevent unsafe call.value()
- `avoid-low-level-calls`: Avoid low-level calls
- `avoid-sha3`: Use keccak256 instead of sha3
- `avoid-suicide`: Prevent selfdestruct usage
- `avoid-throw`: Use revert/require instead of throw
- `check-send-result`: Always check send() results
- `compiler-version`: Enforce compiler version
- `func-visibility`: Explicit visibility modifiers
- `mark-callable-contracts`: Mark external contracts
- `multiple-sends`: Avoid multiple sends in one function
- `no-complex-fallback`: Simple fallback functions
- `no-inline-assembly`: Avoid inline assembly
- `not-rely-on-block-hash`: Don't rely on block.blockhash
- `not-rely-on-time`: Don't rely on block.timestamp
- `reentrancy`: Prevent reentrancy attacks
- `state-visibility`: Explicit state variable visibility

Run Solidity security checks:
```bash
npm run lint:sol
npm run lint:sol:fix  # Auto-fix issues
```

### JavaScript Security (ESLint)

Configuration: `.eslintrc.json`

Security rules:
- No eval() usage
- No unused variables
- Strict mode enforcement
- No console in production
- Proper error handling

Run JavaScript security checks:
```bash
npm run lint:js
npm run lint:js:fix  # Auto-fix issues
```

### Dependency Security (NPM Audit)

Automatically checks for known vulnerabilities:

```bash
npm audit                        # View all vulnerabilities
npm audit --audit-level=moderate # Check moderate and above
npm run security:audit           # Run with configured level
npm run security:fix             # Attempt automatic fixes
```

Audit levels:
- `low`: Non-critical issues
- `moderate`: Potentially exploitable (our default threshold)
- `high`: Serious vulnerabilities
- `critical`: Immediately exploitable

### Gas Security and DoS Prevention

Monitor gas usage to prevent DoS attacks:

```bash
npm run test:gas     # Gas usage in tests
npm run gas-report   # Detailed gas report
```

Gas limits configured in `.env`:
- `GAS_LIMIT`: Maximum gas per transaction (8,000,000)
- `MAX_GAS_PER_TX`: DoS protection limit (500,000)

## Smart Contract Security

### Access Control

The contract implements strict role-based access control:

```solidity
// Authority (Owner)
- addInvestigator()
- removeInvestigator()
- assignReport()
- transferAuthority()
- Can access all encrypted reports

// Investigators
- updateReportStatus() (only assigned reports)
- addInvestigationNote() (only assigned reports)
- Can only decrypt assigned reports

// Reporters (Anyone)
- submitReport()
- Can submit anonymous encrypted reports
```

### Reentrancy Protection

The contract uses checks-effects-interactions pattern to prevent reentrancy:

1. **Checks**: Validate conditions and permissions
2. **Effects**: Update state variables
3. **Interactions**: External calls (if any)

### Input Validation

All inputs are validated:
- Address validation (non-zero addresses)
- Status validation (valid enum values)
- Access permission checks
- Encrypted data validation

### Event Logging

All critical actions emit events for transparency:
- `InvestigatorAdded`
- `InvestigatorRemoved`
- `ReportSubmitted`
- `ReportAssigned`
- `ReportStatusUpdated`
- `InvestigationNoteAdded`
- `AuthorityTransferred`

### Integer Overflow Protection

Using Solidity 0.8.24+ with built-in overflow protection:
- Automatic overflow/underflow checks
- No SafeMath library needed
- Unchecked blocks only where safe

## Access Control

### Role Hierarchy

```
Authority (Contract Owner)
    ↓
Investigators (Approved addresses)
    ↓
Reporters (Public - anonymous)
```

### Permission Matrix

| Function | Authority | Investigator | Reporter | Public |
|----------|-----------|--------------|----------|--------|
| submitReport | ✓ | ✓ | ✓ | ✓ |
| addInvestigator | ✓ | ✗ | ✗ | ✗ |
| removeInvestigator | ✓ | ✗ | ✗ | ✗ |
| assignReport | ✓ | ✗ | ✗ | ✗ |
| updateReportStatus | ✓ | ✓* | ✗ | ✗ |
| addInvestigationNote | ✓ | ✓* | ✗ | ✗ |
| getEncryptedReport | ✓ | ✓* | ✗ | ✗ |
| transferAuthority | ✓ | ✗ | ✗ | ✗ |

*Only for assigned reports

### Security Best Practices

1. **Principle of Least Privilege**: Users only have minimum necessary permissions
2. **Separation of Duties**: Authority and investigators have distinct roles
3. **Audit Trail**: All permission changes are logged via events
4. **Revocable Access**: Investigators can be removed at any time

## Data Privacy

### Encryption Standards

- **Algorithm**: Fully Homomorphic Encryption (FHE) via Zama
- **Library**: @fhevm/solidity ^0.7.0
- **Data Types**: euint8 (encrypted 8-bit unsigned integers)

### Encrypted Data

The following data is encrypted on-chain:
1. **Report Content**: Full report description (euint8[])
2. **Severity Level**: Report severity (euint8)

### Non-encrypted Data

Public metadata (for transparency):
- Report ID
- Reporter address
- Timestamp
- Current status
- Assigned investigator

### Privacy Guarantees

- **Reporter Anonymity**: Optional anonymous submission
- **Content Privacy**: Only authorized parties can decrypt
- **Investigator Privacy**: Investigation notes are encrypted
- **Access Logs**: No on-chain tracking of decryption attempts

## Deployment Security

### Pre-deployment Checklist

- [ ] All tests passing (npm test)
- [ ] Code coverage ≥ 80%
- [ ] Security audit completed
- [ ] Gas optimization reviewed
- [ ] Contract size < 24KB
- [ ] Solhint checks passing
- [ ] ESLint checks passing
- [ ] NPM audit clean (moderate+)
- [ ] .env configured correctly
- [ ] Private keys secured
- [ ] Deployer funded with sufficient ETH
- [ ] Network configuration verified

### Deployment Environment

1. **Testnet First**: Always deploy to Sepolia before mainnet
2. **Environment Variables**: Use .env file, never hardcode secrets
3. **Private Key Security**:
   - Never commit .env to git
   - Use hardware wallets for mainnet
   - Rotate keys regularly
4. **Verification**: Verify contract on Etherscan immediately after deployment

### Post-deployment Security

1. **Transfer Authority**: Transfer to multi-sig wallet
2. **Freeze Contract**: Consider using proxy pattern for upgrades
3. **Monitor Events**: Set up event monitoring
4. **Rate Limiting**: Implement off-chain rate limiting
5. **Backup**: Store deployment artifacts securely

### Network Security

```javascript
// hardhat.config.js security settings
module.exports = {
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,  // Never hardcode
      accounts: [process.env.PRIVATE_KEY], // From .env only
      chainId: 11155111,
      gas: 8000000,
      gasPrice: 'auto'
    }
  }
}
```

## Incident Response

### Incident Classification

**Critical**: Contract exploited, funds at risk
- Response time: Immediate
- Action: Pause contract, notify users, investigate

**High**: Vulnerability discovered but not exploited
- Response time: 24 hours
- Action: Deploy patch, verify fix, communicate

**Medium**: Security issue with limited impact
- Response time: 1 week
- Action: Plan fix, test thoroughly, deploy

**Low**: Minor security concern
- Response time: 2-4 weeks
- Action: Include in next release

### Response Procedures

1. **Detection**: Identify the security incident
2. **Containment**: Stop the exploit (pause contract if needed)
3. **Investigation**: Determine root cause and scope
4. **Eradication**: Deploy fix or mitigation
5. **Recovery**: Restore normal operations
6. **Lessons Learned**: Document and improve processes

### Communication Plan

- **Internal**: Immediate notification to development team
- **Users**: Status page update within 1 hour for critical issues
- **Public**: Full disclosure after patch deployment
- **Researchers**: Acknowledgment and credit

## Security Checklist

### Development Phase

- [ ] Follow Solidity best practices
- [ ] Use latest stable compiler version
- [ ] Enable optimizer with appropriate runs
- [ ] Add comprehensive NatSpec comments
- [ ] Implement proper access control
- [ ] Validate all inputs
- [ ] Emit events for all state changes
- [ ] Use checks-effects-interactions pattern
- [ ] Avoid low-level calls when possible
- [ ] Handle errors properly (require/revert)

### Testing Phase

- [ ] Write comprehensive unit tests
- [ ] Test access control thoroughly
- [ ] Test edge cases and boundaries
- [ ] Test with multiple user roles
- [ ] Achieve ≥80% code coverage
- [ ] Run gas usage analysis
- [ ] Test on local network first
- [ ] Test on testnet before mainnet

### Security Review

- [ ] Run Solhint with recommended rules
- [ ] Run ESLint on all JavaScript
- [ ] NPM audit shows no vulnerabilities
- [ ] Manual code review completed
- [ ] Professional audit (for mainnet)
- [ ] Verify contract size < 24KB
- [ ] Check gas optimization
- [ ] Review dependencies for security

### Deployment

- [ ] Deploy to testnet first
- [ ] Verify deployment succeeded
- [ ] Verify contract on Etherscan
- [ ] Test all functions on testnet
- [ ] Monitor gas prices
- [ ] Backup deployment artifacts
- [ ] Document contract addresses
- [ ] Transfer to secure authority address

### Post-deployment

- [ ] Monitor contract events
- [ ] Set up alerting for unusual activity
- [ ] Regular security audits
- [ ] Keep dependencies updated
- [ ] Respond to security reports promptly
- [ ] Maintain incident response plan

## Security Configuration

### Recommended .env Settings

```bash
# Security
SECURITY_CHECKS=true
AUDIT_LEVEL=moderate
MAX_CONTRACT_SIZE=24576

# Gas & DoS Protection
GAS_LIMIT=8000000
MAX_GAS_PER_TX=500000
ENABLE_RATE_LIMITING=true
ENABLE_DDOS_PROTECTION=true

# Code Quality
ENABLE_LINTING=true
ENABLE_PRETTIER=true
COVERAGE_THRESHOLD=80

# Network (Use separate keys for testnet/mainnet)
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
```

### Hardhat Configuration

```javascript
// Recommended security settings
solidity: {
  version: "0.8.24",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200  // Balance between deploy and runtime gas
    },
    evmVersion: "cancun",
    viaIR: false  // Disable experimental features
  }
}
```

## Resources

### Security Documentation

- [Solidity Security Considerations](https://docs.soliditylang.org/en/latest/security-considerations.html)
- [ConsenSys Smart Contract Best Practices](https://consensys.github.io/smart-contract-best-practices/)
- [OpenZeppelin Security](https://docs.openzeppelin.com/contracts/4.x/api/security)
- [Zama FHE Security](https://docs.zama.ai/fhevm)

### Security Tools

- [Slither](https://github.com/crytic/slither) - Static analysis
- [Mythril](https://github.com/ConsenSys/mythril) - Security scanner
- [Manticore](https://github.com/trailofbits/manticore) - Symbolic execution
- [Echidna](https://github.com/crytic/echidna) - Fuzzing

### Audit Services

- Trail of Bits
- OpenZeppelin
- Consensys Diligence
- Quantstamp
- CertiK

## Contact

For security-related questions or to report vulnerabilities:

- **Email**: security@anonymous-reporting.example
- **GitHub**: Use Security Advisories
- **Emergency**: Contact maintainers directly

---

**Last Updated**: 2025-10-26
**Version**: 1.0.0
**Maintainer**: Development Team
