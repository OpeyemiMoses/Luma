// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IPolicyManager.sol";

interface ILumaVault {
    event Deposit(address indexed caller, address indexed owner, uint256 assets, uint256 shares);
    event Withdraw(address indexed caller, address indexed receiver, address indexed owner, uint256 assets, uint256 shares);
    event StrategyRebalanced(
        address indexed executor,
        IPolicyManager.Action action,
        address assetIn,
        address assetOut,
        uint256 amountIn,
        uint256 amountOut,
        bytes32 decisionHash
    );
    event EmergencyPauseToggled(bool isPaused);

    function deposit(uint256 assets, address receiver) external returns (uint256 shares);
    function withdraw(uint256 shares, address receiver, address owner) external returns (uint256 assets);
    function totalAssets() external view returns (uint256);
    function getStrategyHoldings() external view returns (uint256 usdgBalance, uint256 ptUsdgBalance, uint256 ptUsdgValueInUsdg);
    function rebalanceStrategy(
        IPolicyManager.Action action,
        address assetIn,
        address assetOut,
        uint256 amountIn,
        uint256 minAmountOut,
        bytes32 decisionHash,
        bytes calldata executionPayload
    ) external returns (uint256 amountOut);
}
