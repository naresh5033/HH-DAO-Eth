import { ethers, network } from "hardhat"
import {
    developmentChains,
    VOTING_DELAY,
    proposalsFile,
    FUNC, //store(Box.sol)
    PROPOSAL_DESCRIPTION,
    NEW_STORE_VALUE, //77
} from "../helper-hardhat-config"
import * as fs from "fs"
import { moveBlocks } from "../utils/move-blocks"

//here we can propose our box contract to hold the val 77 (previous 1)

//refer the fn proposal(target, vals, calldata, desc) from governor.sol(openzep)
export async function propose(args: any[], functionToCall: string, proposalDescription: string) {
    const governor = await ethers.getContract("GovernorContract")
    const box = await ethers.getContract("Box")
    //we wana encode all the fn params from box
    const encodedFunctionCall = box.interface.encodeFunctionData(functionToCall, args) //we encode into bytes
    console.log(`Proposing ${functionToCall} on ${box.address} with ${args}`)
    console.log(`Proposal Description:\n  ${proposalDescription}`)
    const proposeTx = await governor.propose(
        [box.address], //target(addr)
        [0], //val
        [encodedFunctionCall], //calldata
        proposalDescription //desc
    )
    //since we've voting delay but for dev chain we can move blocks
    // If working on a development chain, we will push forward till we get to the voting period.
    if (developmentChains.includes(network.name)) {
        await moveBlocks(VOTING_DELAY + 1)
    }
    const proposeReceipt = await proposeTx.wait(1) //the proposalCreated event(governor.sol/openzep) has the proposalId param
    const proposalId = proposeReceipt.events[0].args.proposalId // this is how we get the proposalId.
    console.log(`Proposed with proposal ID:\n  ${proposalId}`)

    const proposalState = await governor.state(proposalId)
    const proposalSnapShot = await governor.proposalSnapshot(proposalId)
    const proposalDeadline = await governor.proposalDeadline(proposalId)
    // save the proposalId
    let proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8")) // the first time we read its a blank json
    proposals[network.config.chainId!.toString()].push(proposalId.toString()) // we write proposal id to proposals.json
    fs.writeFileSync(proposalsFile, JSON.stringify(proposals))

    // The state of the proposal. 1 is not passed. 0 is passed.
    console.log(`Current Proposal State: ${proposalState}`)
    // What block # the proposal was snapshot
    console.log(`Current Proposal Snapshot: ${proposalSnapShot}`)
    // The block number the proposal voting expires
    console.log(`Current Proposal Deadline: ${proposalDeadline}`)
}
//here proposing the new store val (77) and the FUNC we're calling is store from the box
propose([NEW_STORE_VALUE], FUNC, PROPOSAL_DESCRIPTION)
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
