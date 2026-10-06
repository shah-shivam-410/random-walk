import test from "node:test";
import assert from "node:assert/strict";
import { createMapsUrl, createWaypoint } from "../public/waypoint.js";

test("creates a waypoint about half a 5-minute walk away", () => {
  const origin = { latitude: 0, longitude: 0 };
  const waypoint = createWaypoint(origin.latitude, origin.longitude, 5, 0);
  const distance = waypoint.latitude * Math.PI / 180 * 6_371_000;
  assert.ok(Math.abs(distance - 200) < 1);
});

test("keeps destination longitude inside valid bounds across the date line", () => {
  const waypoint = createWaypoint(0, 179.999, 5, 90);
  assert.ok(waypoint.longitude >= -180 && waypoint.longitude <= 180);
});

test("builds a walking-directions URL with origin and destination", () => {
  const url = new URL(createMapsUrl(
    { latitude: 10, longitude: 20 },
    { latitude: 10.1, longitude: 20.1 },
  ));
  assert.equal(url.hostname, "www.google.com");
  assert.equal(url.searchParams.get("travelmode"), "walking");
  assert.equal(url.searchParams.get("origin"), "10,20");
  assert.equal(url.searchParams.get("destination"), "10.1,20.1");
});
