---
draft: true
title: "Open Finance Directory MCP Server"
type: utility
summary: "An MCP server that gives any AI coding assistant real-time access to the UAE Open Finance Trust Framework Directory — look up participants, API families, and sandbox endpoints."
date: 2026-02-05

useCases:
  - data
  - onboarding
audience:
  - developer
  - tpp
maturity: demo
license: mit

source:
  platform: github

authoredByContributor: true
contributor: "OpenFinance-OS Community"
contributorUrl: https://github.com/openfinance-os

links:
  github: https://github.com/openfinance-os/directory-mcp
  docs: https://github.com/openfinance-os/directory-mcp/wiki

aiTool:
  category: mcp-server
  platforms:
    - mcp
    - claude-code
    - continue-dev
  mcpTransport: http
  mcpTools:
    - lookup_participant
    - list_participants_by_role
    - get_api_families
    - check_participant_status
    - get_sandbox_endpoints
  installCommands:
    - platform: claude-code
      command: "claude mcp add --transport http of-directory https://mcp.openfinance.ae/"
      label: "Claude Code"
    - platform: mcp
      command: "npx @openfinance-os/directory-mcp"
      label: "Any MCP Client (stdio)"
  accelerates:
    - participant-onboarding
    - api-integration
    - sandbox-testing
  prerequisites: "Node 18+"
  version: "0.3.0"
---

## What It Provides

This MCP server wraps the Raidiam Trust Framework Directory API, letting your AI coding assistant query participant data in real time during development sessions.

### Available Tools

| Tool | Description |
|------|-------------|
| `lookup_participant` | Look up a specific participant by name or ID |
| `list_participants_by_role` | List all ASPSPs, TPPs, or other roles |
| `get_api_families` | Show which API families a participant supports |
| `check_participant_status` | Check if a participant is active in production or sandbox |
| `get_sandbox_endpoints` | Get sandbox API endpoints for a given ASPSP |

## Example Conversations

Once installed, you can ask your AI assistant:

- "Which ASPSPs support the payment initiation API?"
- "What's the sandbox endpoint for ADCB?"
- "List all active TPPs in the directory"
- "Does Emirates NBD support CIBA authentication?"
- "Show me all participants registered in both production and sandbox"

The AI will call the MCP server to fetch live data and incorporate it into its responses.

## Setup

### Claude Code

```bash
claude mcp add --transport http of-directory https://mcp.openfinance.ae/
```

### Any MCP-Compatible Client (stdio)

```bash
npx @openfinance-os/directory-mcp
```

Or add to your MCP configuration file:

```json
{
  "mcpServers": {
    "of-directory": {
      "command": "npx",
      "args": ["@openfinance-os/directory-mcp"]
    }
  }
}
```

## Data Source

The server queries the live Raidiam Trust Framework Directory at `data.directory.openfinance.ae`. Data is cached for 5 minutes to avoid rate limiting.
