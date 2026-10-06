# Touch Grass: Random Walk MVP

## Problem and approach

Build a small browser app that helps someone start a spontaneous outdoor walk. The user picks a walk duration, shares their current location, and gets a nearby waypoint, a Google Maps walking-directions link, and one short outdoor mission. Generate the mission at runtime with GitHub Copilot via the Copilot SDK in a minimal Node.js backend.

## Scope and decisions

- Use plain HTML, CSS, and browser JavaScript with a small Node.js server; avoid a frontend framework and database.
- Use browser geolocation with explicit permission. Derive a nearby waypoint from the user's coordinates and selected duration; hand off route calculation to Google Maps via a directions URL rather than building routing or using a Maps API key.
- Call the Copilot SDK from the server, not the browser, to generate one brief, safe, screen-light mission. Keep prompts bounded and return a clear error if Copilot is unavailable; do not silently imply AI generated a fallback mission.
- Require the user to have Copilot CLI authentication and an eligible Copilot subscription. Keep credentials out of browser code and source control.
- Keep the experience to one screen and one primary action: choose 5/10/20 minutes, start, view the waypoint and mission, then put the phone away.
- Out of scope: accounts, saved history, custom map rendering, route optimization, weather/parks integrations, and offline AI.

## Notes

- The workspace appears empty, so the implementation can establish the minimal project structure.
- The official GitHub Copilot SDK describes programmatic access to Copilot's agent runtime through an SDK/CLI server; this is distinct from calling the Copilot Chat UI as a web API.
- The two-hour target depends on Node.js being available and the user already being able to authenticate Copilot CLI. If authentication or SDK setup blocks the demo, keep a clearly labeled local demo mode rather than disguising a canned result as generated.
- DevRelay community/challenge search tools were not available in this session, so no community or active-challenge claims are included.