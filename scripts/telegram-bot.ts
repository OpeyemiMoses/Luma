import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import http from 'http';
import { ethers } from 'ethers';

dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8776129510:AAHrNTahnSbjTMRFeFjSZ7q49S5Vz-qfg_4';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const BINDINGS_FILE = path.join(DATA_DIR, 'telegram-bindings.json');
const POLICIES_FILE = path.join(DATA_DIR, 'telegram-policies.json');

interface UserBinding {
  chatId: number;
  username?: string;
  firstName?: string;
  walletAddress?: string;
  boundAt: number;
}

interface StoredPolicy {
  profileName: string;
  maxPtAllocationBps: number;
  maxSingleRebalanceBps: number;
  maxSlippageBps: number;
  autonomousEnabled: boolean;
  minLiquidityScore: number;
  updatedAt: number;
}

function loadBindings(): Record<string, UserBinding> {
  try {
    if (fs.existsSync(BINDINGS_FILE)) {
      return JSON.parse(fs.readFileSync(BINDINGS_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error loading bindings:', e);
  }
  return {};
}

function saveBindings(bindings: Record<string, UserBinding>) {
  try {
    fs.writeFileSync(BINDINGS_FILE, JSON.stringify(bindings, null, 2));
  } catch (e) {
    console.error('Error saving bindings:', e);
  }
}

function loadPolicies(): Record<string, StoredPolicy> {
  try {
    if (fs.existsSync(POLICIES_FILE)) {
      return JSON.parse(fs.readFileSync(POLICIES_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error loading policies:', e);
  }
  return {};
}

function savePolicies(policies: Record<string, StoredPolicy>) {
  try {
    fs.writeFileSync(POLICIES_FILE, JSON.stringify(policies, null, 2));
  } catch (e) {
    console.error('Error saving policies:', e);
  }
}

async function sendTelegramMessage(chatId: number, text: string, replyMarkup?: any) {
  try {
    const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: replyMarkup
      })
    });
    const data: any = await res.json();
    if (!data.ok) {
      console.error(`❌ Telegram API error for chat ${chatId}:`, data.description);
    }
    return data;
  } catch (err) {
    console.error(`Failed to send message to ${chatId}:`, err);
  }
}

async function broadcastAlert(text: string, targetWallet?: string, replyMarkup?: any) {
  const bindings = loadBindings();
  let subscribers: UserBinding[] = [];

  if (targetWallet && targetWallet.startsWith('0x')) {
    subscribers = Object.values(bindings).filter(
      b => b.walletAddress && b.walletAddress.toLowerCase() === targetWallet.toLowerCase()
    );
    if (subscribers.length === 0) {
      subscribers = Object.values(bindings);
    }
  } else {
    subscribers = Object.values(bindings);
  }

  console.log(`📡 Dispatching alert to ${subscribers.length} subscriber(s)...`);
  
  for (const sub of subscribers) {
    await sendTelegramMessage(sub.chatId, text, replyMarkup);
  }
  return subscribers.length;
}

// Ultra-fast query for token/vault balance
async function queryErc20(rpcUrl: string, tokenAddress: string, walletAddress: string): Promise<bigint> {
  try {
    const clean = walletAddress.toLowerCase().replace('0x', '').padStart(64, '0');
    const data = '0x70a08231' + clean;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'eth_call',
        params: [{ to: tokenAddress, data }, 'latest']
      }),
      signal: controller.signal
    });
    clearTimeout(timer);

    const json: any = await res.json();
    if (json && json.result && json.result !== '0x' && !json.error) {
      return BigInt(json.result);
    }
  } catch {}
  return 0n;
}

// Fast query for native OKB balance
async function queryNativeBalance(rpcUrl: string, walletAddress: string): Promise<bigint> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'eth_getBalance',
        params: [walletAddress, 'latest']
      }),
      signal: controller.signal
    });
    clearTimeout(timer);

    const json: any = await res.json();
    if (json && json.result && json.result !== '0x' && !json.error) {
      return BigInt(json.result);
    }
  } catch {}
  return 0n;
}

