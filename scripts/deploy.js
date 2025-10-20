const hre = require("hardhat");

async function main() {
    console.log("🚀 开始部署匿名举报系统合约...");

    // Get the contract factory
    const AnonymousReporting = await hre.ethers.getContractFactory("AnonymousReporting");

    // Deploy the contract
    console.log("📝 部署合约中...");
    const anonymousReporting = await AnonymousReporting.deploy();

    // Wait for deployment
    await anonymousReporting.deployed();

    console.log("✅ 匿名举报系统合约部署成功!");
    console.log("📍 合约地址:", anonymousReporting.address);
    console.log("🔗 网络:", hre.network.name);

    // Get deployment transaction
    const deployTx = anonymousReporting.deployTransaction;
    console.log("🧾 部署交易哈希:", deployTx.hash);
    console.log("⛽ Gas 使用量:", deployTx.gasLimit?.toString());

    // Save contract address to file for frontend use
    const fs = require('fs');
    const path = require('path');

    const contractInfo = {
        address: anonymousReporting.address,
        network: hre.network.name,
        deploymentTime: new Date().toISOString(),
        txHash: deployTx.hash
    };

    const contractInfoPath = path.join(__dirname, '../public/contract-info.json');
    fs.writeFileSync(contractInfoPath, JSON.stringify(contractInfo, null, 2));

    console.log("💾 合约信息已保存至 public/contract-info.json");

    // Verify contract on Etherscan (if on mainnet or testnet)
    if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
        console.log("⏳ 等待区块确认以进行验证...");
        await anonymousReporting.deployTransaction.wait(6);

        try {
            await hre.run("verify:verify", {
                address: anonymousReporting.address,
                constructorArguments: [],
            });
            console.log("✅ 合约已在 Etherscan 上验证");
        } catch (error) {
            console.log("❌ 合约验证失败:", error.message);
        }
    }

    console.log("\n📋 部署摘要:");
    console.log("===============================");
    console.log(`合约名称: AnonymousReporting`);
    console.log(`合约地址: ${anonymousReporting.address}`);
    console.log(`网络: ${hre.network.name}`);
    console.log(`部署者: ${await (await hre.ethers.getSigners())[0].getAddress()}`);
    console.log("===============================");
    console.log("\n🔧 后续步骤:");
    console.log("1. 更新 public/app.js 中的 CONTRACT_ADDRESS");
    console.log("2. 运行 npm run dev 启动前端");
    console.log("3. 添加调查员地址 (使用 addInvestigator 函数)");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ 部署失败:", error);
        process.exit(1);
    });