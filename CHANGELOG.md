# Changelog

All notable changes to this project are documented in this file.

## 0.1.0

Initial release.

### Added

- **ChatSuite node** covering all 126 operations of the ChatSuite Tenant API v1 across
  20 resources (Automation, Customer, Customer Category, Customer Knowledge, Data Collection,
  Data Point, Data Point Value, Group, Group Category, Knowledge Document,
  Knowledge Information, Knowledge Q&A, Message, Product, Product Category, Team Member,
  Ticket, Ticket Category, Webhook, WhatsApp Channel), plus a generic **API Call** resource.
- **ChatSuite Trigger node** with real webhook subscriptions: it registers on activation,
  repairs a drifted subscription instead of duplicating it, and deletes it on deactivation.
  Events are loaded live from the API; channel and customer filters are applied on delivery.
- **Dynamic option loading** for every list endpoint: 23 `loadOptions` dropdowns and
  4 searchable `listSearch` pickers (customers, tickets, products, team members).
- **Cursor pagination** via `$skiptoken` behind the usual *Return All* / *Limit* pair.
- **Binary support** for the customer CSV export/import, knowledge document upload/download,
  Q&A attachment upload/download, and file attachments on outgoing messages.
