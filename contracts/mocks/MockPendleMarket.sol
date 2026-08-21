// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IPendleMarket.sol";

contract MockPendleMarket is IPendleMarket {
    address public sy;
    address public pt;
    address public yt;
    uint256 public marketExpiry;

    constructor(address _sy, address _pt, address _yt, uint256 _expiry) {
        sy = _sy;
        pt = _pt;
        yt = _yt;
        marketExpiry = _expiry;
    }

    function readTokens() external view override returns (address _SY, address _PT, address _YT) {
        return (sy, pt, yt);
    }

    function expiry() external view override returns (uint256) {
        return marketExpiry;
    }

    function isExpired() external view override returns (bool) {
        return block.timestamp >= marketExpiry;
    }

    function getRewardTokens() external pure override returns (address[] memory) {
        return new address[](0);
    }
}
