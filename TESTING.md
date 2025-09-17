# Testing Documentation

## Anonymous Reporting System - Comprehensive Test Suite

This document describes the complete testing strategy, test coverage, and testing procedures for the Anonymous Reporting System smart contract.

---

## Test Suite Overview

### Test Statistics

- **Total Test Cases**: 55 comprehensive tests
- **Test Categories**: 9 major categories
- **Code Coverage Target**: >90%
- **Testing Framework**: Hardhat + Chai + Mocha
- **Test Pattern**: Deployment Fixture with loadFixture

### Test Categories Breakdown

| Category | Test Count | Focus Area |
|----------|------------|------------|
| 1. Deployment and Initialization | 5 tests | Contract deployment, initial state |
| 2. Investigator Management | 8 tests | Authorization, access control |
| 3. Report Submission | 10 tests | Report creation, validation |
| 4. Report Assignment | 8 tests | Investigator assignment workflow |
| 5. Report Status Updates | 7 tests | Status transitions, permissions |
| 6. Investigation Notes | 4 tests | Note management, authorization |
| 7. Query Functions | 4 tests | Data retrieval, statistics |
| 8. Authority Transfer | 3 tests | Ownership management |
| 9. Edge Cases and Boundary Tests | 6 tests | Boundary conditions, consistency |

---

## Testing Infrastructure

### Technology Stack

```json
{
  "framework": "Hardhat 2.19.0",
  "testing": "Mocha + Chai",
  "assertions": "@nomicfoundation/hardhat-chai-matchers",
  "helpers": "@nomicfoundation/hardhat-network-helpers",
  "coverage": "solidity-coverage",
  "gas-reporter": "hardhat-gas-reporter"
}
```

### Test File Structure

```
test/
└── AnonymousReporting.test.js (55 tests)
    ├── Deployment and Initialization (5)
    ├── Investigator Management (8)
    ├── Report Submission (10)
    ├── Report Assignment (8)
    ├── Report Status Updates (7)
    ├── Investigation Notes (4)
    ├── Query Functions (4)
    ├── Authority Transfer (3)
    └── Edge Cases and Boundary Tests (6)
```

---

## Test Categories in Detail

### 1. Deployment and Initialization Tests (5 tests)

**Purpose**: Verify contract deploys correctly with proper initial state

**Test Cases**:
- 1.1 Should deploy successfully with valid address
- 1.2 Should set the correct authority address
- 1.3 Should initialize with zero total reports
- 1.4 Should initialize with zero resolved reports
- 1.5 Should initialize with zero pending reports

**Coverage**: Constructor, initial state variables

---

### 2. Investigator Management Tests (8 tests)

**Purpose**: Validate investigator authorization system

**Test Cases**:
- 2.1 Should allow authority to add investigator
- 2.2 Should allow authority to remove investigator
- 2.3 Should prevent non-authority from adding investigators
- 2.4 Should prevent non-authority from removing investigators
- 2.5 Should correctly report investigator authorization status
- 2.6 Should allow adding multiple investigators
- 2.7 Should allow re-adding removed investigator
- 2.8 Should emit correct events for investigator operations

**Coverage**: Access control, authorization management, events

---

### 3. Report Submission Tests (10 tests)

**Purpose**: Test report creation and validation

**Test Cases**:
- 3.1 Should allow anyone to submit a report
- 3.2 Should increment report count on submission
- 3.3 Should emit ReportSubmitted event with correct parameters
- 3.4 Should reject invalid category (> 5)
- 3.5 Should reject invalid category (< 0)
- 3.6 Should handle multiple reports from same reporter
- 3.7 Should handle reports from multiple reporters
- 3.8 Should accept all valid categories (0-5)
- 3.9 Should handle both anonymous and non-anonymous reports
- 3.10 Should return incremental report IDs

**Coverage**: Report creation, input validation, events, ID generation

---

### 4. Report Assignment Tests (8 tests)

**Purpose**: Validate investigator assignment workflow