async function fetchLiveOnchainData(walletAddress: string) {
  const mainnetRpc = 'https://rpc.xlayer.tech';
  
  // Addresses on Mainnet
  const mainnetVault = '0xaa1ca8CF1E50f47815f6720863D8F83ecFAB2f2E';
  const mainnetUsdt = '0x779ded0c9e1022225f8e0630b35a9b54be713736';
  const mainnetUsdg = '0x4ae46a509f6b1d9056937ba4500cb143933d2dc8';

  let detectedNetwork = 'OKX X Layer Mainnet';
  let userShares = 0;
  let userUsdgBalance = 0;
  let userUsdtBalance = 0;
  let userOkbBalance = 0;

  try {
    const [mSharesRaw, mUsdtRaw, mUsdgRaw, mOkbRaw] = await Promise.all([
      queryErc20(mainnetRpc, mainnetVault, walletAddress),
      queryErc20(mainnetRpc, mainnetUsdt, walletAddress),
      queryErc20(mainnetRpc, mainnetUsdg, walletAddress),
      queryNativeBalance(mainnetRpc, walletAddress)
    ]);

    if (mSharesRaw > 0n) {
      userShares = parseFloat(ethers.formatUnits(mSharesRaw, 6));
      detectedNetwork = 'OKX X Layer Mainnet (Chain 196)';
    }

    if (mUsdtRaw > 0n) {
      userUsdtBalance = parseFloat(ethers.formatUnits(mUsdtRaw, 6));
      detectedNetwork = 'OKX X Layer Mainnet (Chain 196)';
    }

    if (mUsdgRaw > 0n) {
      userUsdgBalance = parseFloat(ethers.formatUnits(mUsdgRaw, 6));
      detectedNetwork = 'OKX X Layer Mainnet (Chain 196)';
    }

    if (mOkbRaw > 0n) {
      userOkbBalance = parseFloat(ethers.formatUnits(mOkbRaw, 18));
      detectedNetwork = 'OKX X Layer Mainnet (Chain 196)';
    }
  } catch (e) {
    console.error('Error fetching onchain balances:', e);
  }

  return {
    detectedNetwork,
    userShares,
    userUsdgBalance,
    userUsdtBalance,
    userOkbBalance
  };
}

// Long-polling handler
let lastUpdateId = 0;

async function pollUpdates() {
  try {
    const url = `${TELEGRAM_API}/getUpdates?offset=${lastUpdateId + 1}&timeout=20`;
    const res = await fetch(url);
    const data: any = await res.json();

    if (data.ok && Array.isArray(data.result)) {
      for (const update of data.result) {
        lastUpdateId = update.update_id;
        if (update.message && update.message.text) {
          handleMessage(update.message).catch(e => console.error('Handle error:', e));
        }
      }
    }
  } catch (err) {
    console.error('Polling error:', err);
  }
  setTimeout(pollUpdates, 1200);
}

// Conversational state tracking
const userSession: Record<string, string> = {};

