# Deployment Documentation

## Anonymous Reporting System - Deployment Information

This document contains detailed information about the deployed smart contract on Sepolia testnet.

---

## Contract Information

### Contract Details

- **Contract Name**: AnonymousReporting
- **Contract Address**: `0xF75CEB2cE1CFb4c8493c8aa9176a833973C428a6`
- **Deployment Network**: Sepolia Testnet
- **Chain ID**: 11155111
- **Compiler Version**: Solidity 0.8.24
- **Optimization**: Enabled (200 runs)

### Network Information

**Sepolia Testnet**
- RPC Endpoint: https://sepolia.infura.io/v3/YOUR-PROJECT-ID
- Block Explorer: https://sepolia.etherscan.io/
- Faucet: https://sepoliafaucet.com/

### Explorer Links

**Contract on Etherscan**
- Contract Address: [https://sepolia.etherscan.io/address/0xF75CEB2cE1CFb4c8493c8aa9176a833973C428a6](https://sepolia.etherscan.io/address/0xF75CEB2cE1CFb4c8493c8aa9176a833973C428a6)
- Verified Source Code: [https://sepolia.etherscan.io/address/0xF75CEB2cE1CFb4c8493c8aa9176a833973C428a6#code](https://sepolia.etherscan.io/address/0xF75CEB2cE1CFb4c8493c8aa9176a833973C428a6#code)
- Read Contract: [https://sepolia.etherscan.io/address/0xF75CEB2cE1CFb4c8493c8aa9176a833973C428a6#readContract](https://sepolia.etherscan.io/address/0xF75CEB2cE1CFb4c8493c8aa9176a833973C428a6#readContract)
- Write Contract: [https://sepolia.etherscan.io/address/0xF75CEB2cE1CFb4c8493c8aa9176a833973C428a6#writeContract](https://sepolia.etherscan.io/address/0xF75CEB2cE1CFb4c8493c8aa9176a833973C428a6#writeContract)

---

## Deployment Process

### Prerequisites

Before deploying, ensure you have:

1. **Node.js** (v18 or higher)
2. **Hardhat** development environment
3. **Sepolia testnet ETH** in your deployer wallet
4. **Environment variables** configured (.env file)

### Environment Setup

Create a `.env` file with the following variables:

```env
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

### Deployment Steps

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Compile contracts**
   ```bash
   npm run compile
   ```

3. **Run tests** (optional but recommended)
   ```bash
   npm test
   ```

4. **Deploy to Sepolia**
   ```bash
   npm run deploy
   ```

5. **Verify contract** (if not auto-verified)
   ```bash
   npm run verify
   ```

### Deployment Script Output

The deployment script (`scripts/deploy.js`) provides:

- Network and deployer information
- Deployment transaction hash
- Contract address
- Gas usage and cost
- Automatic Etherscan verification
- Deployment summary with next steps

Example output:
```
============================================================
Anonymous Reporting System - Deployment Script
============================================================

Network: sepolia
Chain ID: 11155111

Deployer Information:
  Address: 0x...
  Balance: 0.5 ETH

Deploying AnonymousReporting contract...
  Transaction Hash: 0x...
  Waiting for deployment confirmation...

Deployment successful!
  Contract Address: 0xF75CEB2cE1CFb4c8493c8aa9176a833973C428a6
  Deployment Time: 15.23s

Transaction Details:
  Block Number: 12345678
  Gas Used: 2500000
  Effective Gas Price: 2.5 Gwei
  Total Cost: 0.00625 ETH

Contract Configuration:
  Authority Address: 0x...
  Authority Match: Yes

Deployment info saved to: deployments/sepolia.json
Frontend config saved to: public/contract-info.json

Contract verified successfully on Etherscan!
  Etherscan URL: https://sepolia.etherscan.io/address/0xF75CEB2cE1CFb4c8493c8aa9176a833973C428a6

============================================================
DEPLOYMENT SUMMARY
============================================================

Contract Information:
  Name: AnonymousReporting
  Address: 0xF75CEB2cE1CFb4c8493c8aa9176a833973C428a6
  Network: sepolia (Chain ID: 11155111)
  Deployer: 0x...

Explorer Links:
  Contract: https://sepolia.etherscan.io/address/0xF75CEB2cE1CFb4c8493c8aa9176a833973C428a6
  Transaction: https://sepolia.etherscan.io/tx/0x...

Next Steps:
  1. Run 'npm run verify' to verify the contract (if not auto-verified)
  2. Run 'npm run interact' to interact with the deployed contract
  3. Update frontend with contract address if needed
  4. Add authorized investigators using addInvestigator() function

============================================================
```

---

## Post-Deployment Configuration

### Adding Investigators

Only the authority (deployer) can add authorized investigators:

**Using interact script:**
```bash
npm run interact
# Select option 5: Add Investigator
# Enter investigator address
```

**Using Etherscan:**
1. Go to [Write Contract](https://sepolia.etherscan.io/address/0xF75CEB2cE1CFb4c8493c8aa9176a833973C428a6#writeContract)
2. Connect your wallet (must be authority)
3. Call `addInvestigator(address _investigator)`
4. Confirm transaction

**Using Hardhat console:**
```javascript
const contract = await ethers.getContractAt("AnonymousReporting", "0xF75CEB2cE1CFb4c8493c8aa9176a833973C428a6");
await contract.addInvestigator("0xInvestigatorAddress");
```

### Frontend Configuration

Update the contract address in your frontend:

**File: `public/app.js`**
```javascript
const CONTRACT_ADDRESS = "0xF75CEB2cE1CFb4c8493c8aa9176a833973C428a6";
const CONTRACT_ABI = [...]; // Get from artifacts/contracts/AnonymousReporting.sol/AnonymousReporting.json
```

The deployment script automatically creates `public/contract-info.json`:
```json
{
  "address": "0xF75CEB2cE1CFb4c8493c8aa9176a833973C428a6",
  "network": "sepolia",
  "chainId": 11155111,
  "deploymentTime": "2024-10-26T..."
}
```

---

## Contract Interaction

### Using Scripts

The project includes comprehensive interaction scripts:

1. **Interactive CLI**
   ```bash
   npm run interact
   ```
   Provides menu-driven interface for all contract functions.

2. **Simulation**
   ```bash
   npm run simulate
   ```
   Runs complete workflow simulation on local network.

### Using Etherscan

**Read Functions** (no wallet required):
- View at: [Read Contract](https://sepolia.etherscan.io/address/0xF75CEB2cE1CFb4c8493c8aa9176a833973C428a6#readContract)
- Functions: `authority()`, `getReportBasicInfo()`, `getSystemStats()`, `isAuthorizedInvestigator()`

**Write Functions** (wallet required):
- View at: [Write Contract](https://sepolia.etherscan.io/address/0xF75CEB2cE1CFb4c8493c8aa9176a833973C428a6#writeContract)
- Connect MetaMask
- Submit transactions directly

### Using Web3 Libraries

**ethers.js example:**
```javascript
const { ethers } = require("ethers");

// Connect to provider
const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/YOUR-PROJECT-ID");
const signer = new ethers.Wallet("YOUR_PRIVATE_KEY", provider);

// Get contract instance
const contractAddress = "0xF75CEB2cE1CFb4c8493c8aa9176a833973C428a6";
const contractABI = [...]; // From artifacts
const contract = new ethers.Contract(contractAddress, contractABI, signer);

// Submit a report
const tx = await contract.submitAnonymousReport(0, true); // CORRUPTION, anonymous
await tx.wait();
console.log("Report submitted!");

// Query statistics
const [total, resolved, pending] = await contract.getSystemStats();
console.log(`Total: ${total}, Resolved: ${resolved}, Pending: ${pending}`);
```

---

## Contract Functions Reference

### Public Functions

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `submitAnonymousReport` | `uint8 _category, bool _isAnonymous` | `uint32 reportId` | Submit a new anonymous report |
| `getReportBasicInfo` | `uint32 _reportId` | `status, timestamp, investigator, exists` | Get basic report information |
| `getSystemStats` | - | `total, resolved, pending` | Get system-wide statistics |
| `isAuthorizedInvestigator` | `address _user` | `bool` | Check if address is authorized investigator |

### Authority Functions

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `addInvestigator` | `address _investigator` | - | Add authorized investigator |
| `removeInvestigator` | `address _investigator` | - | Remove investigator authorization |
| `assignInvestigator` | `uint32 _reportId, address _investigator` | - | Assign report to investigator |
| `transferAuthority` | `address _newAuthority` | - | Transfer contract authority |

### Investigator Functions

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `updateReportStatus` | `uint32 _reportId, ReportStatus _newStatus` | - | Update report status |
| `addInvestigationNotes` | `uint32 _reportId, string _notes` | - | Add investigation notes |

---

## Contract Events

The contract emits the following events:

| Event | Parameters | Description |
|-------|-----------|-------------|
| `ReportSubmitted` | `reportId, category, timestamp` | New report submitted |
| `ReportAssigned` | `reportId, investigator` | Report assigned to investigator |
| `ReportStatusChanged` | `reportId, newStatus` | Report status updated |
| `InvestigatorAdded` | `investigator` | New investigator authorized |
| `InvestigatorRemoved` | `investigator` | Investigator authorization revoked |

---

## Monitoring & Analytics

### Viewing Events on Etherscan

1. Go to contract page: https://sepolia.etherscan.io/address/0xF75CEB2cE1CFb4c8493c8aa9176a833973C428a6
2. Click "Events" tab
3. Filter by event type
4. View transaction details

### Monitoring with Scripts

Use the simulation script to monitor contract activity:

```bash
npm run simulate
```

Or create custom monitoring scripts:

```javascript
const contract = await ethers.getContractAt("AnonymousReporting", CONTRACT_ADDRESS);

// Listen for new reports
contract.on("ReportSubmitted", (reportId, category, timestamp) => {
    console.log(`New report #${reportId} - Category: ${category}`);
});

// Listen for status changes
contract.on("ReportStatusChanged", (reportId, newStatus) => {
    console.log(`Report #${reportId} status: ${newStatus}`);
});
```

---

## Security Considerations

### Access Control

- **Authority**: Only deployer can add/remove investigators and assign reports
- **Investigators**: Only authorized investigators can update assigned reports
- **Public**: Anyone can submit reports and view basic statistics

### Best Practices

1. **Private Key Security**: Never commit `.env` file or share private keys
2. **Investigator Management**: Only add trusted addresses as investigators
3. **Report Verification**: Verify report details before taking action
4. **Status Updates**: Only update status when investigation is complete
5. **Data Privacy**: All sensitive data is encrypted with FHE on-chain

### Audit Recommendations

Before production deployment:
- Conduct professional security audit
- Perform comprehensive testing
- Review all access controls
- Test emergency procedures
- Implement monitoring systems

---

## Troubleshooting

### Common Issues

**Issue: Deployment fails with "insufficient funds"**
- Solution: Ensure deployer wallet has enough Sepolia ETH

**Issue: Contract verification fails**
- Solution: Wait 1-2 minutes after deployment, then run `npm run verify`

**Issue: Transaction reverts**
- Solution: Check account permissions and function requirements

**Issue: Cannot connect to contract**
- Solution: Verify contract address and network (Sepolia)

### Getting Help

- Check deployment logs in `deployments/sepolia.json`
- Review transaction on Etherscan
- Run simulation script to test functionality
- Consult README.md for detailed instructions

---

## Maintenance

### Upgrading Contract

The current contract is not upgradeable. To upgrade:

1. Deploy new version
2. Migrate data if needed
3. Update frontend configuration
4. Notify users of new address

### Backup & Recovery

**Important data locations:**
- Deployment info: `deployments/sepolia.json`
- Frontend config: `public/contract-info.json`
- Contract source: `contracts/AnonymousReporting.sol`

All contract data is stored on-chain and cannot be lost.

---

## Additional Resources

### Documentation
- [README.md](README.md) - Project overview and setup
- [Contract Source](contracts/AnonymousReporting.sol) - Smart contract code
- [Test Suite](test/AnonymousReporting.test.js) - Comprehensive tests

### Tools & Scripts
- `scripts/deploy.js` - Deployment script
- `scripts/verify.js` - Verification script
- `scripts/interact.js` - Interactive CLI
- `scripts/simulate.js` - Simulation testing

### External Links
- [Sepolia Etherscan](https://sepolia.etherscan.io/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [ethers.js Documentation](https://docs.ethers.org/)
- [Zama FHE Documentation](https://docs.zama.ai/)

---

**Deployment Date**: September 2024
**Last Updated**: October 2024
**Network**: Sepolia Testnet
**Status**: Active