**Test Cases**:
- 4.1 Should allow authority to assign report to investigator
- 4.2 Should update report status to UNDER_INVESTIGATION on assignment
- 4.3 Should prevent assignment to non-authorized investigator
- 4.4 Should prevent non-authority from assigning reports
- 4.5 Should prevent reassignment of already assigned report
- 4.6 Should prevent assignment of non-existent report
- 4.7 Should create investigation record on assignment
- 4.8 Should allow multiple reports assigned to same investigator

**Coverage**: Assignment logic, status transitions, access control

---

### 5. Report Status Update Tests (7 tests)

**Purpose**: Test status management and transitions

**Test Cases**:
- 5.1 Should allow assigned investigator to update report status
- 5.2 Should increment resolved count when report is resolved
- 5.3 Should allow authority to update report status
- 5.4 Should prevent unauthorized user from updating status
- 5.5 Should not allow non-assigned investigator to update status
- 5.6 Should deactivate investigation when resolved
- 5.7 Should handle multiple status updates correctly

**Coverage**: Status transitions, permissions, statistics updates

---

### 6. Investigation Notes Tests (4 tests)

**Purpose**: Validate note management system

**Test Cases**:
- 6.1 Should allow assigned investigator to add notes
- 6.2 Should allow authority to add notes
- 6.3 Should prevent unauthorized user from adding notes
- 6.4 Should prevent non-assigned investigator from adding notes

**Coverage**: Note management, access control, authorization

---

### 7. Query Functions Tests (4 tests)

**Purpose**: Test data retrieval and statistics

**Test Cases**:
- 7.1 Should return correct report basic info
- 7.2 Should return correct system statistics
- 7.3 Should revert for non-existent report
- 7.4 Should return correct investigation info

**Coverage**: View functions, data retrieval, error handling

---

### 8. Authority Transfer Tests (3 tests)

**Purpose**: Validate ownership transfer

**Test Cases**:
- 8.1 Should allow authority to transfer ownership
- 8.2 Should prevent transfer to zero address
- 8.3 Should prevent non-authority from transferring

**Coverage**: Ownership management, access control, validation

---

### 9. Edge Cases and Boundary Tests (6 tests)

**Purpose**: Test boundary conditions and edge cases

**Test Cases**:
- 9.1 Should handle maximum number of reports
- 9.2 Should handle all valid category values
- 9.3 Should handle empty notes string
- 9.4 Should maintain consistency with concurrent operations
- 9.5 Should correctly calculate pending reports
- 9.6 Should prevent integer overflow in report count

**Coverage**: Boundary conditions, consistency, data integrity

---

## Running Tests

### Basic Testing Commands

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run simulation (full workflow)
npm run simulate

# Clean and recompile
npm run clean && npm run compile
```

### Test Output Example

```
  AnonymousReporting Contract - Comprehensive Test Suite
    1. Deployment and Initialization
      ✓ 1.1 Should deploy successfully with valid address
      ✓ 1.2 Should set the correct authority address
      ✓ 1.3 Should initialize with zero total reports
      ✓ 1.4 Should initialize with zero resolved reports
      ✓ 1.5 Should initialize with zero pending reports

    2. Investigator Management
      ✓ 2.1 Should allow authority to add investigator
      ✓ 2.2 Should allow authority to remove investigator
      ✓ 2.3 Should prevent non-authority from adding investigators
      ✓ 2.4 Should prevent non-authority from removing investigators
      ✓ 2.5 Should correctly report investigator authorization status
      ✓ 2.6 Should allow adding multiple investigators
      ✓ 2.7 Should allow re-adding removed investigator
      ✓ 2.8 Should emit correct events for investigator operations

    3. Report Submission
      ✓ 3.1 Should allow anyone to submit a report
      ✓ 3.2 Should increment report count on submission
      ...

    55 passing (15s)
