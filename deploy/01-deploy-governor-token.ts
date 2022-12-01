import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import verify from "../helper-functions"
import { networkConfig, developmentChains } from "../helper-hardhat-config"
import { ethers } from "hardhat"

const deployGovernanceToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    // @ts-ignore
    const { getNamedAccounts, deployments, network } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    log("----------------------------------------------------")
    log("Deploying GovernanceToken and waiting for confirmations...")
    const governanceToken = await deploy("GovernanceToken", {
        from: deployer,
        args: [],
        log: true,
        // we need to wait if on a live network so we can verify properly
        waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
    })
    log(`GovernanceToken at ${governanceToken.address}`)
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(governanceToken.address, [])
    }
    log(`Delegating to ${deployer}`)
    await delegate(governanceToken.address, deployer)
    log("Delegated!")
}
//RN nobody has the voting power, since the token isn't delegated to anyone yet
//we wanna make a fn to delegate the tkns / we wana delegate this tokens to our deployer
const delegate = async (governanceTokenAddress: string, delegatedAccount: string) => {
    const governanceToken = await ethers.getContractAt("GovernanceToken", governanceTokenAddress)
    const transactionResponse = await governanceToken.delegate(delegatedAccount) //here we're transfering the tkns to the delegateAcc
    await transactionResponse.wait(1)
    //when we deploy the checkpt should be 1, if its 0 then we ve'nt delegated correctly
    console.log(`Checkpoints: ${await governanceToken.numCheckpoints(delegatedAccount)}`) // this numCheckpoints() from erc20votes.sol --> is check to see how many checkpts that acc has, so anytim we transfer a token or delegate a tkn basically calls _moveVotingPower() at backend, which checks for the checkpoints.
}

export default deployGovernanceToken
deployGovernanceToken.tags = ["all", "governor"]
