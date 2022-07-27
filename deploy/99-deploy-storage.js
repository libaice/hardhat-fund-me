const {getNamedAccounts, deployments, network, ethers} = require("hardhat")
const {networkConfig, developmentChains} = require("../helper-hardhat-config")


module.exports = async ({getNamedAccounts, deployments}) => {
    const {deploy, log} = deployments

    // Must add  {} to get Named Accounts
    // const deployer = await getNamedAccounts()
    const {deployer} = await getNamedAccounts()

    console.log("-------------------------------------")
    console.log(" deploy contract and with for confirmations ")

    const funWithStorage = await deploy("FunWithStorage", {
        from: deployer,
        args: [],
        log: true,
        // we need to wait if on a live network so we can verify properly
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    console.log(" Logging Storage ....  ")
    for (let i = 0; i < 10; i++) {
        log(
            `Location ${i}: ${await ethers.provider.getStorageAt(funWithStorage.address, i)}`)
    }


}

module.exports.tags = ["storage"]