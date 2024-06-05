// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ERC20Multisender is Ownable {
    constructor(address initialOwner) Ownable(initialOwner) {
        // The ownership is transferred to initialOwner by the Ownable constructor
    }

    function multisendToken(address token, address[] calldata recipients, uint256 amount) external onlyOwner {
        IERC20 erc20 = IERC20(token);
        for (uint256 i = 0; i < recipients.length; i++) {
            require(erc20.transferFrom(msg.sender, recipients[i], amount), "Transfer failed");
        }
    }
}