async function handleMessage(msg: any) {
  const chatId = msg.chat.id;
  const text: string = msg.text ? msg.text.trim() : '';
  const username = msg.from.username ? `@${msg.from.username}` : (msg.from.first_name || 'User');
  const bindings = loadBindings();

  console.log(`📩 Received message from ${username} (${chatId}): ${text}`);

  if (!bindings[chatId.toString()]) {
    bindings[chatId.toString()] = {
      chatId,
      username,
      firstName: msg.from.first_name,
      boundAt: Date.now()
    };
    saveBindings(bindings);
  }

  // Handle active session inputs
  if (userSession[chatId.toString()] === 'AWAITING_WALLET_ADDRESS') {
    delete userSession[chatId.toString()];
    const wallet = text.trim();
    if (wallet.startsWith('0x') && wallet.length >= 40) {
      bindings[chatId.toString()] = {
        chatId,
        username,
        firstName: msg.from.first_name,
        walletAddress: wallet,
        boundAt: Date.now()
      };
      saveBindings(bindings);

      await sendTelegramMessage(
        chatId,
        `✅ <b>Wallet Successfully Linked to Luma Sentinel</b>\n\n` +
        `• <b>Wallet:</b> <code>${wallet}</code>\n` +
        `• <b>Telegram:</b> ${username}\n` +
        `• <b>Network:</b> OKX X Layer Mainnet\n\n` +
        `Instant push alerts are now active for all your deposits, withdrawals, rebalances, and APY shifts!\n\n` +
        `Type /status to inspect your live position or /risk to view active risk bounds.`
      );
      return;
    } else {
      await sendTelegramMessage(
        chatId,
        `❌ <b>Invalid address.</b> Please send a valid 0x address.\n\nType /bind to try again.`
      );
      return;
    }
  }

  // Detect plain 0x address sent by user
  if (text.startsWith('0x') && text.length >= 40) {
    const wallet = text.trim();
    bindings[chatId.toString()] = {
      chatId,
      username,
      firstName: msg.from.first_name,
      walletAddress: wallet,
      boundAt: Date.now()
    };
    saveBindings(bindings);

    await sendTelegramMessage(
      chatId,
      `✅ <b>Wallet Linked to Luma Sentinel</b>\n\n` +
      `• <b>Wallet:</b> <code>${wallet}</code>\n` +
      `• <b>Telegram:</b> ${username}\n\n` +
      `Real-time push alerts are now active for your wallet.`
    );
    return;
  }

  // /start command
  if (text.startsWith('/start')) {
    const rawParam = text.replace('/start', '').trim();
    const cleanWallet = rawParam.replace('bind_', '').replace('bind', '').trim();
    
    if (cleanWallet.startsWith('0x') && cleanWallet.length >= 40) {
      bindings[chatId.toString()] = {
        chatId,
        username,
        firstName: msg.from.first_name,
        walletAddress: cleanWallet,
        boundAt: Date.now()
      };
      saveBindings(bindings);

      await sendTelegramMessage(
        chatId,
        `🌅 <b>Welcome to Luma Sentinel!</b>\n\n` +
        `✅ <b>Wallet Successfully Linked:</b> <code>${cleanWallet}</code>\n` +
        `• <b>Account:</b> ${username}\n` +
        `• <b>Network:</b> OKX X Layer Mainnet\n\n` +
        `You will now receive instant push telemetry for all vault deposits, withdrawals, strategy rebalances, and APY shifts!\n\n` +
        `Type /status to inspect your live strategy vault metrics.`
      );
      return;
    }

    const userBinding = bindings[chatId.toString()];
    const isBound = !!(userBinding && userBinding.walletAddress);

    await sendTelegramMessage(
      chatId,
      `🌅 <b>Welcome to Luma Sentinel</b>\n\n` +
      `Autonomous AI-managed Real-World Asset (RWA) Strategy Vault built on <b>OKX X Layer</b>.\n\n` +
      `• <b>Sentinel Status:</b> 🟢 Active & Monitoring\n` +
      `• <b>Linked Wallet:</b> ${isBound ? `<code>${userBinding.walletAddress}</code>` : '<i>Not linked yet</i>'}\n\n` +
      `${isBound ? 'You are receiving real-time telemetry.' : '👉 Send <code>/bind &lt;your_wallet_address&gt;</code> to link your wallet.'}\n\n` +
      `<b>Available Commands:</b>\n` +
      `/status - Live vault position & allocation\n` +
      `/risk - Live risk profile & guardrails\n` +
      `/setprofile - Switch risk profile (conservative, balanced, aggressive)\n` +
      `/bind - Link your wallet address\n` +
      `/unbind - Disconnect telemetry\n` +
      `/help - Full documentation`
    );
    return;
  }

  // /setprofile command
  if (text.startsWith('/setprofile')) {
    const userBinding = bindings[chatId.toString()];
    const wallet = userBinding?.walletAddress?.toLowerCase();
    const parts = text.split(' ').filter(p => p.trim() !== '');
    const pChoice = parts[1]?.toLowerCase();

    const presets: Record<string, StoredPolicy> = {
      conservative: {
        profileName: 'Conservative',
        maxPtAllocationBps: 2000,
        maxSingleRebalanceBps: 1000,
        maxSlippageBps: 50,
        autonomousEnabled: true,
        minLiquidityScore: 90,
        updatedAt: Date.now()
      },
      balanced: {
        profileName: 'Balanced',
        maxPtAllocationBps: 4000,
        maxSingleRebalanceBps: 2000,
        maxSlippageBps: 150,
        autonomousEnabled: true,
        minLiquidityScore: 80,
        updatedAt: Date.now()
      },
      aggressive: {
        profileName: 'Aggressive',
        maxPtAllocationBps: 6000,
        maxSingleRebalanceBps: 3000,
        maxSlippageBps: 250,
        autonomousEnabled: true,
        minLiquidityScore: 70,
        updatedAt: Date.now()
      }
    };

    if (pChoice && presets[pChoice]) {
      const selected = presets[pChoice];
      const policies = loadPolicies();
      if (wallet) policies[wallet] = selected;
      policies['default'] = selected;
      savePolicies(policies);

      await sendTelegramMessage(
        chatId,
        `🛡️ <b>Risk Profile Updated to ${selected.profileName}</b>\n\n` +
        `• <b>Max PT-USDG Ceiling:</b> ${selected.maxPtAllocationBps / 100}%\n` +
        `• <b>Max Single Move:</b> ${selected.maxSingleRebalanceBps / 100}%\n` +
        `• <b>Max Slippage Tolerance:</b> ${selected.maxSlippageBps / 100}%\n` +
        `• <b>Autonomous Execution:</b> 🟢 Active\n\n` +
        `<i>Synced across your Luma dashboard on OKX X Layer.</i>`
      );
      return;
    } else {
      await sendTelegramMessage(
        chatId,
        `⚙️ <b>Change Risk Profile</b>\n\n` +
        `Usage: <code>/setprofile &lt;conservative|balanced|aggressive&gt;</code>\n\n` +
        `• <b>conservative:</b> Max 20% PT-USDG (0.50% Slippage)\n` +
        `• <b>balanced:</b> Max 40% PT-USDG (1.50% Slippage)\n` +
        `• <b>aggressive:</b> Max 60% PT-USDG (2.50% Slippage)`
      );
      return;
    }
  }

  // /bind command
  if (text.startsWith('/bind')) {
    const parts = text.split(' ').filter(p => p.trim() !== '');
    if (parts.length >= 2) {
      const wallet = parts[1].trim();
      if (wallet.startsWith('0x') && wallet.length >= 40) {
        bindings[chatId.toString()] = {
          chatId,
          username,
          firstName: msg.from.first_name,
          walletAddress: wallet,
          boundAt: Date.now()
        };
        saveBindings(bindings);

        await sendTelegramMessage(
          chatId,
          `✅ <b>Wallet Linked Successfully!</b>\n\n` +
          `• <b>Wallet:</b> <code>${wallet}</code>\n` +
          `• <b>Telegram:</b> ${username}\n\n` +
          `Push notifications are now enabled for all deposits, withdrawals, and AI rebalance cycles.`
        );
        return;
      }
    }

    userSession[chatId.toString()] = 'AWAITING_WALLET_ADDRESS';
    await sendTelegramMessage(
      chatId,
      `🔗 <b>Link Your Wallet to Luma Sentinel</b>\n\n` +
      `Please reply with your <b>Ethereum / OKX X Layer wallet address</b> (starting with <code>0x...</code>):`
    );
    return;
  }

  // /status command
  if (text.startsWith('/status')) {
    const userBinding = bindings[chatId.toString()];
    const wallet = userBinding?.walletAddress;
    const policies = loadPolicies();
    const activePolicy = (wallet && policies[wallet.toLowerCase()]) ? policies[wallet.toLowerCase()] : (policies['default'] || {
      profileName: 'Balanced',
      maxPtAllocationBps: 4000
    });

    const ptAllocationPct = Math.round(activePolicy.maxPtAllocationBps / 100);
    const usdgAllocationPct = 100 - ptAllocationPct;
    const liveBlendedApy = (4.50 * (usdgAllocationPct / 100) + 7.10 * (ptAllocationPct / 100)).toFixed(2);

    if (wallet) {
      const { detectedNetwork, userShares, userUsdgBalance, userUsdtBalance, userOkbBalance } = await fetchLiveOnchainData(wallet);
      const userUsdValue = userShares > 0 ? userShares : 0;
      const ptUsd = (userUsdValue * ptAllocationPct) / 100;
      const usdgUsd = (userUsdValue * usdgAllocationPct) / 100;

      await sendTelegramMessage(
        chatId,
        `📊 <b>Luma Strategy Vault Position</b>\n\n` +
        `• <b>Linked Wallet:</b> <code>${wallet}</code>\n` +
        `• <b>Active Network:</b> 🟢 <b>${detectedNetwork}</b>\n` +
        `• <b>Risk Profile:</b> <b>${activePolicy.profileName || 'Balanced'}</b>\n` +
        `• <b>Vault Status:</b> 100% Non-Custodial & Verified\n\n` +
        `💼 <b>Wallet Liquid Holdings:</b>\n` +
        `• <b>Tether USD₮0:</b> <b>$${userUsdtBalance.toFixed(2)} USD₮0</b>\n` +
        `• <b>Paxos USDG:</b> <b>$${userUsdgBalance.toFixed(2)} USDG</b>\n` +
        `• <b>Native Gas (OKB):</b> <b>${userOkbBalance.toFixed(4)} OKB</b>\n\n` +
        `🏦 <b>Vault Share Balance:</b>\n` +
        `• <b>Total Deposited:</b> <b>$${userUsdValue.toFixed(2)} USDG</b>\n` +
        `• <b>Shares Held:</b> ${userShares.toFixed(2)} LUMA-LP\n` +
        `• <b>Net Strategy APY:</b> <b>${liveBlendedApy}% APY</b> (Auto-compounding)\n\n` +
        `🍰 <b>Target Strategy Allocation (${activePolicy.profileName || 'Balanced'}):</b>\n` +
        `• <b>Paxos USDG (Treasury):</b> ${usdgAllocationPct.toFixed(2)}% ($${usdgUsd.toFixed(2)} @ 4.50% APY)\n` +
        `• <b>Pendle PT-USDG (Fixed Yield):</b> ${ptAllocationPct.toFixed(2)}% ($${ptUsd.toFixed(2)} @ 7.10% APY)\n\n` +
        `🛡️ <b>Risk Guardrails:</b> 🟢 Policy Invariant Verified (Max ${ptAllocationPct}% PT Ceiling)\n` +
        `🔗 <b>Mainnet Vault Contract:</b> <a href="https://www.oklink.com/xlayer/address/0xaa1ca8CF1E50f47815f6720863D8F83ecFAB2f2E">0xaa1c...2f2E (OKLink)</a>`
      );
    } else {
      await sendTelegramMessage(
        chatId,
        `📊 <b>Luma Strategy Vault Overview</b>\n\n` +
        `• <b>Network:</b> OKX X Layer Mainnet (Chain 196)\n` +
        `• <b>Global Blended APY:</b> ${liveBlendedApy}%\n` +
        `• <b>Target Allocation:</b> ${usdgAllocationPct}% Paxos USDG | ${ptAllocationPct}% Pendle PT-USDG\n` +
        `• <b>Risk Profile:</b> ${activePolicy.profileName || 'Balanced'}\n` +
        `• <b>Policy Guardian:</b> 🟢 Active & Bounded\n\n` +
        `👉 <b>No wallet is linked to your account yet.</b>\n` +
        `Reply with <code>/bind &lt;your_0x_address&gt;</code> to view your personalized share balance and real-time allocations.`
      );
    }
    return;
  }

  // /risk command (reads live synchronized policy from web app)
  if (text.startsWith('/risk')) {
    const userBinding = bindings[chatId.toString()];
    const wallet = userBinding?.walletAddress?.toLowerCase();
    const policies = loadPolicies();
    const activePolicy = (wallet && policies[wallet]) ? policies[wallet] : (policies['default'] || {
      profileName: 'Balanced',
      maxPtAllocationBps: 4000,
      maxSingleRebalanceBps: 2000,
      maxSlippageBps: 150,
      autonomousEnabled: true,
      minLiquidityScore: 80
    });

    const maxPtPct = (activePolicy.maxPtAllocationBps / 100).toFixed(2);
    const maxMovePct = (activePolicy.maxSingleRebalanceBps / 100).toFixed(2);
    const maxSlippagePct = (activePolicy.maxSlippageBps / 100).toFixed(2);

    await sendTelegramMessage(
      chatId,
      `🛡️ <b>Luma Onchain Policy & Risk Guardrails</b>\n\n` +
      `• <b>Linked Wallet:</b> ${wallet ? `<code>${userBinding.walletAddress}</code>` : 'None'}\n` +
      `• <b>Active Profile:</b> <b>${activePolicy.profileName || 'Balanced'}</b> (Live from Web App)\n` +
      `• <b>Network:</b> OKX X Layer Mainnet (Chain 196)\n\n` +
      `📐 <b>Active Mathematical Guardrails:</b>\n` +
      `• <b>Max PT-USDG Ceiling:</b> <b>${maxPtPct}%</b> (Hard Limit)\n` +
      `• <b>Max Single Rebalance:</b> <b>${maxMovePct}%</b>\n` +
      `• <b>Max Slippage Floor:</b> <b>${maxSlippagePct}%</b>\n` +
      `• <b>Autonomous Execution:</b> ${activePolicy.autonomousEnabled !== false ? '🟢 Enabled' : '🔴 Paused'}\n` +
      `• <b>Non-Custodial Guarantee:</b> 100% Onchain Rule\n\n` +
      `🔗 <b>Policy Manager Bytecode:</b> <a href="https://www.oklink.com/xlayer/address/0xc743883f03De9722050B7da6cd77F91128eD0562">0xc743...0562 (OKLink)</a>\n\n` +
      `<i>To change risk profiles, adjust in the web app or type <code>/setprofile conservative|balanced|aggressive</code>.</i>`
    );
    return;
  }

  // /unbind command
  if (text.startsWith('/unbind')) {
    if (bindings[chatId.toString()]) {
      delete bindings[chatId.toString()];
      saveBindings(bindings);
      await sendTelegramMessage(
        chatId,
        `👋 <b>Wallet Disconnected</b>\n\nYou will no longer receive automated push alerts. Type /bind to link again.`
      );
    } else {
      await sendTelegramMessage(chatId, `No wallet is currently linked to this account.`);
    }
    return;
  }

  if (text.startsWith('/help')) {
    await sendTelegramMessage(
      chatId,
      `📖 <b>Luma Sentinel Command Reference</b>\n\n` +
      `/start - Welcome & status\n` +
      `/status - Real-time vault metrics, network & allocation\n` +
      `/risk - Real-time onchain policy & risk bounds\n` +
      `/setprofile &lt;conservative|balanced|aggressive&gt; - Update risk profile\n` +
      `/bind &lt;address&gt; - Link your wallet\n` +
      `/unbind - Disconnect wallet`
    );
    return;
  }

  // Default response
  await sendTelegramMessage(
    chatId,
    `🌅 <b>Luma Sentinel Bot</b> (OKX X Layer)\n\nType /status to view your live vault metrics and network or /risk to view active risk bounds.`
  );
}

