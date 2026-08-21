// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IPolicyManager {
    enum Action { HOLD, INCREASE, REDUCE, EXIT }

    struct UserPolicy {
        uint256 maxPtAllocationBps;    // e.g. 4000 = 40%
        uint256 maxSingleRebalanceBps;  // e.g. 1000 = 10%
        uint256 maxSlippageBps;        // e.g. 100 = 1.0%
        bool autonomousEnabled;        // if true, AI can rebalance within boundaries
        bool active;
    }

    struct PolicyValidationParams {
        Action action;
        address asset;
        uint256 targetAllocationBps;
        uint256 amountIn;
        uint256 minAmountOut;
        uint256 totalVaultValueUsd;
        uint256 currentPtValueUsd;
        uint256 dataTimestamp;
        uint256 expiresAt;
    }

    event PolicyUpdated(address indexed user, uint256 maxPtAllocationBps, uint256 maxSingleRebalanceBps, uint256 maxSlippageBps, bool autonomousEnabled);
    event AssetAllowlistUpdated(address indexed asset, bool allowed);
    event ProtocolAllowlistUpdated(address indexed protocol, bool allowed);

    function getUserPolicy(address user) external view returns (UserPolicy memory);
    function isAssetAllowed(address asset) external view returns (bool);
    function isProtocolAllowed(address protocol) external view returns (bool);
    function maxDataAge() external view returns (uint256);
    
    function validateRebalance(
        address user,
        PolicyValidationParams calldata params
    ) external view returns (bool approved, string memory reason);
}
