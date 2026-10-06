# Random Walk: A Tiny AI Nudge to Get Outside

*This is a submission for the* [*Hacktoberfest Open-Source AI Challenge Week 1: Touch Grass*](https://dev.to/challenges/hacktoberfest-week1-2026-10-05)

## What I Built

I built **Random Walk**, a small app that turns a few minutes of free time into a reason to step outside. Choose a 5-, 10-, or 20-minute walk, share your location with the browser, and the app suggests a nearby waypoint, creates a Google Maps walking-directions link, and asks AI for a short outdoor observation mission.

It’s for anyone who wants a low-effort nudge to explore their neighborhood. The screen helps start the walk, then gets out of the way.

## Demo

[Add deployed demo link before publishing]

The app currently runs locally; replace this placeholder with a deployed link or video demo when available.

## Code

[Add public GitHub repository link before publishing]

## How I Built It

The interface uses plain HTML, CSS, and browser JavaScript, with a small Node.js server. The browser asks permission for geolocation, calculates an approximate waypoint in a random direction based on the selected duration, and opens Google Maps walking directions when the user chooses to view them.

For the mission, the server uses the **[GitHub Copilot SDK](https://github.com/github/copilot-sdk)**, an MIT-licensed open-source SDK, to prompt Copilot for one brief, safe, screen-free observation activity. The model is hosted by Copilot; this project does not run an open-weight model or perform local inference. The server keeps Copilot credentials out of browser code. The user’s coordinates stay in the browser and are not sent to the mission-generation endpoint.

## Why Does Open Innovation Matter?

The open-source SDK made it possible to inspect and integrate an agent runtime directly into a small Node.js app, rather than making the experience depend on the Copilot Chat interface. That let me keep the mission generation on the server, shape its prompt around a short outdoor activity, and keep location data out of that AI request.

The model itself is still Copilot-hosted, so this MVP depends on Copilot access and is not an example of open-weight or offline AI. Keeping the integration layer small and explicit gives the project room to explore other providers or local models later, without changing the simple walk-first experience.
