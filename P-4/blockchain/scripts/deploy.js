const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const networkName = hre.network.name;

  console.log(`Deploying AapdaSetu on ${networkName}`);
  console.log(`Deployer: ${deployer.address}`);

  const AapdaSetu = await hre.ethers.getContractFactory("AapdaSetu");
  const aapdaSetu = await AapdaSetu.deploy();
  await aapdaSetu.waitForDeployment();

  const contractAddress = await aapdaSetu.getAddress();
  const deployment = {
    network: networkName,
    chainId: hre.network.config.chainId || 31337,
    contractName: "AapdaSetu",
    contractAddress,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  fs.mkdirSync(deploymentsDir, { recursive: true });
  fs.writeFileSync(
    path.join(deploymentsDir, `${networkName}.json`),
    `${JSON.stringify(deployment, null, 2)}\n`
  );

  console.log(`AapdaSetu deployed to ${contractAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
