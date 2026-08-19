import fetch from 'node-fetch';
import { calculateDistanceKm } from './locationService.js';

// Query Overpass API for REAL nearby hospitals and police stations around live GPS
export async function fetchNearbyEmergencyPlaces(lat, lng, radiusMeters = 4000) {
  if (!lat || !lng) return [];

  const overpassQuery = `
    [out:json][timeout:10];
    (
      node["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
      node["amenity"="police"](around:${radiusMeters},${lat},${lng});
      way["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
      way["amenity"="police"](around:${radiusMeters},${lat},${lng});
    );
    out center 6;
  `;

  try {
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'SaforaAISafetyApp/1.0' }
    });
    if (!response.ok) throw new Error("Overpass API error");
    const data = await response.json();

    if (data && data.elements && data.elements.length > 0) {
      return data.elements.map((el, idx) => {
        const itemLat = el.lat || (el.center && el.center.lat) || lat;
        const itemLng = el.lon || (el.center && el.center.lon) || lng;
        const distKm = calculateDistanceKm(lat, lng, itemLat, itemLng);
        const name = el.tags?.name || (el.tags?.amenity === 'hospital' ? 'Emergency Medical Center' : 'Police Assistance Desk');
        const type = el.tags?.amenity === 'hospital' ? 'Hospital' : 'Police Station';
        const helpline = type === 'Hospital' ? '112 / 102' : '112 / 1091';

        return {
          id: `real-place-${el.id || idx}`,
          name,
          type,
          helpline,
          lat: itemLat,
          lng: itemLng,
          distanceKm: distKm,
          is24x7: true
        };
      }).sort((a, b) => a.distanceKm - b.distanceKm);
    }
    return [];
  } catch (err) {
    console.warn("Overpass API warning:", err.message);
    return [];
  }
}
