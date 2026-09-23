# n8n-nodes-chatsuite

This is an n8n community node. It lets you use the **ChatSuite Tenant API** in your n8n workflows.

ChatSuite is a WhatsApp-first customer communication platform: customers and their WhatsApp
groups, tickets, a RAG knowledge base, products, team members, automations and data collections.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

[Installation](#installation)
[Operations](#operations)
[Trigger](#trigger)
[Credentials](#credentials)
[Compatibility](#compatibility)
[Usage](#usage)
[Resources](#resources)
[Version history](#version-history)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

The **ChatSuite** node covers every endpoint of the ChatSuite Tenant API (126 operations across
20 resources), plus a generic **API Call** resource for endpoints added after this release.

| Resource | Operations |
|---|---|
| API Call | Request |
| Automation | Get Many, Get, Execute, Get Many Executions, Get Execution, Get Many Versions |
| Customer | Get Many, Get, Get by Email, Create, Update, Update Partially, Delete, Export, Import, WhatsApp Onboarding |
| Customer Category | Get Many, Get, Create, Update, Update Partially, Delete |
| Customer Knowledge | Get Many, Get, Create, Update Partially, Delete, Approve, Query |
| Data Collection | Get Many, Execute |
| Data Point | Get Many, Get, Create, Update, Update Partially, Delete |
| Data Point Value | Get Many, Write, Delete |
| Group | Update, Leave, Get Many Participants, Add Team Member, Set Team Member Admin, Remove Team Member, Set Ticket Detection |
| Group Category | Get Many, Get |
| Knowledge Document | Get Many, Get, Upload, Update Partially, Delete, Download, Reindex |
| Knowledge Information | Get Many, Get, Create, Update Partially, Delete, Approve, Reprocess, Query |
| Knowledge Q&A | Get Many, Get, Create, Update Partially, Delete, Approve, Reprocess, Get/Upload/Delete/Download Attachment |
| Message | Send, Send to Group, Send to Customer Groups, Get, Get Many History Entries |
| Product | Get Many, Get, Create, Update, Update Partially, Delete |
| Product Category | Get Many, Get, Create, Update, Update Partially, Delete |
| Team Member | Get Many, Get, Create, Update, Update Partially, Delete, Resend Welcome Email, Get Many Absences, Create/Update/Delete Absence |
| Ticket | Get Many, Get, Create, Update, Get Many States, Get Many History Entries, Get Many Messages, Get Many Notes, Create Note |
| Ticket Category | Get Many, Get, Create, Update, Delete |
| Webhook | Get Many, Create, Update, Delete, Test, Get Many Events |
| WhatsApp Channel | Get Many, Get, Get QR Code |

### Selecting records

Large collections (customers, tickets, products, team members) use a searchable
**From List / ID** picker. Everything else (categories, ticket states, channels, data points,
automations, knowledge entries, webhook events) is a dropdown filled straight from the API.

### Pagination

All "Get Many" operations offer **Return All** or a **Limit**. The node pages through the API's
`$skiptoken` cursor and returns the individual records, not the page envelope.

### Binary data

| Operation | Direction |
|---|---|
| Customer → Export | downloads the tenant CSV into a binary field |
| Customer → Import | uploads a CSV from a binary field |
| Knowledge Document → Upload / Download | PDF, DOCX, TXT or Markdown, max 32 MiB |
| Knowledge Q&A → Upload / Download Attachment | any attachment file |
| Message → Send with *Attach Files* | up to 10 binary fields, sent base64-encoded |

## Trigger

The **ChatSuite Trigger** node registers a real webhook subscription in ChatSuite when the
workflow is activated and removes it again on deactivation.

- **Events** are loaded live from `GET /api/v1/webhook/event` — currently `message.created`,
  `group_message.created`, `customer.onboarded` and `whatsapp_channel.connection_lost`.
- If the webhook URL or the selected events drift from the registered subscription, the
  trigger repairs the existing subscription instead of creating a second one.
- ChatSuite offers no server-side event filters. The **WhatsApp Channel Name** and
  **Customer Phone Number** options therefore drop non-matching events after delivery.
- **Output Raw Payload** emits the request body as a single item instead of fanning an
  array of events out into one item each.

## Credentials

1. In ChatSuite, go to **Settings → API** and create a tenant API key.
2. In n8n, create a **ChatSuite API** credential:
   - **API Base URL** — `https://api.chatsuite.com` (change it only for self-hosted or staging setups)
   - **API Key** — the key from step 1

The key is sent as the `X-API-Key` header on every request. See [CREDENTIALS.md](CREDENTIALS.md).

## Compatibility

Requires Node.js 20.15 or later and a recent n8n version (`n8nNodesApiVersion: 1`).
Developed and tested against the ChatSuite Tenant API `v1`.

## Usage

A few things that are easy to miss:

- **Customers are addressed by phone number**, products by product code, team members by
  e-mail, tickets by ticket number and categories by name — not by a UUID.
- **Update vs. Update Partially**: `Update` replaces the record (PUT), `Update Partially`
  sends only the fields you filled in (PATCH).
- **Ticket → Update** rejects *State Name* and *Is Closed* together; pick one.
- **Group operations** address a group by **Channel Name** plus either **Group ID**
  (`…@g.us`) or the exact **Group Name**.
- **Message → Send** needs either a message text or at least one attached file.

## Version history

### 0.1.0

Initial release: full coverage of the ChatSuite Tenant API, the webhook trigger node and
dynamic option loading for every list endpoint.

## 📬 About the Author

I’m **[Rezk Jörg Sebening](https://github.com/rjsebening)** – Automation & Systems Expert (DACH).
I build n8n nodes and process automation systems that help agencies, coaches, and service providers scale **without manual work**.

👉 Follow me on GitHub for new DACH integrations and automation templates.

## ⚖️ Legal Disclaimer

This community node is **not affiliated with ChatSuite** (no partnership, no sponsorship, no official endorsement).
It simply connects to publicly available API endpoints.

* Community developed & maintained
* For API-related issues → contact **ChatSuite Support**
* All trademarks & logos belong to their respective owners

## 📄 License

**MIT License**
Contributions and pull requests are welcome!