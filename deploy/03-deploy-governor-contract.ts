import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import verify from "../helper-functions"
import {
    networkConfig,
    developmentChains,
    QUORUM_PERCENTAGE,
    VOTING_PERIOD,
    VOTING_DELAY,
} from "../helper-hardhat-config"

const deployGovernorContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    // @ts-ignore
    const { getNamedAccounts, deployments, network } = hre
    const { deploy, log, get } = deployments // this get fns from the hh-deploutment packge
    const { deployer } = await getNamedAccounts()
    const governanceToken = await get("GovernanceToken") //thi get() will get the deployed contract
    const timeLock = await get("TimeLock")

    log("----------------------------------------------------")
    log("Deploying GovernorContract and waiting for confirmations...")
    const governorContract = await deploy("GovernorContract", {
        from: deployer,
        args: [
            governanceToken.address,
            timeLock.address,
            QUORUM_PERCENTAGE,
            VOTING_PERIOD,
            VOTING_DELAY,
        ],
        log: true,
        // we need to wait if on a live network so we can verify properly
        waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
    })
    log(`GovernorContract at ${governorContract.address}`)
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(governorContract.address, [])
    }
}
// Note: since the contract is getting from the depoyment(get()), instead of abi, so makesure to run all the 3 deploys in order to get the 01 and 02(contracts) while deploying, can't run the 03 alone.
export default deployGovernorContract
deployGovernorContract.tags = ["all", "governor"]
