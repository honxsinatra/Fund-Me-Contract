# Contract for pooled funding

This project demonstrates a demo sample funding contract. It comes with a contract, a test for that contract, and a script that deploys that contract.

The contract can be funded in USD, conversion of value of funders want to fund will be converted using chainlink price feeds as inherited from chainlink contracts including PriceConverter contract.

The contract has mainly 2 functions fund and withdraw function (Only owner of the contract can withdraw). It also allows the funders to check on the current price of their value such as ETH by calling PriceFeed function that will require the funders to input their price feed address from the chainlink organisation.

# Fund-Me-Contract
