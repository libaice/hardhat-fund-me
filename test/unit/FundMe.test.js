const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", function () {
          let fundMe
          let mockV3Aggregator
          let deployer

          // use parseUtils to use other decimal converter

          const sendValue = ethers.utils.parseEther("1")

          beforeEach(async () => {
              // const accounts = await ethers.getSigners()
              // deployer = accounts[0]
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              fundMe = await ethers.getContract("FundMe", deployer)
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })

          describe("constructor", async function () {
              it("sets the aggregator addresses correctly", async function () {
                  const response = await fundMe.getPriceFeed()
                  console.log(
                      " mockV3Aggregator.address =  ",
                      mockV3Aggregator.address
                  )
                  console.log(" fundMe.getPriceFeed() is   ", response)
                  assert.equal(response, mockV3Aggregator.address)
              })
          })

          describe("fund ", async function () {
              it("fails if not send enough ETH in msg.value", async function () {
                  // await fundMe.fund()
                  // test revert by waffle test
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!"
                  )
              })

              it("update the amount funded data structure", async function () {
                  await fundMe.fund({ value: sendValue })
                  // use deployer instead of deployer.address
                  const response = await fundMe.getAddressToAmountFunded(
                      deployer
                  )
                  console.log(" response is ", response.toString())
                  assert.equal(response.toString(), sendValue.toString())
              })

              it("add funder to array of funders", async function () {
                  await fundMe.fund({ value: sendValue })
                  const funder = await fundMe.getFunder(0)
                  console.log("funder address is  ", funder)
                  assert.equal(funder, deployer)
              })
          })

          describe("withdraw ", async function () {
              beforeEach(async function () {
                  await fundMe.fund({ value: sendValue })
              })

              it("withdraw ETH for a single founder", async function () {
                  // get contract address balance
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  console.log(
                      " current balance in contract is ",
                      ethers.utils.formatEther(startingFundMeBalance)
                  )
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  console.log(
                      " current deployer balance is ",
                      ethers.utils.formatEther(startingDeployerBalance)
                  )

                  // Act withdraw Balance
                  const txResponse = await fundMe.withdraw()
                  const txReceipt = await txResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = txReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)
                  console.log(txReceipt.toString())

                  // or ethers.provider.getBalance( )
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  console.log(
                      " current balance in contract is ",
                      ethers.utils.formatEther(endingFundMeBalance)
                  )
                  console.log(
                      " current deployer balance is ",
                      ethers.utils.formatEther(endingDeployerBalance)
                  )

                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
              })

              it("withdraw ETH in a cheaperWithdraw function ", async function () {
                  // get contract address balance
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  console.log(
                      " current balance in contract is ",
                      ethers.utils.formatEther(startingFundMeBalance)
                  )
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  console.log(
                      " current deployer balance is ",
                      ethers.utils.formatEther(startingDeployerBalance)
                  )

                  // Act withdraw Balance
                  const txResponse = await fundMe.cheaperWithdraw()
                  const txReceipt = await txResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = txReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)
                  console.log(txReceipt.toString())

                  // or ethers.provider.getBalance( )
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  console.log(
                      " current balance in contract is ",
                      ethers.utils.formatEther(endingFundMeBalance)
                  )
                  console.log(
                      " current deployer balance is ",
                      ethers.utils.formatEther(endingDeployerBalance)
                  )

                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
              })

              it("allow us to withdraw with multiple funders ", async function () {
                  // there need  await  to allow we get Signers from ethers network
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }
                  console.log(" fund ended  =====  ")

                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  console.log(
                      " current contract has funded and now balance is  ",
                      ethers.utils.formatEther(startingFundMeBalance)
                  )

                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  console.log(
                      " current deployer has funded and now balance is  ",
                      ethers.utils.formatEther(startingDeployerBalance)
                  )

                  // Act withdraw Balance
                  const txResponse = await fundMe.withdraw()
                  const txReceipt = await txResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = txReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  // or ethers.provider.getBalance( )
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  console.log(
                      " ending balance in contract is ",
                      ethers.utils.formatEther(endingFundMeBalance)
                  )
                  console.log(
                      " ending deployer balance is ",
                      ethers.utils.formatEther(endingDeployerBalance)
                  )

                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )

                  await expect(fundMe.getFunder(0)).to.be.reverted

                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
                  console.log(" test withdraw successfully ")
              })

              it("allow us to use cheaperWithdraw with multiple funders ", async function () {
                  // there need  await  to allow we get Signers from ethers network
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }
                  console.log(" fund ended  =====  ")

                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  console.log(
                      " current contract has funded and now balance is  ",
                      ethers.utils.formatEther(startingFundMeBalance)
                  )

                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  console.log(
                      " current deployer has funded and now balance is  ",
                      ethers.utils.formatEther(startingDeployerBalance)
                  )

                  // Act withdraw Balance
                  const txResponse = await fundMe.cheaperWithdraw()
                  const txReceipt = await txResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = txReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  // or ethers.provider.getBalance( )
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  console.log(
                      " ending balance in contract is ",
                      ethers.utils.formatEther(endingFundMeBalance)
                  )
                  console.log(
                      " ending deployer balance is ",
                      ethers.utils.formatEther(endingDeployerBalance)
                  )

                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )

                  await expect(fundMe.getFunder(0)).to.be.reverted

                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
                  console.log(" test cheaperWithdraw successfully ")
              })

              it("only allow owner to withdraw", async function () {
                  const accounts = await ethers.getSigners()
                  const attacker = accounts[3]
                  const attackerConnectedContract = await fundMe.connect(
                      attacker
                  )
                  // FundMe__Not FundMe__NotOwne can be test passed
                  await expect(
                      attackerConnectedContract.withdraw()
                  ).to.be.revertedWith("FundMe__Not")
              })
          })
      })
