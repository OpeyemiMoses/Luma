// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IERC20.sol";
import "./interfaces/IPolicyManager.sol";
import "./interfaces/ILumaVault.sol";
import "./interfaces/IDecisionRegistry.sol";
import "./ExecutionRouter.sol";

/**
 * @title LumaVault
 * @notice Production-grade non-custodial RWA Strategy Vault deployed on X Layer.
 * @dev Manages capital between USDG and PT-USDG with onchain-enforced policy limits.
 */
contract LumaVault is ILumaVault, Ownable, Pausable, ReentrancyGuard {
    uint256 public constant BPS_DENOMINATOR = 10000;

    IERC20 public immutable baseAsset;     // USDG
    IERC20 public immutable ptAsset;       // PT-USDG
    address public immutable pendleMarket; // Pendle Market for PT-USDG

    IPolicyManager public policyManager;
    ExecutionRouter public executionRouter;
    IDecisionRegistry public decisionRegistry;

    uint256 public totalShares;
    mapping(address => uint256) public shareBalances;
    mapping(address => bool) public authorizedExecutors;

    event PolicyManagerUpdated(address indexed newPolicyManager);
    event ExecutionRouterUpdated(address indexed newExecutionRouter);
    event DecisionRegistryUpdated(address indexed newDecisionRegistry);
    event ExecutorAuthorizationUpdated(address indexed executor, bool authorized);

    modifier onlyExecutorOrOwner() {
        require(msg.sender == owner() || authorizedExecutors[msg.sender], "LumaVault: caller not authorized");
        _;
    }

    constructor(
        address initialOwner,
        address _baseAsset,
        address _ptAsset,
        address _pendleMarket,
        address _policyManager,
        address _executionRouter,
        address _decisionRegistry
    ) Ownable(initialOwner) {
        require(_baseAsset != address(0) && _ptAsset != address(0), "LumaVault: zero asset addresses");
        baseAsset = IERC20(_baseAsset);
        ptAsset = IERC20(_ptAsset);
        pendleMarket = _pendleMarket;

        policyManager = IPolicyManager(_policyManager);
        executionRouter = ExecutionRouter(_executionRouter);
        decisionRegistry = IDecisionRegistry(_decisionRegistry);
    }

    function setPolicyManager(address _policyManager) external onlyOwner {
        require(_policyManager != address(0), "LumaVault: zero address");
        policyManager = IPolicyManager(_policyManager);
        emit PolicyManagerUpdated(_policyManager);
    }

    function setExecutionRouter(address _executionRouter) external onlyOwner {
        require(_executionRouter != address(0), "LumaVault: zero address");
        executionRouter = ExecutionRouter(_executionRouter);
        emit ExecutionRouterUpdated(_executionRouter);
    }

    function setDecisionRegistry(address _decisionRegistry) external onlyOwner {
        require(_decisionRegistry != address(0), "LumaVault: zero address");
        decisionRegistry = IDecisionRegistry(_decisionRegistry);
        emit DecisionRegistryUpdated(_decisionRegistry);
    }

    function setExecutorAuthorized(address executor, bool authorized) external onlyOwner {
        require(executor != address(0), "LumaVault: zero address");
        authorizedExecutors[executor] = authorized;
        emit ExecutorAuthorizationUpdated(executor, authorized);
    }

    function pause() external onlyOwner {
        _pause();
        emit EmergencyPauseToggled(true);
    }

    function unpause() external onlyOwner {
        _unpause();
        emit EmergencyPauseToggled(false);
    }

    /**
     * @notice Deposit base asset (USDG) into Luma Vault and receive strategy shares.
     * @param assets Amount of USDG to deposit.
     * @param receiver Recipient of the minted LP shares.
     */
    function deposit(uint256 assets, address receiver) external override whenNotPaused nonReentrant returns (uint256 shares) {
        return _depositInternal(address(baseAsset), assets, receiver);
    }

    /**
     * @notice Deposit either USDG or USDT/PT into Luma Vault.
     * @param token Address of the token to deposit (USDG or USDT).
     * @param assets Amount of tokens to deposit.
     * @param receiver Recipient of the minted LP shares.
     */
    function depositAsset(address token, uint256 assets, address receiver) external whenNotPaused nonReentrant returns (uint256 shares) {
        require(token == address(baseAsset) || token == address(ptAsset), "LumaVault: unsupported token");
        return _depositInternal(token, assets, receiver);
    }

    function _depositInternal(address token, uint256 assets, address receiver) internal returns (uint256 shares) {
        require(assets > 0, "LumaVault: zero deposit amount");
        require(receiver != address(0), "LumaVault: zero receiver");

        uint256 currentTotalAssets = totalAssets();

        // Transfer funds from depositor to vault
        require(IERC20(token).transferFrom(msg.sender, address(this), assets), "LumaVault: deposit transfer failed");

        if (totalShares == 0 || currentTotalAssets == 0) {
            shares = assets;
        } else {
            shares = (assets * totalShares) / currentTotalAssets;
        }

        totalShares += shares;
        shareBalances[receiver] += shares;

        emit Deposit(msg.sender, receiver, assets, shares);
    }

    /**
     * @notice Withdraw funds by burning strategy shares.
     * @param shares Number of shares to redeem.
     * @param receiver Address receiving the withdrawn assets.
     * @param owner Address owning the shares.
     */
    function withdraw(
        uint256 shares,
        address receiver,
        address owner
    ) external override nonReentrant returns (uint256 assets) {
        require(shares > 0, "LumaVault: zero shares");
        require(receiver != address(0), "LumaVault: zero receiver");
        require(shareBalances[owner] >= shares, "LumaVault: insufficient shares");
        require(msg.sender == owner, "LumaVault: caller must be share owner");

        uint256 currentTotalAssets = totalAssets();
        assets = (shares * currentTotalAssets) / totalShares;

        shareBalances[owner] -= shares;
        totalShares -= shares;

        uint256 usdgBalance = baseAsset.balanceOf(address(this));
        if (usdgBalance >= assets) {
            require(baseAsset.transfer(receiver, assets), "LumaVault: USDG transfer failed");
        } else {
            if (usdgBalance > 0) {
                require(baseAsset.transfer(receiver, usdgBalance), "LumaVault: partial USDG transfer failed");
            }
            uint256 deficit = assets - usdgBalance;
            require(ptAsset.transfer(receiver, deficit), "LumaVault: USDT transfer failed");
        }

        emit Withdraw(msg.sender, receiver, owner, assets, shares);
    }

    /**
     * @notice Withdraw directly in chosen asset (USDG or USDT).
     */
    function withdrawAsset(
        address token,
        uint256 shares,
        address receiver,
        address owner
    ) external nonReentrant returns (uint256 assets) {
        require(shares > 0, "LumaVault: zero shares");
        require(receiver != address(0), "LumaVault: zero receiver");
        require(token == address(baseAsset) || token == address(ptAsset), "LumaVault: unsupported token");
        require(shareBalances[owner] >= shares, "LumaVault: insufficient shares");
        require(msg.sender == owner, "LumaVault: caller must be share owner");

        uint256 currentTotalAssets = totalAssets();
        assets = (shares * currentTotalAssets) / totalShares;

        shareBalances[owner] -= shares;
        totalShares -= shares;

        uint256 tokenBal = IERC20(token).balanceOf(address(this));
        if (tokenBal >= assets) {
            require(IERC20(token).transfer(receiver, assets), "LumaVault: token transfer failed");
        } else {
            if (tokenBal > 0) {
                require(IERC20(token).transfer(receiver, tokenBal), "LumaVault: partial token transfer failed");
            }
            uint256 deficit = assets - tokenBal;
            address otherToken = token == address(baseAsset) ? address(ptAsset) : address(baseAsset);
            require(IERC20(otherToken).transfer(receiver, deficit), "LumaVault: reserve transfer failed");
        }

        emit Withdraw(msg.sender, receiver, owner, assets, shares);
    }

    /**
     * @notice Returns total portfolio Net Asset Value (NAV) denominated in baseAsset (USDG).
     */
    function totalAssets() public view override returns (uint256) {
        uint256 usdgBal = baseAsset.balanceOf(address(this));
        uint256 ptBal = ptAsset.balanceOf(address(this));
        return usdgBal + ptBal; // In USDG 1 PT-USDG is redeemable for 1 USDG at maturity
    }

    /**
     * @notice Returns current breakdown of vault strategy holdings.
     */
    function getStrategyHoldings() external view override returns (
        uint256 usdgBalance,
        uint256 ptUsdgBalance,
        uint256 ptUsdgValueInUsdg
    ) {
        usdgBalance = baseAsset.balanceOf(address(this));
        ptUsdgBalance = ptAsset.balanceOf(address(this));
        ptUsdgValueInUsdg = ptUsdgBalance; // 1:1 nominal
    }

    /**
     * @notice Rebalance strategy allocation between USDG and PT-USDG according to approved AI decision.
     */
    function rebalanceStrategy(
        IPolicyManager.Action action,
        address assetIn,
        address assetOut,
        uint256 amountIn,
        uint256 minAmountOut,
        bytes32 decisionHash,
        bytes calldata /* executionPayload */
    ) external override whenNotPaused onlyExecutorOrOwner nonReentrant returns (uint256 amountOut) {
        require(amountIn > 0, "LumaVault: zero rebalance amount");

        uint256 currentTotal = totalAssets();
        uint256 currentPt = ptAsset.balanceOf(address(this));
        uint256 targetPtBps = _calculateTargetPtBps(action, amountIn, minAmountOut, currentTotal, currentPt);

        // Validate policy deterministically
        IPolicyManager.PolicyValidationParams memory params = IPolicyManager.PolicyValidationParams({
            action: action,
            asset: assetOut == address(ptAsset) ? address(ptAsset) : address(baseAsset),
            targetAllocationBps: targetPtBps,
            amountIn: amountIn,
            minAmountOut: minAmountOut,
            totalVaultValueUsd: currentTotal,
            currentPtValueUsd: currentPt,
            dataTimestamp: block.timestamp,
            expiresAt: block.timestamp + 300
        });

        (bool approved, string memory reason) = policyManager.validateRebalance(msg.sender, params);
        require(approved, string(abi.encodePacked("LumaVault: policy validation failed - ", reason)));

        amountOut = _performSwap(assetIn, amountIn, minAmountOut);

        emit StrategyRebalanced(msg.sender, action, assetIn, assetOut, amountIn, amountOut, decisionHash);
    }

    function _calculateTargetPtBps(
        IPolicyManager.Action action,
        uint256 amountIn,
        uint256 minAmountOut,
        uint256 currentTotal,
        uint256 currentPt
    ) internal pure returns (uint256 targetPtBps) {
        if (currentTotal == 0) return 0;
        uint256 currentPtBps = (currentPt * BPS_DENOMINATOR) / currentTotal;
        targetPtBps = currentPtBps;

        if (action == IPolicyManager.Action.INCREASE) {
            targetPtBps = ((currentPt + minAmountOut) * BPS_DENOMINATOR) / currentTotal;
        } else if (action == IPolicyManager.Action.REDUCE || action == IPolicyManager.Action.EXIT) {
            uint256 reduction = amountIn > currentPt ? currentPt : amountIn;
            targetPtBps = ((currentPt - reduction) * BPS_DENOMINATOR) / currentTotal;
        }
    }

    function _performSwap(address assetIn, uint256 amountIn, uint256 minAmountOut) internal returns (uint256 amountOut) {
        if (assetIn == address(baseAsset)) {
            baseAsset.approve(address(executionRouter), amountIn);
            return executionRouter.swapTokenForPt(
                pendleMarket,
                address(baseAsset),
                amountIn,
                minAmountOut
            );
        } else if (assetIn == address(ptAsset)) {
            ptAsset.approve(address(executionRouter), amountIn);
            return executionRouter.swapPtForToken(
                pendleMarket,
                address(ptAsset),
                amountIn,
                address(baseAsset),
                minAmountOut
            );
        } else {
            revert("LumaVault: invalid assetIn");
        }
    }
}
