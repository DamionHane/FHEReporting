# CI/CD Documentation

## Continuous Integration and Continuous Deployment Setup

This document describes the CI/CD pipeline configuration for the Anonymous Reporting System.

---

## Overview

The project uses **GitHub Actions** for automated testing, code quality checks, and coverage reporting. All workflows are triggered automatically on push and pull request events.

### Workflow Summary

| Workflow | Purpose | Triggers | Node Versions |
|----------|---------|----------|---------------|
| **Tests** | Run test suite | Push to main/develop, PRs | 18.x, 20.x |
| **Coverage** | Generate coverage reports | Push to main, PRs to main | 20.x |
| **Code Quality** | Lint and format checks | Push to main/develop, PRs | 20.x |

---

## GitHub Actions Workflows

### 1. Test Workflow (`.github/workflows/test.yml`)

**Purpose**: Runs the complete test suite across multiple Node.js versions

**Triggers**:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Matrix Testing**:
- Node.js 18.x
- Node.js 20.x

**Steps**:
1. Checkout code
2. Setup Node.js (matrix version)
3. Install dependencies (`npm ci`)
4. Run Solhint (Solidity linting)
5. Run Prettier check (code formatting)
6. Compile contracts
7. Run tests
8. Generate coverage report
9. Upload coverage to Codecov

**Status Badge**:
```markdown
![Tests](https://github.com/YOUR_USERNAME/anonymous-reporting-system/workflows/Tests/badge.svg)
```

---

### 2. Coverage Workflow (`.github/workflows/coverage.yml`)

**Purpose**: Generates and uploads code coverage reports

**Triggers**:
- Push to `main` branch
- Pull requests to `main` branch

**Steps**:
1. Checkout code
2. Setup Node.js 20.x
3. Install dependencies
4. Compile contracts
5. Run coverage analysis
6. Upload to Codecov (with fail on error)
7. Archive coverage artifacts (30-day retention)

**Status Badge**:
```markdown
![Coverage](https://github.com/YOUR_USERNAME/anonymous-reporting-system/workflows/Coverage/badge.svg)
```

**Codecov Badge**:
```markdown
[![codecov](https://codecov.io/gh/YOUR_USERNAME/anonymous-reporting-system/branch/main/graph/badge.svg)](https://codecov.io/gh/YOUR_USERNAME/anonymous-reporting-system)
```

---

### 3. Code Quality Workflow (`.github/workflows/lint.yml`)

**Purpose**: Ensures code quality through linting and formatting checks

**Triggers**:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Steps**:
1. Checkout code
2. Setup Node.js 20.x
3. Install dependencies
4. Run Solhint (fail on errors)
5. Run Prettier check (fail on errors)
6. Check for compilation errors

**Status Badge**:
```markdown
![Code Quality](https://github.com/YOUR_USERNAME/anonymous-reporting-system/workflows/Code%20Quality/badge.svg)
```

---

## Configuration Files

### Solhint Configuration (`.solhint.json`)

Solidity linting rules based on recommended standards:

```json
{
  "extends": "solhint:recommended",
  "rules": {
    "compiler-version": ["error", "^0.8.0"],
    "func-visibility": ["warn", { "ignoreConstructors": true }],
    "max-line-length": ["warn", 120],
    "reason-string": ["warn", { "maxLength": 64 }],
    ...
  }
}
```

**Key Rules**:
- Compiler version must be ^0.8.0
- Maximum line length: 120 characters
- Error messages max length: 64 characters
- State visibility required
- Reentrancy warnings enabled

**Run Locally**:
```bash
npm run lint          # Check for issues
npm run lint:fix      # Auto-fix where possible
```

---

### Prettier Configuration (`.prettierrc.json`)

Code formatting rules for Solidity and JavaScript:

```json
{
  "overrides": [
    {
      "files": "*.sol",
      "options": {
        "printWidth": 120,
        "tabWidth": 4,
        "useTabs": false
      }
    },
    {
      "files": "*.js",
      "options": {
        "printWidth": 120,
        "tabWidth": 4,
        "singleQuote": false
      }
    }
  ]
}
```

**Run Locally**:
```bash
npm run format        # Format all files
npm run format:check  # Check formatting without changes
```

---

### Codecov Configuration (`codecov.yml`)

Coverage reporting configuration:

```yaml
coverage:
  precision: 2
  round: down
  range: "70...100"

  status:
    project:
      default:
        target: 80%      # Minimum 80% coverage required
        threshold: 5%    # Allow 5% decrease
```

**Coverage Targets**:
- **Project**: 80% minimum coverage
- **Patch**: 70% minimum for new code
- **Threshold**: 5% allowed decrease

**Ignored Paths**:
- `test/**/*`
- `scripts/**/*`
- `node_modules/**/*`

---

## Running CI/CD Locally

### Complete CI Pipeline

```bash
# Run the full CI pipeline locally
npm run ci
```

This command runs:
1. Solhint (linting)
2. Prettier check (formatting)
3. Contract compilation
4. Test suite

### Individual Checks

```bash
# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format:check
npm run format

# Compilation
npm run compile

# Testing
npm test
npm run test:coverage

# Clean build
npm run clean
```

---

## Setting Up CI/CD

### GitHub Repository Setup

