# ChatSuite API credentials

The ChatSuite node and the ChatSuite Trigger node both authenticate with a single
**ChatSuite API** credential.

## Prerequisites

A ChatSuite tenant with access to **Settings → API**.

## Creating the API key

1. Open ChatSuite and go to **Settings → API**.
2. Create a new tenant API key and copy it. It is shown only once.

## Setting up the credential in n8n

| Field | Value |
|---|---|
| **API Base URL** | `https://api.chatsuite.com` |
| **API Key** | the key from the step above |

The base URL is the host only — the node appends the `/api/v1/…` paths itself. A trailing
slash and an accidentally pasted `/api` or `/api/v1` suffix are stripped automatically, so
`https://api.chatsuite.com/api/v1/` works as well.

Change the base URL only when you run ChatSuite on your own domain or against a staging
environment.

## How requests are authenticated

The key is sent as the `X-API-Key` header on every request. It is stored encrypted by n8n and
is never written to the workflow or to logs.

## Testing the credential

Use **Test** in the credential dialog. It calls `GET /api/v1/webhook/event`, the cheapest
authenticated endpoint of the API; a green result means the key is valid for your tenant.

## Scope and rate limits

The key is scoped to one tenant. Every operation of the node — and every webhook subscription
the trigger creates — acts inside that tenant only.