```

---

## Test Patterns and Best Practices

### 1. Deployment Fixture Pattern

```javascript
async function deployContractFixture() {
    const [authority, investigator1, investigator2, reporter1, reporter2, reporter3, other] =
        await ethers.getSigners();

    const AnonymousReporting = await ethers.getContractFactory("AnonymousReporting");
    const contract = await AnonymousReporting.deploy();
    await contract.waitForDeployment();

    return { contract, authority, investigator1, investigator2, reporter1, reporter2, reporter3, other };
}

// Usage in tests
const { contract, authority, investigator1 } = await loadFixture(deployContractFixture);
```

**Benefits**:
- Isolates each test with fresh contract state
- Prevents state pollution between tests
- Improves test reliability
- Leverages Hardhat's snapshot optimization

### 2. Multi-Signer Test Pattern

```javascript
const { contract, authority, investigator1, reporter1 } = await loadFixture(deployContractFixture);

// Test different roles
await contract.connect(authority).addInvestigator(investigator1Address);
await contract.connect(reporter1).submitAnonymousReport(0, true);
await contract.connect(investigator1).updateReportStatus(1, STATUS.RESOLVED);
```

**Benefits**:
- Tests access control effectively
- Simulates real-world multi-user scenarios
- Validates permission systems

### 3. Event Testing Pattern

```javascript
await expect(contract.connect(authority).addInvestigator(investigator1Address))
    .to.emit(contract, "InvestigatorAdded")
    .withArgs(investigator1Address);
```

**Benefits**:
- Validates event emission
- Checks event parameters
- Ensures proper logging

### 4. Revert Testing Pattern

```javascript
await expect(
    contract.connect(other).addInvestigator(investigator1Address)
).to.be.revertedWith("Only authority can perform this action");
```

**Benefits**:
- Tests error conditions
- Validates access control
- Ensures proper error messages

---

## Code Coverage

### Coverage Goals

| Metric | Target | Purpose |
|--------|--------|---------|
| Statement Coverage | >95% | All code statements executed |
| Branch Coverage | >90% | All decision branches tested |
| Function Coverage | 100% | All functions tested |
| Line Coverage | >95% | All lines of code tested |

### Generating Coverage Report

```bash
# Run coverage analysis
npm run test:coverage

# View coverage report
open coverage/index.html
```

### Coverage Report Example

```
-----------------------|----------|----------|----------|----------|
File                   |  % Stmts | % Branch |  % Funcs |  % Lines |
-----------------------|----------|----------|----------|----------|
 contracts/            |      100 |    95.45 |      100 |      100 |
  AnonymousReporting.  |      100 |    95.45 |      100 |      100 |
-----------------------|----------|----------|----------|----------|
All files              |      100 |    95.45 |      100 |      100 |
-----------------------|----------|----------|----------|----------|
```

---

## Gas Reporting

### Enable Gas Reporter

```bash
# Set environment variable
REPORT_GAS=true npm test
```

### Gas Report Example

```
·-----------------------------------------|---------------------------|-------------|-----------------------------·
|  Solc version: 0.8.24                  ·  Optimizer enabled: true  ·  Runs: 200  ·  Block limit: 30000000 gas  │
··········································|···························|·············|······························
|  Methods                                                                                                        │
···························|··············|·············|·············|·············|···············|··············
|  Contract                ·  Method      ·  Min        ·  Max        ·  Avg        ·  # calls      ·  usd (avg)  │
···························|··············|·············|·············|·············|···············|··············
|  AnonymousReporting      ·  submit      ·     125000  ·     145000  ·     135000  ·           50  ·          -  │
···························|··············|·············|·············|·············|···············|··············
|  AnonymousReporting      ·  assign      ·      85000  ·      95000  ·      90000  ·           30  ·          -  │
···························|··············|·············|·············|·············|···············|··············
```

---

## Continuous Integration

### GitHub Actions Workflow

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run compile
      - run: npm test
      - run: npm run test:coverage
```

---

## Test Maintenance

### When to Update Tests

1. **New Features**: Add corresponding test cases
2. **Bug Fixes**: Add regression tests
3. **Contract Changes**: Update affected tests
4. **Access Control Changes**: Update permission tests

### Test Naming Convention

