import type Database from 'better-sqlite3'

export function initializeSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS funding_rate_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      market_token TEXT NOT NULL,
      market_name TEXT NOT NULL,
      index_token TEXT NOT NULL,
      token_symbol TEXT NOT NULL,
      funding_rate_long REAL NOT NULL,
      funding_rate_short REAL NOT NULL,
      borrowing_rate_long REAL NOT NULL,
      borrowing_rate_short REAL NOT NULL,
      net_rate_long REAL NOT NULL,
      net_rate_short REAL NOT NULL,
      open_interest_long REAL NOT NULL,
      open_interest_short REAL NOT NULL,
      spot_price REAL,
      timestamp INTEGER NOT NULL DEFAULT (unixepoch()),
      UNIQUE(market_token, timestamp)
    );
    CREATE INDEX IF NOT EXISTS idx_frs_market_time
      ON funding_rate_snapshots(market_token, timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_frs_symbol_time
      ON funding_rate_snapshots(token_symbol, timestamp DESC);

    CREATE TABLE IF NOT EXISTS simulated_venue_rates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token_symbol TEXT NOT NULL,
      venue_name TEXT NOT NULL,
      funding_rate REAL NOT NULL,
      annualized_rate REAL NOT NULL,
      timestamp INTEGER NOT NULL DEFAULT (unixepoch()),
      UNIQUE(token_symbol, venue_name, timestamp)
    );
    CREATE INDEX IF NOT EXISTS idx_svr_symbol_time
      ON simulated_venue_rates(token_symbol, timestamp DESC);

    CREATE TABLE IF NOT EXISTS opportunities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token_symbol TEXT NOT NULL,
      long_venue TEXT NOT NULL,
      short_venue TEXT NOT NULL,
      funding_spread REAL NOT NULL,
      entry_price REAL NOT NULL,
      estimated_apr REAL NOT NULL,
      risk_score REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      detected_at INTEGER NOT NULL DEFAULT (unixepoch()),
      expired_at INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_opp_status_time
      ON opportunities(status, detected_at DESC);

    CREATE TABLE IF NOT EXISTS paper_trades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      opportunity_id INTEGER REFERENCES opportunities(id),
      token_symbol TEXT NOT NULL,
      direction TEXT NOT NULL DEFAULT 'delta_neutral',
      long_venue TEXT,
      short_venue TEXT,
      entry_price REAL NOT NULL,
      current_price REAL,
      position_size_usd REAL NOT NULL,
      leverage REAL NOT NULL DEFAULT 1.0,
      funding_collected REAL NOT NULL DEFAULT 0,
      borrowing_paid REAL NOT NULL DEFAULT 0,
      unrealized_pnl REAL NOT NULL DEFAULT 0,
      realized_pnl REAL,
      status TEXT NOT NULL DEFAULT 'open',
      opened_at INTEGER NOT NULL DEFAULT (unixepoch()),
      closed_at INTEGER,
      close_reason TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_pt_status
      ON paper_trades(status, opened_at DESC);

    CREATE TABLE IF NOT EXISTS vault_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      total_value_usd REAL NOT NULL,
      cash_balance REAL NOT NULL,
      positions_value REAL NOT NULL,
      total_pnl REAL NOT NULL,
      cumulative_funding REAL NOT NULL,
      num_positions INTEGER NOT NULL,
      utilization_pct REAL NOT NULL,
      timestamp INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE INDEX IF NOT EXISTS idx_vs_time
      ON vault_snapshots(timestamp DESC);

    CREATE TABLE IF NOT EXISTS rebalance_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      trade_id INTEGER REFERENCES paper_trades(id),
      token_symbol TEXT NOT NULL,
      reason TEXT NOT NULL,
      old_size_usd REAL,
      new_size_usd REAL,
      timestamp INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS strategy_config (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      min_funding_spread REAL NOT NULL DEFAULT 0.01,
      max_position_size_usd REAL NOT NULL DEFAULT 10000,
      max_total_positions INTEGER NOT NULL DEFAULT 5,
      max_portfolio_allocation REAL NOT NULL DEFAULT 0.25,
      stop_loss_pct REAL NOT NULL DEFAULT 0.05,
      take_profit_pct REAL NOT NULL DEFAULT 0.10,
      rebalance_threshold REAL NOT NULL DEFAULT 0.005,
      vault_initial_capital REAL NOT NULL DEFAULT 100000,
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
    INSERT OR IGNORE INTO strategy_config (id) VALUES (1);

    CREATE TABLE IF NOT EXISTS signal_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token_symbol TEXT NOT NULL,
      signal_type TEXT NOT NULL,
      action TEXT NOT NULL,
      reason TEXT NOT NULL,
      funding_spread REAL,
      confidence REAL,
      executed INTEGER NOT NULL DEFAULT 0,
      timestamp INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE INDEX IF NOT EXISTS idx_sl_time
      ON signal_log(timestamp DESC);
  `)

  // Migration: add venue columns to paper_trades if missing
  try { db.exec(`ALTER TABLE paper_trades ADD COLUMN long_venue TEXT`) } catch { /* already exists */ }
  try { db.exec(`ALTER TABLE paper_trades ADD COLUMN short_venue TEXT`) } catch { /* already exists */ }
}
