const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying TutorReputation contract...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy the contract
  const TutorReputation = await ethers.getContractFactory("TutorReputation");
  const tutorReputation = await TutorReputation.deploy();

  await tutorReputation.waitForDeployment();
  const address = await tutorReputation.getAddress();

  console.log("TutorReputation deployed to:", address);
  console.log("Contract owner:", await tutorReputation.owner());

  // Verify deployment
  console.log("\nVerifying deployment...");
  const nextTokenId = await tutorReputation.nextTokenId();
  console.log("Next token ID:", nextTokenId.toString());

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    contractAddress: address,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  console.log("\nDeployment info:", JSON.stringify(deploymentInfo, null, 2));

  return address;
}

main()
  .then((address) => {
    console.log("\n✅ Deployment successful!");
    console.log("Contract address:", address);
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });

