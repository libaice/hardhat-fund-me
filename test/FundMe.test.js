const {assert, expect} = require("chai")
const {network, deployments, ethers} = require("hardhat")


describe("FundMe", function () {
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
            console.log(" mockV3Aggregator.address =  ", mockV3Aggregator.address)
            console.log(" fundMe.getPriceFeed() is   ", response)
            assert.equal(response, mockV3Aggregator.address)
        })
    })

    describe("fund ", async function () {
        it('fails if not send enough ETH in msg.value', async function () {
            // await fundMe.fund()
            // test revert by waffle test
            await expect(fundMe.fund()).to.be.revertedWith("You need to spend more ETH!");
        });

        it('update the amount funded data structure', async function () {
            await fundMe.fund({value: sendValue})
            // use deployer instead of deployer.address
            const response = await fundMe.getAddressToAmountFunded(deployer)
            console.log(" response is ", response.toString())
            assert.equal(response.toString(), sendValue.toString())
        });

        it('add funder to array of funders', async function () {
            await fundMe.fund({value: sendValue})
            const funder = await fundMe.getFunder(0)
            console.log("funder address is  ", funder)
            assert.equal(funder, deployer)
        });
    })


    describe("withdraw ", async function () {
        beforeEach(async function () {
            await fundMe.fund({value: sendValue})
        })

        it('withdraw ETH for a single founder', async function () {
            // get contract address balance
            const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            console.log(" current balance in contract is ", ethers.utils.formatEther(startingFundMeBalance))
            const startingDeployerBalance = await fundMe.provider.getBalance(deployer)
            console.log(" current deployer balance is ", ethers.utils.formatEther(startingDeployerBalance))

            // Act withdraw Balance
            const txResponse = await fundMe.withdraw()
            const txReceipt = await txResponse.wait(1)
            const {gasUsed, effectiveGasPrice} = txReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)
            console.log(txReceipt.toString())

            // or ethers.provider.getBalance( )
            const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const endingDeployerBalance = await fundMe.provider.getBalance(deployer)
            console.log(" current balance in contract is ", ethers.utils.formatEther(endingFundMeBalance))
            console.log(" current deployer balance is ", ethers.utils.formatEther(endingDeployerBalance))


            assert.equal(endingFundMeBalance, 0)
            assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString())
        });

    })

})
