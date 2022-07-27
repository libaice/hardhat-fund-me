const { getNamedAccounts, ethers } = require("hardhat")

async function main() {
    const { deployer } = await getNamedAccounts()
    const fundMe = await ethers.getContract("FundMe", deployer)
    console.log("deploying contract .... ")

    const txResponse = await fundMe.fund({
        value: ethers.utils.parseEther("1"),
    })

    await txResponse.wait(1)

    console.log("funded !!  ")
    const balanceInContract = await fundMe.provider.getBalance(fundMe.address)

    console.log(
        "current of balance of fundMe contract is  ",
        balanceInContract.toString()
    )
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
