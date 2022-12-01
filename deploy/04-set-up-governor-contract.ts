import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import verify from "../helper-functions"
import { networkConfig, developmentChains, ADDRESS_ZERO } from "../helper-hardhat-config"
import { ethers } from "hardhat"

const setupContracts: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    // @ts-ignore
    const { getNamedAccounts, deployments, network } = hre
    const { log } = deployments
    const { deployer } = await getNamedAccounts()
    const governanceToken = await ethers.getContract("GovernanceToken", deployer)
    const timeLock = await ethers.getContract("TimeLock", deployer)
    const governor = await ethers.getContract("GovernorContract", deployer)

    log("----------------------------------------------------")
    log("Setting up contracts for roles...")
    // would be great to use multicall here...
    //here we're setting up role, so only the governor can send things to timeLock
    //in openzeppelin's AccessControl.sol --> we can see it the diff roles(all 3) takes the bytes of hash
    //Ex -> bytes public constant PROPOSAL_ROLE = keccack256("PROPOSAL_ROLE"); lly for all other 2 roles
    const proposerRole = await timeLock.PROPOSER_ROLE()
    const executorRole = await timeLock.EXECUTOR_ROLE()
    const adminRole = await timeLock.TIMELOCK_ADMIN_ROLE() //RN deployer is the timeLock admin
    //But we don't want anyone to be admin of our timeLock,

    //so les assign/grant the roles,
    const proposerTx = await timeLock.grantRole(proposerRole, governor.address) //now the governor contract is the proposer
    await proposerTx.wait(1)
    const executorTx = await timeLock.grantRole(executorRole, ADDRESS_ZERO) // the address 0x000 is the executor/ the executor is nobody --> means anybody, once the proposal is gone thru anyone can exc
    await executorTx.wait(1)
    const revokeTx = await timeLock.revokeRole(adminRole, deployer) // revoke the deployer's admin role from the timeLock
    await revokeTx.wait(1)
    // Guess what? Now, anything the timelock wants to do has to go through the governance process!
}   //so after this deploy its impossible to anyone to do anything with timeLock w/o governance happening

export default setupContracts
setupContracts.tags = ["all", "setup"]
