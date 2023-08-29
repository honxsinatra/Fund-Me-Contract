const { getNamedAccounts, ethers } = require("hardhat");

async function main() {
  const deployer = (await getNamedAccounts()).deployer;
  const sendValue = ethers.parseEther("0.5");
  const FundMe = await ethers.getContractAt("FundMe", deployer);
  console.log("Funding...");

  const transactionResponse = await FundMe.fund({ value: sendValue });
  await transactionResponse.wait(1);
  console.log("Funded!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
