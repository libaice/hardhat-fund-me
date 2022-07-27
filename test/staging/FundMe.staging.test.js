const { assert, expect } = require("chai")
const { network, deployments, ethers, getNamedAccounts } = require("hardhat")

const { developmentChains } = require("../../helper-hardhat-config")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe
          let deployer

          const sendValue = ethers.utils.parseEther("0.5")
          beforeEach(async function () {
              //  no fixture and no mockPriceAggregator
              deployer = (await getNamedAccounts()).deployer
              fundMe = await ethers.getContract("FundMe", deployer)
          })

          it("allow people to fund and withdraw ", async function () {
              await fundMe.fund({ value: sendValue })
              await fundMe.withdraw({ gasLimit: 1000000 })

              const endingBalance = await fundMe.provider.getBalance(
                  fundMe.address
              )

              assert.equal(endingBalance.toString(), "0")
          })
      })
