// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IPolicyManager.sol";

interface IDecisionRegistry {
    struct DecisionRecord {
        bytes32 decisionHash;
        string decisionId;
        IPolicyManager.Action action;
        address targetAsset;
        uint256 targetAllocationBps;
        uint256 confidenceBps;
        uint256 dataTimestamp;
        uint256 executedAt;
        bytes32 reasonCodesHash;
        bool approved;
    }

    event DecisionRecorded(
        bytes32 indexed decisionHash,
        string indexed decisionId,
        IPolicyManager.Action action,
        address targetAsset,
        uint256 targetAllocationBps,
        uint256 confidenceBps,
        bool approved
    );

    function recordDecision(
        string calldata decisionId,
        IPolicyManager.Action action,
        address targetAsset,
        uint256 targetAllocationBps,
        uint256 confidenceBps,
        uint256 dataTimestamp,
        string calldata reasonCodes,
        bool approved
    ) external returns (bytes32 decisionHash);

    function getDecision(bytes32 decisionHash) external view returns (DecisionRecord memory);
}
