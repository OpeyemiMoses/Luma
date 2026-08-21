// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IPendleMarket {
    function readTokens() external view returns (address _SY, address _PT, address _YT);
    function expiry() external view returns (uint256);
    function isExpired() external view returns (bool);
    function getRewardTokens() external view returns (address[] memory);
}
