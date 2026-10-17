# Soko Langu — Phase 2

Phase 2 expands the offline LAN business system with purchasing, suppliers, stock movements, returns, users/RBAC, cashbook, audit logs, backups and date-based reporting.

## Architecture
- Windows PC/server: Node.js + Express + SQLite
- LAN clients: browser/phone/Hisense VIDAA TV
- No CDN/runtime internet dependency
- Currency: TZS

## Planned modules
- Suppliers and purchasing
- Stock movements
- Sales returns
- Users and role-based access
- Cashbook
- Audit trail
- Backup/restore
- Date-filtered reports
- Accounting foundations

Implementation is intentionally incremental so the existing working Phase 1 remains usable while each module is added and verified.
