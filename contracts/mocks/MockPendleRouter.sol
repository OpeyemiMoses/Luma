// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IERC20.sol";
import "../interfaces/IPendleRouter.sol";
import "../interfaces/IPendleMarket.sol";

contract MockPendleRouter is IPendleRouter {
    uint256 public discountBps = 300; // PT traded at 3% discount (approx 7.1% APY annualized)

    function setDiscountBps(uint256 _discountBps) external {
        discountBps = _discountBps;
    }

    function swapExactTokenForPt(
        address receiver,
        address market,
        uint256 minPtOut,
        ApproxParams calldata,
        TokenInput calldata input,
        LimitOrderData calldata
    ) external payable override returns (uint256 netPtOut, uint256 netSyFee) {
        (, address pt, ) = IPendleMarket(market).readTokens();
        
        // 1 USDG gets slightly more than 1 PT because PT is discounted until maturity
        // e.g. amountIn * 10000 / (10000 - discountBps)
        netPtOut = (input.netTokenIn * 10000) / (10000 - discountBps);
        require(netPtOut >= minPtOut, "MockPendleRouter: minPtOut not met");

        IERC20(input.tokenIn).transferFrom(msg.sender, address(this), input.netTokenIn);
        IERC20(pt).transfer(receiver, netPtOut);
        return (netPtOut, 0);
    }

    function swapExactPtForToken(
        address receiver,
        address market,
        uint256 exactPtIn,
        TokenOutput calldata output,
        LimitOrderData calldata
    ) external override returns (uint256 netTokenOut, uint256 netSyFee) {
        (, address pt, ) = IPendleMarket(market).readTokens();

        // PT redeemed before maturity trades at discount: exactPtIn * (10000 - discountBps) / 10000
        netTokenOut = (exactPtIn * (10000 - discountBps)) / 10000;
        require(netTokenOut >= output.minTokenOut, "MockPendleRouter: minTokenOut not met");

        IERC20(pt).transferFrom(msg.sender, address(this), exactPtIn);
        IERC20(output.tokenOut).transfer(receiver, netTokenOut);
        return (netTokenOut, 0);
    }
}
