# Quick Start Guide

## Anonymous Reporting System - Quick Setup & Deployment

This guide will help you get the Anonymous Reporting System up and running in minutes.

---

## Prerequisites

Before starting, ensure you have:

- [x] Node.js v18 or higher
- [x] npm or yarn package manager
- [x] MetaMask wallet
- [x] Sepolia testnet ETH ([Get from faucet](https://sepoliafaucet.com/))

---

## Installation (5 minutes)

### Step 1: Clone & Install

```bash
# Clone the repository
git clone <repository-url>
cd anonymous-reporting-system

# Install dependencies
npm install
```

### Step 2: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your credentials
# Required:
# - PRIVATE_KEY: Your wallet private key (from MetaMask)
# - SEPOLIA_RPC_URL: Infura or Alchemy RPC endpoint
# - ETHERSCAN_API_KEY: Etherscan API key (for verification)
```

**Get API Keys:**
- Infura: https://infura.io (free)
- Alchemy: https://alchemy.com (free)
- Etherscan: https://etherscan.io/myapikey (free)

### Step 3: Compile Contracts

```bash
npm run compile
```

---

## Testing (2 minutes)

### Run Test Suite

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run simulation (local deployment with full workflow)
npm run simulate
```

Expected output:
```
  AnonymousReporting Contract
    ✓ Should set the correct authority
    ✓ Should initialize with zero reports
    ✓ Should allow anyone to submit a report
    ... (30+ tests)

  30 passing (5s)
```

---

## Deployment (3 minutes)

### Deploy to Sepolia Testnet

```bash
npm run deploy
```

The script will:
1. ✅ Check your deployer balance
2. ✅ Deploy AnonymousReporting contract
3. ✅ Verify contract on Etherscan
4. ✅ Save deployment info to `deployments/sepolia.json`
5. ✅ Display contract address and explorer links

**Expected Output:**
```
============================================================
Anonymous Reporting System - Deployment Script
============================================================

Network: sepolia
Chain ID: 11155111

Deployer Information:
  Address: 0x...
  Balance: 0.5 ETH

Deployment successful!
  Contract Address: 0xF75CEB2cE1CFb4c8493c8aa9176a833973C428a6

Contract verified successfully on Etherscan!
  Etherscan URL: https://sepolia.etherscan.io/address/0x...
============================================================
```

---

## Contract Interaction (2 minutes)

### Option 1: Interactive CLI

```bash
npm run interact
```

**Menu Options:**
```
1. Submit Anonymous Report
2. Query Report Status
3. View System Statistics
4. Check if Address is Authorized Investigator
5. Add Investigator (authority only)
6. Remove Investigator (authority only)
7. Assign Report to Investigator
8. Update Report Status
9. Add Investigation Notes
0. Exit
```

### Option 2: Etherscan Interface

1. Go to contract on Etherscan:
   https://sepolia.etherscan.io/address/0xF75CEB2cE1CFb4c8493c8aa9176a833973C428a6

2. Navigate to "Write Contract" or "Read Contract"

3. Connect your MetaMask wallet

4. Interact with contract functions directly

### Option 3: Frontend (if deployed)

```bash
# Start local frontend server
npm run dev

# Open in browser
# http://localhost:3000
```

---

## Common Tasks

### Submit a Report

**Via CLI:**
```bash
npm run interact
# Choose: 1. Submit Anonymous Report
# Select category (0-5)
# Choose anonymous (y/n)
```

**Via Code:**
```javascript
const contract = await ethers.getContractAt(
    "AnonymousReporting",
    "0xF75CEB2cE1CFb4c8493c8aa9176a833973C428a6"
);

// Submit corruption report anonymously
const tx = await contract.submitAnonymousReport(0, true);
await tx.wait();
```

### Add Investigator (Authority Only)

**Via CLI:**
```bash
npm run interact
# Choose: 5. Add Investigator
# Enter investigator address
```

**Via Etherscan:**
1. Go to Write Contract tab
2. Connect wallet (must be authority)
3. Call `addInvestigator(address)`
4. Enter investigator address
5. Confirm transaction

### Query Report Status

**Via CLI:**
```bash
npm run interact
# Choose: 2. Query Report Status
# Enter report ID
```

**Via Code:**
```javascript
const [status, timestamp, investigator, exists] =
    await contract.getReportBasicInfo(reportId);

console.log("Status:", status); // 0=SUBMITTED, 1=INVESTIGATING, 2=RESOLVED, 3=DISMISSED
```

### View Statistics

**Via CLI:**
```bash
npm run interact
# Choose: 3. View System Statistics
```

**Via Code:**
```javascript
const [total, resolved, pending] = await contract.getSystemStats();
console.log(`Total: ${total}, Resolved: ${resolved}, Pending: ${pending}`);
```

---

## Project Structure

```
anonymous-reporting-system/
├── contracts/
│   └── AnonymousReporting.sol      # Main smart contract
├── scripts/
│   ├── deploy.js                   # Deployment script
│   ├── verify.js                   # Verification script
│   ├── interact.js                 # Interactive CLI
│   └── simulate.js                 # Full workflow simulation
├── test/
│   └── AnonymousReporting.test.js  # Comprehensive test suite
├── public/
│   ├── index.html                  # Frontend UI
│   ├── app.js                      # Frontend JavaScript
│   └── contract-info.json          # Auto-generated config
├── deployments/
│   └── sepolia.json                # Deployment info (auto-generated)
├── hardhat.config.js               # Hardhat configuration
├── package.json                    # Dependencies & scripts
├── .env.example                    # Environment template
├── README.md                       # Full documentation
├── DEPLOYMENT.md                   # Deployment details
└── QUICKSTART.md                   # This file
```

---

## NPM Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run compile` | Compile smart contracts |
| `npm run deploy` | Deploy to Sepolia testnet |
| `npm run verify` | Verify contract on Etherscan |
| `npm run interact` | Interactive contract CLI |
| `npm run simulate` | Run workflow simulation |
| `npm test` | Run test suite |
| `npm run test:coverage` | Run tests with coverage |
| `npm run clean` | Clean build artifacts |
| `npm run lint` | Lint Solidity files |
| `npm run format` | Format code |
| `npm run dev` | Start frontend dev server |

---

## Deployed Contract Information

**Sepolia Testnet:**
- Contract: `0xF75CEB2cE1CFb4c8493c8aa9176a833973C428a6`
- Explorer: https://sepolia.etherscan.io/address/0xF75CEB2cE1CFb4c8493c8aa9176a833973C428a6
- Network: Sepolia (Chain ID: 11155111)

---

## Report Categories

| ID | Category | Description |
|----|----------|-------------|
| 0 | CORRUPTION | Bribery, embezzlement, abuse of power |
| 1 | FRAUD | Financial fraud, identity theft, scams |
| 2 | ENVIRONMENTAL | Pollution, illegal dumping |
| 3 | SAFETY | Workplace/public safety concerns |
| 4 | DISCRIMINATION | Unfair treatment |
| 5 | OTHER | Any other violations |

---

## Report Status Workflow

```
SUBMITTED (0)
    ↓
UNDER_INVESTIGATION (1)
    ↓
RESOLVED (2) or DISMISSED (3)
```

---

## Troubleshooting

### Issue: "Insufficient funds" error
**Solution:** Get Sepolia ETH from https://sepoliafaucet.com/

### Issue: Contract verification fails
**Solution:**
```bash
# Wait 1-2 minutes after deployment, then:
npm run verify
```

### Issue: Cannot connect to contract
**Solution:**
- Check network is Sepolia (Chain ID: 11155111)
- Verify contract address is correct
- Ensure .env file is configured

### Issue: Transaction reverts
**Solution:**
- Check you have correct permissions (authority/investigator)
- Verify function parameters are valid
- Check report exists before querying

---

## Next Steps

After successful deployment:

1. ✅ **Add Investigators**
   ```bash
   npm run interact
   # Choose: 5. Add Investigator
   ```

2. ✅ **Test Report Submission**
   ```bash
   npm run interact
   # Choose: 1. Submit Anonymous Report
   ```

3. ✅ **Update Frontend** (if applicable)
   - Update `CONTRACT_ADDRESS` in `public/app.js`
   - Deploy to Vercel or similar platform

4. ✅ **Monitor Contract**
   - View events on Etherscan
   - Track system statistics
   - Monitor report submissions

---

## Additional Resources

- **Full Documentation**: [README.md](README.md)
- **Deployment Guide**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Contract Source**: [contracts/AnonymousReporting.sol](contracts/AnonymousReporting.sol)
- **Test Suite**: [test/AnonymousReporting.test.js](test/AnonymousReporting.test.js)

### External Links
- [Hardhat Documentation](https://hardhat.org/docs)
- [ethers.js Docs](https://docs.ethers.org/)
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Zama FHE Docs](https://docs.zama.ai/)

---

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review deployment logs in `deployments/sepolia.json`
3. Verify transaction on Etherscan
4. Run `npm run simulate` to test functionality locally

---

**Total Setup Time**: ~10-15 minutes

**Ready to deploy?** Run `npm run deploy` to get started!

---

*Built with Hardhat, Solidity, and FHE technology*
