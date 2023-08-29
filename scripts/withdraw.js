const { getNamedAccounts, ethers } = require("hardhat");

async function main() {
  const deployer = (await getNamedAccounts()).deployer;
  const FundMe = await ethers.getContractAt("FundMe", deployer);
  console.log("Withdrawing...");

  const transactionResponse = await FundMe.withdraw();
  await transactionResponse.wait(1);
  console.log("Withdrawn successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
