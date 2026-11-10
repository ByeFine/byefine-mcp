# ByeFine MCP servers

[![mcptry](https://mcptry.com/badge/com.byefine/byefine)](https://mcptry.com/servers/com.byefine/byefine)
[![mcptry](https://mcptry.com/badge/com.byefine/parking-guides)](https://mcptry.com/servers/com.byefine/parking-guides)

[ByeFine](https://byefine.com) checks UK parking tickets and penalty notices for free, then writes and sends the appeal. It runs two remote MCP servers (Streamable HTTP, protocol 2025-06-18). This repository holds their registry entries and the source of the protocol handler and of the free tools.

| Server | Address | Key |
| --- | --- | --- |
| `com.byefine/byefine` | `https://byefine.com/api/mcp` | Optional. The free tools work without one. Checking a notice and your own cases need your ByeFine API key (`Authorization: Bearer ...`, made on your account page) or signing in from your app. |
| `com.byefine/parking-guides` | `https://byefine.com/api/public/mcp` | None. Free tools only. |

## Add it

```bash
claude mcp add --transport http byefine https://byefine.com/api/mcp
```

```bash
claude mcp add --transport http parking-guides https://byefine.com/api/public/mcp
```

Any other MCP client: add a remote (HTTP) server with the address above.

## Tools

Free, read only, on both servers:

| Tool | What it does |
| --- | --- |
| `search_guides`, `get_guide`, `list_guides` | ByeFine's plain-English guides to UK parking tickets and appeals, as published on [byefine.com/guides](https://byefine.com/guides), with their sources. |
| `explain_contravention_code` | A council PCN contravention code: what it means, higher or lower level, suffix letters, and the grounds the law allows for formal representations in England. |
| `search_contravention_codes` | Finds a code from plain words ("disabled bay", "yellow box junction"). |
| `calculate_deadlines` | The time limits the law sets in England for a council PCN or a private parking charge, from the dates printed on it, each with its legal source. Every date errs early. |

With a key or sign-in, on `com.byefine/byefine` only:

| Tool | What it does |
| --- | --- |
| `check_notice` | Reads a photo or PDF of a notice and says, free, whether it is worth challenging. |
| `list_cases`, `get_case` | Your cases and where each appeal stands. |
| `go_ahead` | Starts the appeal. The driver gives permission on the case page before anything is filed. |

## What is in here

- `src/mcp-core.ts`: the stateless JSON-RPC handler both servers use.
- `src/pcn-codes.ts`: council contravention codes from the standard list London Councils publishes. Charge level only: amounts depend on the council and are printed on the notice.
- `src/pcn-deadlines.ts`, `src/day-count.ts`: the deadline calculator. Sources: SI 2022/71 reg 20, SI 2022/576 regs 5 and 6, the DfT statutory guidance on enforcing parking restrictions, the Protection of Freedoms Act 2012 Schedule 4 paras 8 and 9, the Private Parking Sector Single Code of Practice, and POPLA's and the IAS's own pages.
- `registry/`: the entries published to the [official MCP registry](https://registry.modelcontextprotocol.io).

The guide text and the account tools run inside the ByeFine web app, which is not open source. These files are copied from it, so they match what the servers run.

```bash
npm install && npm test
```

General information for England, not legal advice. Always go by the dates and amounts printed on the notice.

Questions: support@byefine.com
