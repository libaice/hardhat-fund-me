const { getNamedAccounts, ethers } = require("hardhat")

async function main() {
    const { deployer } = await getNamedAccounts()
    const fundMe = await ethers.getContract("FundMe", deployer)
    console.log("withdraw from contract .... ")

    const txResponse = await fundMe.withdraw({ gasLimit: 1000000 })
    await txResponse.wait(1)

    console.log("Withdrawed successfully  !!  ")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
