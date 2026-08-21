// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./interfaces/IPolicyManager.sol";

/**
 * @title PolicyManager
 * @notice Enforces deterministic onchain boundaries and risk rules for AI-managed rebalances.
 * @dev Rejects any AI proposal that breaches user limits, slippage bounds, freshness, or asset allowlists.
 */
contract PolicyManager is IPolicyManager, Ownable, Pausable {
    uint256 public constant BPS_DENOMINATOR = 10000;
    uint256 public maxDataAge = 300; // 5 minutes max freshness window

    // Default policy limits (Balanced profile defaults)
    UserPolicy public defaultPolicy = UserPolicy({
        maxPtAllocationBps: 4000,     // 40%
        maxSingleRebalanceBps: 1000,  // 10%
        maxSlippageBps: 100,          // 1%
        autonomousEnabled: true,
        active: true
    });

    mapping(address => UserPolicy) private _userPolicies;
    mapping(address => bool) private _allowedAssets;
    mapping(address => bool) private _allowedProtocols;
    mapping(address => bool) public authorizedAgents;

    event AgentAuthorizationUpdated(address indexed agent, bool authorized);
    event MaxDataAgeUpdated(uint256 newMaxDataAge);

    modifier onlyAgentOrOwner() {
        require(msg.sender == owner() || authorizedAgents[msg.sender], "PolicyManager: caller not authorized");
        _;
    }

    constructor(address initialOwner) Ownable(initialOwner) {}

    function setUserPolicy(
        uint256 maxPtAllocationBps,
        uint256 maxSingleRebalanceBps,
        uint256 maxSlippageBps,
        bool autonomousEnabled
    ) external {
        require(maxPtAllocationBps <= 8000, "PolicyManager: max PT allocation cannot exceed 80%");
        require(maxSingleRebalanceBps <= 3000, "PolicyManager: single rebalance cannot exceed 30%");
        require(maxSlippageBps <= 500, "PolicyManager: max slippage cannot exceed 5%");

        _userPolicies[msg.sender] = UserPolicy({
            maxPtAllocationBps: maxPtAllocationBps,
            maxSingleRebalanceBps: maxSingleRebalanceBps,
            maxSlippageBps: maxSlippageBps,
            autonomousEnabled: autonomousEnabled,
            active: true
        });

        emit PolicyUpdated(msg.sender, maxPtAllocationBps, maxSingleRebalanceBps, maxSlippageBps, autonomousEnabled);
    }

    function getUserPolicy(address user) public view override returns (UserPolicy memory) {
        if (_userPolicies[user].active) {
            return _userPolicies[user];
        }
        return defaultPolicy;
    }

    function setAssetAllowed(address asset, bool allowed) external onlyOwner {
        require(asset != address(0), "PolicyManager: zero address");
        _allowedAssets[asset] = allowed;
        emit AssetAllowlistUpdated(asset, allowed);
    }

    function isAssetAllowed(address asset) public view override returns (bool) {
        return _allowedAssets[asset];
    }

    function setProtocolAllowed(address protocol, bool allowed) external onlyOwner {
        require(protocol != address(0), "PolicyManager: zero address");
        _allowedProtocols[protocol] = allowed;
        emit ProtocolAllowlistUpdated(protocol, allowed);
    }

    function isProtocolAllowed(address protocol) public view override returns (bool) {
        return _allowedProtocols[protocol];
    }

    function setAgentAuthorized(address agent, bool authorized) external onlyOwner {
        require(agent != address(0), "PolicyManager: zero address");
        authorizedAgents[agent] = authorized;
        emit AgentAuthorizationUpdated(agent, authorized);
    }

    function setMaxDataAge(uint256 newMaxDataAge) external onlyOwner {
        require(newMaxDataAge >= 30 && newMaxDataAge <= 3600, "PolicyManager: invalid data age range");
        maxDataAge = newMaxDataAge;
        emit MaxDataAgeUpdated(newMaxDataAge);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Deterministically evaluates if an AI rebalance action complies with user policies and market safety.
     */
    function validateRebalance(
        address user,
        PolicyValidationParams calldata params
    ) external view override returns (bool approved, string memory reason) {
        if (paused()) {
            return (false, "POLICY_REJECTED: Protocol is paused");
        }

        if (!_allowedAssets[params.asset]) {
            return (false, "POLICY_REJECTED: Target asset is not allowlisted");
        }

        if (block.timestamp > params.expiresAt) {
            return (false, "POLICY_REJECTED: Proposal has expired");
        }

        if (block.timestamp < params.dataTimestamp || block.timestamp - params.dataTimestamp > maxDataAge) {
            return (false, "POLICY_REJECTED: Stale or future data timestamp");
        }

        UserPolicy memory policy = getUserPolicy(user);

        if (!policy.autonomousEnabled && msg.sender != user) {
            return (false, "POLICY_REJECTED: Autonomous mode disabled for user");
        }

        // Check target allocation boundary
        if (params.targetAllocationBps > policy.maxPtAllocationBps) {
            return (false, "POLICY_REJECTED: Target allocation exceeds maximum PT boundary");
        }

        // Check single rebalance size boundary (relative to total vault value)
        if (params.totalVaultValueUsd > 0) {
            uint256 rebalanceBps = (params.amountIn * BPS_DENOMINATOR) / params.totalVaultValueUsd;
            if (rebalanceBps > policy.maxSingleRebalanceBps) {
                return (false, "POLICY_REJECTED: Trade size exceeds max single rebalance limit");
            }
        }

        // Check slippage bound: minAmountOut must protect against excessive loss
        if (params.amountIn > 0 && params.minAmountOut > 0) {
            uint256 expectedMin = params.amountIn - ((params.amountIn * policy.maxSlippageBps) / BPS_DENOMINATOR);
            if (params.minAmountOut < expectedMin) {
                return (false, "POLICY_REJECTED: Minimum output breaches maximum allowable slippage");
            }
        }

        return (true, "APPROVED");
    }
}