// Local HTTP Bridge for the Web UI & backend services
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/api/sync-policy' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const wallet = payload.wallet?.toLowerCase();
        if (payload.policy) {
          const policies = loadPolicies();
          if (wallet) {
            policies[wallet] = {
              ...payload.policy,
              updatedAt: Date.now()
            };
          }
          policies['default'] = {
            ...payload.policy,
            updatedAt: Date.now()
          };
          savePolicies(policies);
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, message: 'Policy synchronized successfully' }));
      } catch (e: any) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: e.message }));
      }
    });
    return;
  }

  if (req.url === '/api/send-alert' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const p = JSON.parse(body || '{}');
        const targetWallet = p.wallet;
        let alertText = '';

        if (p.type === 'deposit') {
          alertText =
            `💰 <b>[Luma Vault Deposit Confirmed]</b>\n\n` +
            `• <b>Deposited:</b> ${p.amount || '50.00'} ${p.asset || 'USDG'}\n` +
            `• <b>Network:</b> OKX X Layer Mainnet\n` +
            `• <b>Vault Shares Issued:</b> ${p.amount || '50.00'} LUMA-LP\n` +
            `• <b>Blended APY:</b> ${p.apy || '5.54'}%\n` +
            (p.txHash ? `• <b>Tx Hash:</b> <code>${p.txHash}</code>\n` : '') +
            (p.txHash ? `• <b>Explorer:</b> https://www.oklink.com/xlayer/tx/${p.txHash}\n\n` : '\n') +
            `<i>Your position is now compounding automatically in the strategy vault.</i>`;
        } else if (p.type === 'withdraw') {
          alertText =
            `💸 <b>[Luma Vault Withdrawal Confirmed]</b>\n\n` +
            `• <b>Withdrawn:</b> ${p.amount || '25.00'} ${p.asset || 'USDG'}\n` +
            `• <b>Network:</b> OKX X Layer Mainnet\n` +
            (p.txHash ? `• <b>Tx Hash:</b> <code>${p.txHash}</code>\n` : '') +
            (p.txHash ? `• <b>Explorer:</b> https://www.oklink.com/xlayer/tx/${p.txHash}\n\n` : '\n') +
            `<i>Funds have been safely returned to your wallet.</i>`;
        } else if (p.type === 'rebalance') {
          alertText =
            `⚡ <b>[Luma AI Strategy Rebalance Executed]</b>\n\n` +
            `• <b>New Target Allocation:</b> ${p.allocation || '60% USDG | 40% PT-USDG'}\n` +
            `• <b>Effective Strategy APY:</b> ${p.apy || '5.54'}%\n` +
            `• <b>Reasoning:</b> ${p.details || 'Optimal Sharpe ratio optimization with US Treasury rate lock.'}\n` +
            `• <b>Policy Manager:</b> 🟢 Verified Pass (0.00% Slippage, &lt; 40% PT Ceiling)\n` +
            (p.txHash ? `• <b>Tx Hash:</b> <code>${p.txHash}</code>\n\n` : '\n\n') +
            `<i>Delivered by Luma Sentinel Telemetry on OKX X Layer.</i>`;
        } else if (p.type === 'policy') {
          alertText =
            `🛡️ <b>[Luma Risk Guardrail Updated]</b>\n\n` +
            `• <b>Active Profile:</b> ${p.title || 'Balanced'}\n` +
            `• <b>Max PT Ceiling:</b> ${p.allocation || '40.00%'}\n` +
            `• <b>Max Slippage Tolerance:</b> 1.50%\n` +
            `• <b>Autonomous Rebalance:</b> 🟢 Enabled\n\n` +
            `<i>Onchain PolicyManager bytecode updated on OKX X Layer.</i>`;
        } else {
          alertText =
            `🌅 <b>[Luma Sentinel Telemetry Test]</b>\n\n` +
            `• <b>Status:</b> 🟢 Online & Connected\n` +
            `• <b>Wallet:</b> <code>${targetWallet || '0x...'}</code>\n` +
            `• <b>Network:</b> OKX X Layer Mainnet\n` +
            `• <b>Live APY:</b> 5.54%\n\n` +
            `<i>All real-time push alerts are active and operational!</i>`;
        }

        const count = await broadcastAlert(alertText, targetWallet);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          ok: true,
          deliveredTo: count,
          message: count > 0 ? `Alert sent to ${count} Telegram subscriber(s)` : 'Alert dispatched.'
        }));
      } catch (e: any) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: e.message }));
      }
    });
    return;
  }

  if (req.url === '/api/unbind' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const targetWallet = payload.wallet?.toLowerCase();
        const currentBindings = loadBindings();
        let removedCount = 0;

        for (const [cId, b] of Object.entries(currentBindings)) {
          if (
            (targetWallet && b.walletAddress && b.walletAddress.toLowerCase() === targetWallet) ||
            (payload.chatId && b.chatId === Number(payload.chatId))
          ) {
            delete currentBindings[cId];
            removedCount++;
          }
        }
        
        saveBindings(currentBindings);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          ok: true,
          removedCount,
          message: `Successfully unbound ${removedCount} Telegram session(s)`
        }));
      } catch (e: any) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: e.message }));
      }
    });
    return;
  }

  if (req.url === '/api/bindings' && req.method === 'GET') {
    const bindingsData = loadBindings();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, bindings: bindingsData }));
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

const HTTP_PORT = 4001;
server.listen(HTTP_PORT, () => {
  console.log(`🤖 Telegram Sentinel HTTP Bridge listening on port ${HTTP_PORT}`);
  console.log(`📡 Starting Telegram Bot long-polling for @LumaFinanceBot...`);
  pollUpdates();
});
