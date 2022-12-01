// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/governance/TimelockController.sol";

//this timelock is actually the owner of the box contract, (the timelock and the govenance are sorta one in the same)
//we wanna wait for a new vote to be "executed". Everyone who hold the governance token has to pay 5 tkns
//it gives time for the users to "get out" if they don't like the governance update
contract TimeLock is TimelockController {
    // minDelay is how long you have to wait before executing
    // proposers is the list of addresses that can propose
    // executors is the list of addresses that can execute
    constructor(
        uint256 minDelay,
        address[] memory proposers,
        address[] memory executors,
        address admin
    ) TimelockController(minDelay, proposers, executors, admin) {}
}
//this timelock has everything that actually needs to flow thru in order for the governance to happen.
