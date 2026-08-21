import { IndexerService } from '../../../services/indexer/src/index.js';
import { RiskCalculator } from '../../../services/risk-engine/src/index.js';
import { AIManager } from '../../../apps/agent/src/index.js';
import { ExecutorWorker } from '../../../services/executor/src/index.js';
import { AuditService } from '../../../services/audit/src/index.js';
import { TelegramBotService } from '../../../apps/telegram-bot/src/TelegramBotService.js';
import { NETWORKS, RISK_PROFILES, NetworkConfig } from '../../config/src/index.js';
import { PolicyLimits, PortfolioState, RiskMetrics, AIDecision, DecisionAuditRecord } from '../../types/src/index.js';

export class LumaSDK {
  private indexer: IndexerService;
  private executor: ExecutorWorker;
  private network: NetworkConfig;

  constructor(network: NetworkConfig = NETWORKS.xlayerMainnet) {
    this.network = network;
    this.indexer = new IndexerService(network);
    this.executor = new ExecutorWorker(this.indexer);
  }

  public async getMarketData() {
    return this.indexer.getMarketDataSnapshot();
  }

  public async getPortfolio(userAddress?: string): Promise<PortfolioState> {
    if (userAddress) {
      return this.indexer.getPortfolioState(this.network.contracts.lumaVault, userAddress);
    }
    return this.executor.getPortfolio();
  }

  public async getRiskAnalysis(portfolio?: PortfolioState): Promise<RiskMetrics> {
    const market = await this.indexer.getMarketDataSnapshot();
    const p = portfolio || this.executor.getPortfolio();
    return RiskCalculator.calculate(market, p);
  }

  public async triggerStrategyCycle(policy: PolicyLimits = RISK_PROFILES.Balanced) {
    return this.executor.runCycle(policy);
  }

  public getAuditHistory(): DecisionAuditRecord[] {
    return AuditService.getAllDecisions();
  }

  public dispatchTelegramCommand(command: string, policy: PolicyLimits = RISK_PROFILES.Balanced) {
    const p = this.executor.getPortfolio();
    const market = {
      usdgPrice: 1.0002,
      ptUsdgPrice: 0.985,
      ptUsdgImpliedApyBps: 710,
      poolLiquidityUsd: 12500000,
      maturityTimestamp: 1793232000,
      daysToMaturity: p.daysToMaturity,
      oracleTimestamp: Math.floor(Date.now() / 1000),
      isStale: false,
      source: 'X Layer'
    };
    const risk = RiskCalculator.calculate(market, p);
    return TelegramBotService.handleCommand(command, p, risk, policy);
  }
}

export * from '../../types/src/index.js';
export * from '../../config/src/index.js';
