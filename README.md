# Soko Langu — Offline Business System

Offline-first LAN business management system for a Windows PC/server and browsers/Hisense VIDAA TV on the same Wi‑Fi network.

## Included
- Dashboard
- Products, SKU/barcode fields and stock
- Sales/POS
- Buyer requests
- Customers
- Suppliers and purchases
- Stock movements and sales returns
- Expenses and Cashbook
- Users, roles and local login
- Audit log
- Accounting: chart of accounts, journal, trial balance, P&L, balance sheet and cash flow
- Date-based reports
- SQLite database
- Backup endpoint
- TV display mode
- LAN API
- Swahili-first responsive UI

## Run
1. Install Node.js 20+ on the server PC.
2. Run `npm install` once while preparing the PC.
3. Run `npm start`.
4. Open `http://SERVER-IP:8080` from phones/PC/TV on the same Wi‑Fi.

The database is stored locally in `data/soko_langu.db`.

## Accounting API
- `GET /api/accounting/accounts`
- `POST /api/accounting/accounts`
- `GET /api/accounting/journal`
- `POST /api/accounting/journal`
- `GET /api/accounting/trial-balance`
- `GET /api/accounting/pnl?from=YYYY-MM-DD&to=YYYY-MM-DD`
- `GET /api/accounting/balance-sheet`
- `GET /api/accounting/cash-flow?from=YYYY-MM-DD&to=YYYY-MM-DD`

## Backup
Use `GET /api/backup` from the LAN to download the current SQLite database after a WAL checkpoint.