1. **Create GitHub Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit with CI/CD"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/anonymous-reporting-system.git
   git push -u origin main
   ```

2. **Enable GitHub Actions**
   - Go to repository Settings → Actions → General
   - Enable "Allow all actions and reusable workflows"

3. **Set Up Codecov** (Optional but recommended)
   - Visit https://codecov.io
   - Sign in with GitHub
   - Add your repository
   - Copy the `CODECOV_TOKEN`
   - Add to repository secrets:
     - Settings → Secrets and variables → Actions
     - New repository secret: `CODECOV_TOKEN`

---

## Workflow Permissions

All workflows use minimal permissions:

```yaml
permissions:
  contents: read
```

This follows security best practices by limiting workflow permissions.

---

## Workflow Triggers

### Push Events

```yaml
on:
  push:
    branches:
      - main
      - develop
```

Triggers on pushes to main or develop branches.

### Pull Request Events

```yaml
on:
  pull_request:
    branches:
      - main
      - develop
```

Triggers on PRs targeting main or develop branches.

---

## CI/CD Best Practices

### 1. Dependency Caching

All workflows use npm caching for faster builds:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: ${{ matrix.node-version }}
    cache: 'npm'
```

### 2. Clean Install

Use `npm ci` instead of `npm install`:

```yaml
- run: npm ci
```

**Benefits**:
- Faster installation
- Reproducible builds
- Installs exact versions from package-lock.json

### 3. Matrix Testing

Test across multiple Node.js versions:

```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x]
```

### 4. Fail Fast

Quality checks fail the build immediately:

```yaml
- run: npm run lint
  continue-on-error: false
```

### 5. Artifact Retention

Coverage reports archived for 30 days:

```yaml
- uses: actions/upload-artifact@v4
  with:
    retention-days: 30
```

---

## Troubleshooting CI/CD

### Common Issues

**Issue**: Workflow fails on `npm ci`
- **Solution**: Ensure `package-lock.json` is committed
- **Command**: `git add package-lock.json && git commit`

**Issue**: Tests pass locally but fail in CI
- **Solution**: Check Node.js version compatibility
- **Command**: `nvm use 20` (match CI version)

**Issue**: Codecov upload fails
- **Solution**: Verify `CODECOV_TOKEN` is set correctly
- **Check**: Repository Settings → Secrets

**Issue**: Prettier check fails
- **Solution**: Run `npm run format` locally before pushing
- **Command**: `npm run format && git add . && git commit --amend`

**Issue**: Solhint errors
- **Solution**: Fix linting issues or update `.solhint.json`
- **Command**: `npm run lint:fix`

---

## Monitoring CI/CD

### GitHub Actions Tab

View workflow runs:
1. Go to repository → Actions tab
2. See all workflow runs and their status
3. Click on a run to see detailed logs

### Badges

Add status badges to README.md:

```markdown
![Tests](https://github.com/YOUR_USERNAME/anonymous-reporting-system/workflows/Tests/badge.svg)
![Coverage](https://github.com/YOUR_USERNAME/anonymous-reporting-system/workflows/Coverage/badge.svg)
![Code Quality](https://github.com/YOUR_USERNAME/anonymous-reporting-system/workflows/Code%20Quality/badge.svg)
[![codecov](https://codecov.io/gh/YOUR_USERNAME/anonymous-reporting-system/branch/main/graph/badge.svg)](https://codecov.io/gh/YOUR_USERNAME/anonymous-reporting-system)
```

### Coverage Reports

View detailed coverage:
1. Visit https://codecov.io/gh/YOUR_USERNAME/anonymous-reporting-system
2. See line-by-line coverage
3. View coverage trends over time
4. Download coverage artifacts from GitHub Actions

---

## CI/CD Maintenance

### Updating Workflows

1. Edit workflow files in `.github/workflows/`
2. Test changes on a feature branch
3. Create PR to main
4. Verify workflows pass
5. Merge when green

### Updating Dependencies

```bash
# Update all dependencies
npm update

# Update specific package
npm update hardhat

# Verify after update
npm run ci
```

### Security Updates

GitHub Dependabot automatically creates PRs for security updates:
1. Review the PR
2. Run `npm run ci` locally
3. Merge if tests pass

---

## Performance Optimization

### Workflow Speed

Average workflow times:
- **Tests**: ~2-3 minutes
- **Coverage**: ~2-3 minutes
- **Code Quality**: ~1-2 minutes

### Optimization Tips

1. **Use caching**: npm cache enabled
2. **Parallel jobs**: Multiple Node versions run in parallel
3. **Skip unnecessary steps**: Use `continue-on-error` wisely
4. **Optimize tests**: Keep test suite lean

---

## Summary

### CI/CD Pipeline Features

✅ **Automated Testing**
- Runs on every push and PR
- Tests on Node.js 18.x and 20.x
- 55 comprehensive test cases

✅ **Code Quality**
- Solhint for Solidity linting
- Prettier for code formatting
- Automated checks on every commit

✅ **Coverage Reporting**
- Integrated with Codecov
- 80% minimum coverage target
- Detailed coverage reports

✅ **Security**
- Minimal permissions
- Dependency scanning
- Automated updates

---

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Codecov Documentation](https://docs.codecov.io/)
- [Solhint Rules](https://github.com/protofire/solhint/blob/master/docs/rules.md)
- [Prettier Options](https://prettier.io/docs/en/options.html)

---

**Last Updated**: October 2024
**CI/CD Status**: ✅ Fully Configured and Operational