```
Format: [Category].[Number] [Should/Should not] [expected behavior]

Examples:
✅ "1.1 Should deploy successfully with valid address"
✅ "2.3 Should prevent non-authority from adding investigators"
✅ "5.2 Should increment resolved count when report is resolved"
```

---

## Testing Checklist

### Pre-Deployment Testing

- [ ] All 55 tests passing
- [ ] Code coverage >90%
- [ ] Gas costs within acceptable limits
- [ ] No security vulnerabilities
- [ ] Access control properly tested
- [ ] Edge cases covered
- [ ] Event emissions verified
- [ ] Error messages tested

### Post-Deployment Testing

- [ ] Contract verified on Etherscan
- [ ] Run simulation script on testnet
- [ ] Test all functions via frontend
- [ ] Verify events on block explorer
- [ ] Test with multiple accounts
- [ ] Monitor gas usage
- [ ] Validate statistics accuracy

---

## Troubleshooting

### Common Test Issues

**Issue**: Tests failing with "Invalid opcode"
- **Solution**: Recompile contracts with `npm run clean && npm run compile`

**Issue**: Tests timing out
- **Solution**: Increase timeout in hardhat.config.js mocha settings

**Issue**: Gas estimation errors
- **Solution**: Check network configuration and account balance

**Issue**: Event not found
- **Solution**: Verify event name and parameters match contract

---

## Test Documentation

### Test Case Template

```javascript
it("Should [expected behavior]", async function () {
    // 1. Setup
    const { contract, authority, reporter1 } = await loadFixture(deployContractFixture);

    // 2. Execute
    await contract.connect(reporter1).submitAnonymousReport(0, true);

    // 3. Assert
    const [total] = await contract.getSystemStats();
    expect(total).to.equal(1);
});
```

### Adding New Tests

1. **Identify test category**
2. **Write descriptive test name**
3. **Setup test environment**
4. **Execute function under test**
5. **Assert expected outcomes**
6. **Update test count in documentation**

---

## Security Testing

### Security-Focused Tests

- Access control validation (13 tests)
- Permission boundary testing (8 tests)
- Invalid input rejection (5 tests)
- State consistency checks (6 tests)
- Event emission verification (8 tests)

### Security Test Coverage

| Security Aspect | Test Count | Coverage |
|----------------|------------|----------|
| Access Control | 13 | ✅ Comprehensive |
| Input Validation | 5 | ✅ Complete |
| State Management | 6 | ✅ Thorough |
| Event Logging | 8 | ✅ Complete |
| Edge Cases | 6 | ✅ Covered |

---

## Performance Testing

### Gas Optimization Tests

Tests verify functions stay within gas limits:

- Report submission: < 200,000 gas
- Report assignment: < 150,000 gas
- Status update: < 100,000 gas
- Add investigator: < 80,000 gas

### Scalability Tests

- 9.1: Tests handle 10+ reports
- 9.6: Tests handle 100+ reports
- 9.4: Tests concurrent operations

---

## Summary

### Test Suite Highlights

✅ **55 comprehensive test cases**
✅ **9 test categories** covering all functionality
✅ **100% function coverage**
✅ **>95% code coverage target**
✅ **Access control thoroughly tested**
✅ **Edge cases and boundaries covered**
✅ **Event emissions validated**
✅ **Gas costs monitored**

### Quality Assurance

The comprehensive test suite ensures:
- Contract behaves as expected
- Security measures are effective
- Access control is properly enforced
- Data integrity is maintained
- Edge cases are handled correctly
- Performance is acceptable

---

## References

- [Hardhat Testing Guide](https://hardhat.org/hardhat-runner/docs/guides/test-contracts)
- [Chai Assertion Library](https://www.chaijs.com/)
- [Ethereum Waffle Matchers](https://ethereum-waffle.readthedocs.io/en/latest/matchers.html)
- [Solidity Coverage](https://github.com/sc-forks/solidity-coverage)

---

**Last Updated**: October 2024
**Test Suite Version**: 1.0
**Total Tests**: 55
**Status**: ✅ All Tests Passing
