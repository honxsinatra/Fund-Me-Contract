const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async function () {
      let FundMe;
      let deployer;
      let MockV3Aggregator;
      //const sendValue = "1000000000000000000";
      const sendValue = ethers.parseEther("1");

      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        const contracts = await deployments.fixture("All");
        const signer = await ethers.getSigner(deployer);
        const fundMeAddress = contracts["FundMe"].address;
        FundMe = await ethers.getContractAt("FundMe", fundMeAddress, signer);
        MockV3Aggregator = contracts["MockV3Aggregator"];
      });

      describe("constructor", async function () {
        it("should sets the aggegrator address to the price feed", async function () {
          const response = await FundMe.priceFeed();
          assert.equal(response, MockV3Aggregator.address);

          //expect(response).to.equal(MockV3Aggregator.address);
        });
      });

      describe("Fund", async function () {
        it("Should revert with error", async function () {
          await expect(FundMe.fund()).to.be.revertedWith(
            "You need to spend more ETH!"
          );
        });
        it("Should update the amount funded by the sender", async function () {
          await FundMe.fund({ value: sendValue });
          const response = await FundMe.addressToAmountFunded(deployer);
          //expect(response.toString()).to.equal(sendValue.toString());
          assert.equal(response.toString(), sendValue.toString());
        });
        it("Should add deployer to the funders array with index number 0", async function () {
          await FundMe.fund({ value: sendValue });
          const response = await FundMe.funders(0);
          expect(response).to.equal(deployer);
        });
      });

      describe("withdraw", async function () {
        beforeEach(async function () {
          await FundMe.fund({ value: sendValue });
        });
        it("Should withdraw ETH from a single funder", async function () {
          const InitialFundMeBalance = await ethers.provider.getBalance(FundMe);
          const InitialDeployerBalance = await ethers.provider.getBalance(
            deployer
          );

          const transactionResponse = await FundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);

          const { gasUsed, gasPrice } = transactionReceipt;
          const gasCost = gasUsed * gasPrice;

          const finalDeployerBalance = await ethers.provider.getBalance(
            deployer
          );
          const finalFundMeBalance = await ethers.provider.getBalance(FundMe);

          expect(finalFundMeBalance).to.equal(0);
          expect(
            (InitialFundMeBalance + InitialDeployerBalance).toString()
          ).to.equal((finalDeployerBalance + gasCost).toString());
        });
        it("Should withdraw ETH from multiple funders", async function () {
          const accounts = await ethers.getSigners();

          for (let i = 1; i < 6; i++) {
            const FundMeConnectedContract = await FundMe.connect(accounts[i]);
            await FundMeConnectedContract.fund({ value: sendValue });
          }

          const InitialFundMeBalance = await ethers.provider.getBalance(FundMe);
          const InitialDeployerBalance = await ethers.provider.getBalance(
            deployer
          );
          const transactionResponse = await FundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);

          const { gasUsed, gasPrice } = transactionReceipt;
          const gasCost = gasUsed * gasPrice;

          const finalDeployerBalance = await ethers.provider.getBalance(
            deployer
          );
          const finalFundMeBalance = await ethers.provider.getBalance(FundMe);

          expect(finalFundMeBalance).to.equal(0);
          expect(
            (InitialFundMeBalance + InitialDeployerBalance).toString()
          ).to.equal((finalDeployerBalance + gasCost).toString());

          //To make sure that account with index 0 is not a funder but a deployer
          expect(await FundMe.funders[0]).to.be.reverted;

          //Making sure that funders remain with 0 amount funded
          for (i = 1; i < 6; i++) {
            expect(await FundMe.addressToAmountFunded(accounts[i])).to.equal(0);
          }
        });
        it("Should allow only owner to withdraw", async function () {
          const accounts = await ethers.getSigners();
          const hacker = accounts[1];
          const hackerConnectedContract = await FundMe.connect(hacker);
          await expect(hackerConnectedContract.withdraw()).to.be.reverted;
        });
      });
    });
