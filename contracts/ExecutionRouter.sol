// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IERC20.sol";
import "./interfaces/IPendleRouter.sol";
import "./interfaces/IPendleMarket.sol";
import "./interfaces/IPolicyManager.sol";

/**
 * @title ExecutionRouter
 * @notice Dedicated swap execution router for Luma Finance on X Layer.
 * @dev Interacts ONLY with verified allowlisted Pendle Router / Market contracts.
 *      Enforces slippage protection and guarantees assets return strictly to LumaVault.
 */
contract ExecutionRouter is Ownable, ReentrancyGuard {
    address public vault;
    IPolicyManager public policyManager;
    address public pendleRouter;

    mapping(address => bool) public approvedMarkets;

    event VaultUpdated(address indexed newVault);
    event PendleRouterUpdated(address indexed newRouter);
    event MarketApprovalUpdated(address indexed market, bool approved);
    event SwapExecuted(
        address indexed market,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        address receiver
    );

    modifier onlyVault() {
        require(msg.sender == vault, "ExecutionRouter: caller is not LumaVault");
        _;
    }

    constructor(
        address initialOwner,
        address _policyManager,
        address _pendleRouter
    ) Ownable(initialOwner) {
        require(_policyManager != address(0), "ExecutionRouter: zero policy manager");
        policyManager = IPolicyManager(_policyManager);
        pendleRouter = _pendleRouter;
    }

    function setVault(address _vault) external onlyOwner {
        require(_vault != address(0), "ExecutionRouter: zero vault address");
        vault = _vault;
        emit VaultUpdated(_vault);
    }

    function setPendleRouter(address _pendleRouter) external onlyOwner {
        require(_pendleRouter != address(0), "ExecutionRouter: zero pendle router address");
        pendleRouter = _pendleRouter;
        emit PendleRouterUpdated(_pendleRouter);
    }

    function setMarketApproved(address market, bool approved) external onlyOwner {
        require(market != address(0), "ExecutionRouter: zero market address");
        approvedMarkets[market] = approved;
        emit MarketApprovalUpdated(market, approved);
    }

    /**
     * @notice Swaps USDG (or base token) for PT-USDG on Pendle market.
     * @dev Funds come from vault and PT-USDG tokens are sent directly back to the vault.
     */
    function swapTokenForPt(
        address market,
        address tokenIn,
        uint256 amountIn,
        uint256 minPtOut
    ) external onlyVault nonReentrant returns (uint256 ptOut) {
        require(approvedMarkets[market], "ExecutionRouter: market not approved");
        require(policyManager.isAssetAllowed(tokenIn), "ExecutionRouter: tokenIn not allowed");

        // Transfer tokenIn from vault to this router
        require(IERC20(tokenIn).transferFrom(vault, address(this), amountIn), "ExecutionRouter: transferFrom failed");

        // Approve PendleRouter
        IERC20(tokenIn).approve(pendleRouter, amountIn);

        IPendleRouter.ApproxParams memory approx = IPendleRouter.ApproxParams({
            guessMin: 0,
            guessMax: type(uint256).max,
            guessOffchain: 0,
            maxIteration: 256,
            eps: 1e14
        });

        IPendleRouter.SwapData memory emptySwap;
        IPendleRouter.TokenInput memory input = IPendleRouter.TokenInput({
            tokenIn: tokenIn,
            netTokenIn: amountIn,
            tokenMintSy: tokenIn,
            pendleSwap: address(0),
            swapData: emptySwap
        });

        IPendleRouter.LimitOrderData memory limit;

        // Execute swap on Pendle router; receiver is strictly the vault
        (ptOut, ) = IPendleRouter(pendleRouter).swapExactTokenForPt(
            vault,
            market,
            minPtOut,
            approx,
            input,
            limit
        );

        require(ptOut >= minPtOut, "ExecutionRouter: slippage limit breached");

        (, address ptAddress, ) = IPendleMarket(market).readTokens();
        emit SwapExecuted(market, tokenIn, ptAddress, amountIn, ptOut, vault);
    }

    /**
     * @notice Swaps PT-USDG for USDG (or base token) on Pendle market.
     * @dev PT tokens come from vault and base tokens are sent directly back to the vault.
     */
    function swapPtForToken(
        address market,
        address ptIn,
        uint256 amountIn,
        address tokenOut,
        uint256 minTokenOut
    ) external onlyVault nonReentrant returns (uint256 netTokenOut) {
        require(approvedMarkets[market], "ExecutionRouter: market not approved");
        require(policyManager.isAssetAllowed(tokenOut), "ExecutionRouter: tokenOut not allowed");

        // Transfer PT from vault to this router
        require(IERC20(ptIn).transferFrom(vault, address(this), amountIn), "ExecutionRouter: transferFrom PT failed");

        // Approve PendleRouter
        IERC20(ptIn).approve(pendleRouter, amountIn);

        IPendleRouter.SwapData memory emptySwap;
        IPendleRouter.TokenOutput memory output = IPendleRouter.TokenOutput({
            tokenOut: tokenOut,
            minTokenOut: minTokenOut,
            tokenRedeemSy: tokenOut,
            pendleSwap: address(0),
            swapData: emptySwap
        });

        IPendleRouter.LimitOrderData memory limit;

        // Execute swap on Pendle router; receiver is strictly the vault
        (netTokenOut, ) = IPendleRouter(pendleRouter).swapExactPtForToken(
            vault,
            market,
            amountIn,
            output,
            limit
        );

        require(netTokenOut >= minTokenOut, "ExecutionRouter: slippage limit breached");

        emit SwapExecuted(market, ptIn, tokenOut, amountIn, netTokenOut, vault);
    }
}
