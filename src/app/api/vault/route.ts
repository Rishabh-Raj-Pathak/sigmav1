import { NextResponse } from "next/server";
import {
  getOpenTrades,
  getStrategyConfig,
  getVaultHistory,
  getAllTrades,
} from "@/lib/db/queries";
import { computeVaultState } from "@/lib/engine/vault-simulator";
import type { PaperTrade } from "@/lib/utils/types";

export const dynamic = "force-dynamic";

function createDummyTrades(): PaperTrade[] {
  const now = Math.floor(Date.now() / 1000);
  return [
    {
      tokenSymbol: "ETH",
      direction: "delta_neutral",
      longVenue: "GMX",
      shortVenue: "HyperLiquid",
      entryPrice: 3500,
      currentPrice: 3520,
      positionSizeUsd: 5000,
      leverage: 1,
      fundingCollected: 12,
      borrowingPaid: 3,
      unrealizedPnl: 150,
      status: "open",
      openedAt: now - 4 * 3600,
    },
    {
      tokenSymbol: "BTC",
      direction: "delta_neutral",
      longVenue: "Paradex",
      shortVenue: "GMX",
      entryPrice: 65000,
      currentPrice: 64800,
      positionSizeUsd: 7000,
      leverage: 1,
      fundingCollected: 18,
      borrowingPaid: 5,
      unrealizedPnl: -120,
      status: "open",
      openedAt: now - 9 * 3600,
    },
    {
      tokenSymbol: "AVAX",
      direction: "delta_neutral",
      longVenue: "GMX",
      shortVenue: "Paradex",
      entryPrice: 40,
      currentPrice: 41,
      positionSizeUsd: 3000,
      leverage: 1,
      fundingCollected: 9,
      borrowingPaid: 2,
      unrealizedPnl: 80,
      status: "open",
      openedAt: now - 2 * 3600,
    },
  ];
}

export async function GET() {
  try {
    const config = getStrategyConfig();
    const dbOpenTrades = getOpenTrades();
    const dbAllTrades = getAllTrades(100);

    const useDummy = dbOpenTrades.length === 0 && dbAllTrades.length === 0;
    const openTrades = useDummy ? createDummyTrades() : dbOpenTrades;
    const allTrades = useDummy ? openTrades : dbAllTrades;

    const closedPnl = allTrades
      .filter((t) => t.status === "closed" && t.realizedPnl != null)
      .reduce((sum, t) => sum + (t.realizedPnl || 0), 0);

    const vault = computeVaultState(
      config.vaultInitialCapital,
      openTrades,
      closedPnl,
    );
    const history = getVaultHistory(72);

    return NextResponse.json({
      ...vault,
      positions: openTrades,
      history,
    });
  } catch (error) {
    console.error("[API] /api/vault error:", error);
    return NextResponse.json(
      { error: "Failed to fetch vault state" },
      { status: 500 },
    );
  }
}
