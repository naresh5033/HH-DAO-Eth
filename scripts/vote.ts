import * as fs from "fs"
import { network, ethers } from "hardhat"
import { proposalsFile, developmentChains, VOTING_PERIOD } from "../helper-hardhat-config"
import { moveBlocks } from "../utils/move-blocks"

const index = 0
//once the proposal is done, then we'll vote on the proposal
//so first we ve to grab the proposals
async function main(proposalIndex: number) {
    const proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"))
    // getting the first proposals from the index(0)
    const proposalId = proposals[network.config.chainId!][proposalIndex]
    // 0 = Against, 1 = For, 2 = Abstain for this example
    const voteWay = 1
    const reason = "I like the number 77"
    await vote(proposalId, voteWay, reason)
}

// 0 = Against, 1 = For, 2 = Abstain for this example
export async function vote(proposalId: string, voteWay: number, reason: string) {
    console.log("Voting...")
    const governor = await ethers.getContract("GovernorContract")
    const voteTx = await governor.castVoteWithReason(proposalId, voteWay, reason) //this governor.sol also has castVoteWithSig() and castVote()
    const voteTxReceipt = await voteTx.wait(1)
    console.log(voteTxReceipt.events[0].args.reason)
    const proposalState = await governor.state(proposalId) //the state() returns proposalState which has diff states(exec, active, pending, suceeded, cancelled ...)
    console.log(`Current Proposal State: ${proposalState}`)
    if (developmentChains.includes(network.name)) {
        await moveBlocks(VOTING_PERIOD + 1)
    }
}
//once the script is deployed we can see the proposal state is 4(idx) --> succeeded, from the proposalState enum(IGovernor.sol)

main(index)
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
