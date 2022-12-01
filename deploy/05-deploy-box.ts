import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import verify from "../helper-functions"
import { networkConfig, developmentChains } from "../helper-hardhat-config"
import { ethers } from "hardhat"

//Lastly this is the contract we wana govern over
const deployBox: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    // @ts-ignore
    const { getNamedAccounts, deployments, network } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    log("----------------------------------------------------")
    log("Deploying Box and waiting for confirmations...")
    const box = await deploy("Box", {
        from: deployer, // RN the deployer is deploying this, so we wana give this box's ownership to our governance process
        args: [],
        log: true,
        // we need to wait if on a live network so we can verify properly
        waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
    })
    log(`Box at ${box.address}`)
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(box.address, [])
    }
    //here we'll transfer the ownership of our box.sol from deployer to the timeLock
    const boxContract = await ethers.getContractAt("Box", box.address)
    const timeLock = await ethers.getContract("TimeLock")
    const transferTx = await boxContract.transferOwnership(timeLock.address) //ownership transfered
    await transferTx.wait(1)
    console.log(
        `the owner ship of the box has been transfer from ${deployer} to the Timelock -  ${timeLock.address}`
    )
}

export default deployBox
deployBox.tags = ["all", "box"]
