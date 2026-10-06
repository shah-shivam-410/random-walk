export function createWaypoint(latitude, longitude, duration, bearing = Math.random() * 360) {
  const distance = duration * 40;
  const angularDistance = distance / 6_371_000;
  const startLatitude = latitude * Math.PI / 180;
  const startLongitude = longitude * Math.PI / 180;
  const bearingRadians = bearing * Math.PI / 180;

  const destinationLatitude = Math.asin(
    Math.sin(startLatitude) * Math.cos(angularDistance)
      + Math.cos(startLatitude) * Math.sin(angularDistance) * Math.cos(bearingRadians),
  );
  const destinationLongitude = startLongitude + Math.atan2(
    Math.sin(bearingRadians) * Math.sin(angularDistance) * Math.cos(startLatitude),
    Math.cos(angularDistance) - Math.sin(startLatitude) * Math.sin(destinationLatitude),
  );

  return {
    latitude: destinationLatitude * 180 / Math.PI,
    longitude: ((destinationLongitude * 180 / Math.PI + 540) % 360) - 180,
  };
}

export function createMapsUrl(origin, destination) {
  const params = new URLSearchParams({
    api: "1",
    origin: `${origin.latitude},${origin.longitude}`,
    destination: `${destination.latitude},${destination.longitude}`,
    travelmode: "walking",
  });
  return `https://www.google.com/maps/dir/?${params}`;
}
