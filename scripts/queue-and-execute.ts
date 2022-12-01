import { ethers, network } from "hardhat"
import {
    FUNC,
    NEW_STORE_VALUE,
    PROPOSAL_DESCRIPTION,
    MIN_DELAY,
    developmentChains,
} from "../helper-hardhat-config"
import { moveBlocks } from "../utils/move-blocks"
import { moveTime } from "../utils/move-time"

//once the voting is passed then we can finally queue and exec the proposal
export async function queueAndExecute() {
    const args = [NEW_STORE_VALUE]
    const functionToCall = FUNC
    const box = await ethers.getContract("Box")
    const encodedFunctionCall = box.interface.encodeFunctionData(functionToCall, args)
    const descriptionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(PROPOSAL_DESCRIPTION))//the prop desc hash bytes
    // could also use ethers.utils.id(PROPOSAL_DESCRIPTION)

    const governor = await ethers.getContract("GovernorContract")
    console.log("Queueing...")
    const queueTx = await governor.queue([box.address], [0], [encodedFunctionCall], descriptionHash)//the queue(has exact same params as proposals()) from the iGovernorTimeLock.sol w
    await queueTx.wait(1)
    //since we ve mindelay so lets skip that for dev chain
    if (developmentChains.includes(network.name)) {
        await moveTime(MIN_DELAY + 1)
        await moveBlocks(1)
    }

    console.log("Executing...")
    // this will fail on a testnet because you need to wait for the MIN_DELAY!
    const executeTx = await governor.execute(
        [box.address],
        [0],
        [encodedFunctionCall],
        descriptionHash
    )
    await executeTx.wait(1)
    const boxNewValue = await box.retrieve()
    console.log(boxNewValue.toString())
}
//once we exec this script, the new block blck val is 77(at the end of the proposal execution)
queueAndExecute()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
