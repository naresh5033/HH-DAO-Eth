// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract GovernanceToken is ERC20Votes {
    uint256 public s_maxSupply = 1000000000000000000000000; //1 mill supply

    constructor() ERC20("GovernanceToken", "GT") ERC20Permit("GovernanceToken") {
        _mint(msg.sender, s_maxSupply);
    }
    //someone knows that the hot proposal is coming up, so they'll buy ton of tkns and then they dump it after, and we wanna avoid this.
    //we can avoid this by snapsnot, a snapshot of tkns people ve at certain blocks/checkpoints.
    //this fn, anytime we transfer the tkn, we wana makesure that we call this fn (from erc20votes), this is how the snapshot are updated
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20Votes) {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount) internal override(ERC20Votes) {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount) internal override(ERC20Votes) {
        super._burn(account, amount);
    }
}
