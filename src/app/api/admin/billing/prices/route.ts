import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

const SYMBOL_TO_GECKO_ID: Record<string, string> = {
  USDT: "tether",
  USDC: "usd-coin",
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  BNB: "binancecoin",
  TRX: "tron",
  XRP: "ripple",
  DOGE: "dogecoin",
  ADA: "cardano",
  POL: "matic-network",
  MATIC: "matic-network",
  AVAX: "avalanche-2",
  TON: "the-open-network",
  SUI: "sui",
  SHIB: "shiba-inu",
  DOT: "polkadot",
  LINK: "chainlink",
  NEAR: "near",
  LTC: "litecoin",
  BCH: "bitcoin-cash",
  XMR: "monero",
  ATOM: "cosmos",
  KAS: "kaspa",
  PEPE: "pepe",
  UNI: "uniswap",
  XLM: "stellar",
  ALGO: "algorand",
  APT: "aptos",
  FET: "fetch-ai",
  RENDER: "render-token",
  ARB: "arbitrum",
  OP: "optimism",
  INJ: "injective-protocol",
  TIA: "celestia",
  SEI: "sei-network",
  STX: "blockstack",
  ICP: "internet-computer",
  ETC: "ethereum-classic",
  FIL: "filecoin",
  FTM: "fantom",
  HBAR: "hedera-hashgraph",
  VET: "vechain",
  AAVE: "aave",
  MKR: "maker",
  WLD: "worldcoin-wld",
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = (searchParams.get("symbol") || "USDT").toUpperCase();
    const USD_TO_INR = 87.5;

    if (symbol === "USDT" || symbol === "USDC" || symbol === "USD") {
      return NextResponse.json({
        success: true,
        symbol,
        priceINR: USD_TO_INR,
        priceUSD: 1.0,
      });
    }

    const geckoId = SYMBOL_TO_GECKO_ID[symbol] || symbol.toLowerCase();

    try {
      const geckoRes = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${geckoId}&vs_currencies=inr,usd`,
        { next: { revalidate: 60 } }
      );
      if (geckoRes.ok) {
        const geckoData = await geckoRes.json();
        if (geckoData[geckoId] && geckoData[geckoId].inr) {
          return NextResponse.json({
            success: true,
            symbol,
            priceINR: geckoData[geckoId].inr,
            priceUSD: geckoData[geckoId].usd || geckoData[geckoId].inr / USD_TO_INR,
          });
        }
      }
    } catch (err) {
      console.warn("CoinGecko fetch failed, trying Binance fallback...", err);
    }

    try {
      const binanceRes = await fetch(
        `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}USDT`
      );
      if (binanceRes.ok) {
        const binanceData = await binanceRes.json();
        if (binanceData.price) {
          const usdPrice = parseFloat(binanceData.price);
          return NextResponse.json({
            success: true,
            symbol,
            priceINR: Math.round(usdPrice * USD_TO_INR * 100) / 100,
            priceUSD: usdPrice,
          });
        }
      }
    } catch (err) {
      console.warn("Binance fetch failed...", err);
    }

    return NextResponse.json({
      success: true,
      symbol,
      priceINR: USD_TO_INR,
      priceUSD: 1.0,
      isFallback: true,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
