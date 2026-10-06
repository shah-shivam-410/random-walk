import { createMapsUrl, createWaypoint } from "/waypoint.js";

const startButton = document.querySelector("#start-walk");
const buttonLabel = document.querySelector(".button-label");
const status = document.querySelector("#status");
const result = document.querySelector("#result");
const missionText = document.querySelector("#mission");
const resultTitle = document.querySelector("#result-title");
const mapsLink = document.querySelector("#maps-link");

function getLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Location isn’t available in this browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      resolve,
      (error) => {
        const messages = {
          1: "Location permission was denied. Allow location access and try again.",
          2: "We couldn’t find your location. Try again somewhere with a clearer signal.",
          3: "Finding your location took too long. Try again.",
        };
        reject(new Error(messages[error.code] ?? "We couldn’t get your location. Try again."));
      },
      { enableHighAccuracy: false, timeout: 15_000, maximumAge: 60_000 },
    );
  });
}

startButton.addEventListener("click", async () => {
  const duration = Number(document.querySelector('input[name="duration"]:checked').value);
  startButton.disabled = true;
  buttonLabel.textContent = "Finding your way outside…";
  status.classList.remove("error");
  status.textContent = "Asking for your location, then finding a little mission.";
  result.hidden = true;

  try {
    const position = await getLocation();
    const origin = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
    const response = await fetch("/api/mission", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ duration }),
      signal: AbortSignal.timeout(90_000),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error ?? "Couldn’t create your walk. Please try again.");
    }

    const waypoint = createWaypoint(origin.latitude, origin.longitude, duration);
    resultTitle.textContent = `Your ${duration}-minute wander`;
    missionText.textContent = data.mission;
    mapsLink.href = createMapsUrl(origin, waypoint);
    result.hidden = false;
    status.textContent = "";
  } catch (error) {
    status.textContent = error.name === "TimeoutError"
      ? "Copilot took too long to respond. Please try again."
      : error.message || "Something went wrong. Please try again.";
    status.classList.add("error");
  } finally {
    startButton.disabled = false;
    buttonLabel.textContent = "Find my little adventure";
  }
});
