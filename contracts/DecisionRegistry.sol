// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IDecisionRegistry.sol";

/**
 * @title DecisionRegistry
 * @notice Stores an immutable onchain cryptographic audit trail for every AI rebalance decision on X Layer.
 */
contract DecisionRegistry is IDecisionRegistry, Ownable {
    mapping(bytes32 => DecisionRecord) private _decisions;
    mapping(address => bool) public authorizedCallers;

    modifier onlyAuthorized() {
        require(msg.sender == owner() || authorizedCallers[msg.sender], "DecisionRegistry: caller not authorized");
        _;
    }

    constructor(address initialOwner) Ownable(initialOwner) {}

    function setAuthorizedCaller(address caller, bool authorized) external onlyOwner {
        require(caller != address(0), "DecisionRegistry: zero address");
        authorizedCallers[caller] = authorized;
    }

    function recordDecision(
        string calldata decisionId,
        IPolicyManager.Action action,
        address targetAsset,
        uint256 targetAllocationBps,
        uint256 confidenceBps,
        uint256 dataTimestamp,
        string calldata reasonCodes,
        bool approved
    ) external override onlyAuthorized returns (bytes32 decisionHash) {
        bytes32 reasonHash = keccak256(bytes(reasonCodes));
        decisionHash = keccak256(
            abi.encodePacked(
                decisionId,
                uint8(action),
                targetAsset,
                targetAllocationBps,
                confidenceBps,
                dataTimestamp,
                reasonHash,
                approved,
                block.number
            )
        );

        _decisions[decisionHash] = DecisionRecord({
            decisionHash: decisionHash,
            decisionId: decisionId,
            action: action,
            targetAsset: targetAsset,
            targetAllocationBps: targetAllocationBps,
            confidenceBps: confidenceBps,
            dataTimestamp: dataTimestamp,
            executedAt: block.timestamp,
            reasonCodesHash: reasonHash,
            approved: approved
        });

        emit DecisionRecorded(
            decisionHash,
            decisionId,
            action,
            targetAsset,
            targetAllocationBps,
            confidenceBps,
            approved
        );
    }

    function getDecision(bytes32 decisionHash) external view override returns (DecisionRecord memory) {
        DecisionRecord memory record = _decisions[decisionHash];
        require(record.decisionHash != bytes32(0), "DecisionRegistry: record not found");
        return record;
    }
}
