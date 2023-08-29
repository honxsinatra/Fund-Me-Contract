//This deploy script is used when we want to deploy on the local network
const { network } = require("hardhat");
const {
  developmentChains,
  decimals,
  initialAnswer,
} = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  if (developmentChains.includes(network.name)) {
    log("Local network detected! Deploying Mocks...");
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      args: [decimals, initialAnswer],
    });
    log("Mocks deployed!");
    log("________________________________________________");
  }
};

module.exports.tags = ["All", "Mocks"];
