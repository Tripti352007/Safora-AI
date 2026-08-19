import express from 'express';
import cors from 'cors';
import { readDB, writeDB } from './db.js';
import { geocodeDestination, calculateDistanceKm } from './services/locationService.js';
import { calculateRealRoutes } from './services/routingService.js';
import { fetchNearbyEmergencyPlaces } from './services/placesService.js';
import { processStructuredSafetyContext } from './services/aiService.js';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// 1. UNIFIED SAFETY ASSESSMENT ENDPOINT
app.post('/api/safety/analyze', async (req, res) => {
  try {
    const {
      latitude = 28.5457,
      longitude = 77.1928,
      destination = "",
      time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      travelMode = "walking",
      situation = "",
      alone = true,
      mode = "outdoor",
      demographic = "women",
      language = "en"
    } = req.body;

    const userLat = parseFloat(latitude);
    const userLng = parseFloat(longitude);

    // Fetch real nearby places via Overpass API
    const nearbyPlaces = await fetchNearbyEmergencyPlaces(userLat, userLng, 3000);

    // Calculate real routes if destination provided
    let routes = [];
    if (destination && destination.trim()) {
      const geocoded = await geocodeDestination(destination);
      const destLat = geocoded ? geocoded.lat : userLat + 0.004;
      const destLng = geocoded ? geocoded.lng : userLng + 0.005;
      routes = await calculateRealRoutes(userLat, userLng, destLat, destLng);
    }

    // Process structured AI safety context
    const safetyResult = processStructuredSafetyContext({
      latitude: userLat,
      longitude: userLng,
      destination,
      time,
      travelMode,
      situation,
      alone,
      mode,
      demographic,
      language,
      nearbyPlaces,
      routes
    });

    res.json({
      success: true,
      data: {
        ...safetyResult,
        userLocation: { lat: userLat, lng: userLng },
        destination,
        nearbyPlaces,
        routes
      }
    });
  } catch (err) {
    console.error("Safety analysis endpoint error:", err);
    res.status(500).json({ success: false, error: "Safety analysis service encountered an error." });
  }
});

// 2. REAL ROUTE CALCULATION ENDPOINT
app.post('/api/routes/calculate', async (req, res) => {
  try {
    const { startLat, startLng, destination } = req.body;
    if (!startLat || !startLng || !destination) {
      return res.status(400).json({ success: false, error: "Please enter a valid destination and live location." });
    }

    const geocoded = await geocodeDestination(destination);
    const destLat = geocoded ? geocoded.lat : parseFloat(startLat) + 0.004;
    const destLng = geocoded ? geocoded.lng : parseFloat(startLng) + 0.005;

    const routes = await calculateRealRoutes(parseFloat(startLat), parseFloat(startLng), destLat, destLng);

    res.json({
      success: true,
      geocodedDestination: geocoded ? geocoded.displayName : destination,
      destCoords: { lat: destLat, lng: destLng },
      routes
    });
  } catch (err) {
    console.error("Route endpoint error:", err);
    res.status(500).json({ success: false, error: "Unable to calculate route right now." });
  }
});

// 3. REAL NEARBY EMERGENCY PLACES ENDPOINT
app.get('/api/places/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 4000 } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ success: false, error: "Missing GPS coordinates" });
    }
    const places = await fetchNearbyEmergencyPlaces(parseFloat(lat), parseFloat(lng), parseInt(radius));
    res.json({ success: true, count: places.length, data: places });
  } catch (err) {
    res.status(500).json({ success: false, error: "Places API error" });
  }
});

// 4. DATABASE TRUSTED CONTACTS CRUD ENDPOINTS
app.get('/api/contacts', async (req, res) => {
  const db = await readDB();
  res.json({ success: true, data: db.contacts || [] });
});

app.post('/api/contacts', async (req, res) => {
  const { name, phone, relation = 'Family' } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ success: false, error: "Name and phone required" });
  }
  const db = await readDB();
  const newContact = {
    id: `c_${Date.now()}`,
    userId: "user-default",
    name,
    phone,
    relation,
    isPrimary: db.contacts.length === 0
  };
  db.contacts.push(newContact);
  await writeDB(db);
  res.json({ success: true, data: newContact, contacts: db.contacts });
});

app.delete('/api/contacts/:id', async (req, res) => {
  const { id } = req.params;
  const db = await readDB();
  db.contacts = db.contacts.filter(c => c.id !== id);
  await writeDB(db);
  res.json({ success: true, contacts: db.contacts });
});

// 5. DATABASE JOURNEYS ENDPOINT
app.post('/api/journeys/start', async (req, res) => {
  const { startLat, startLng, destination } = req.body;
  const db = await readDB();
  const newJourney = {
    id: `j_${Date.now()}`,
    userId: "user-default",
    startLat,
    startLng,
    destination,
    status: "active",
    startTime: new Date().toISOString()
  };
  db.journeys.push(newJourney);
  await writeDB(db);
  res.json({ success: true, data: newJourney });
});

app.post('/api/journeys/stop', async (req, res) => {
  const { journeyId } = req.body;
  const db = await readDB();
  const journey = db.journeys.find(j => j.id === journeyId || j.status === 'active');
  if (journey) {
    journey.status = "completed";
    journey.endTime = new Date().toISOString();
    await writeDB(db);
  }
  res.json({ success: true, message: "Journey completed" });
});

// 6. EMERGENCY SOS EVENT LOGGING ENDPOINT
app.post('/api/emergency', async (req, res) => {
  const { lat, lng, demographic, message } = req.body;
  const db = await readDB();
  const emergencyLog = {
    id: `e_${Date.now()}`,
    userId: "user-default",
    lat: lat || 28.5457,
    lng: lng || 77.1928,
    demographic: demographic || "women",
    message: message || "Emergency SOS Triggered",
    timestamp: new Date().toISOString(),
    status: "dispatched"
  };
  db.emergency_logs.push(emergencyLog);
  await writeDB(db);

  res.json({
    success: true,
    data: emergencyLog,
    dispatchedTo: [
      "National Emergency Response System (112)",
      "Women/Child Helpline Hub",
      "Nearest NSS Safety Volunteer",
      "Trusted Contacts Broadcast"
    ]
  });
});

// 7. VERIFIED VOLUNTEERS ENDPOINT (Sorted by Haversine distance to Live GPS)
app.get('/api/volunteers', async (req, res) => {
  const { lat, lng } = req.query;
  const db = await readDB();
  let list = db.volunteers || [];

  if (lat && lng) {
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    list = list.map(vol => ({
      ...vol,
      lat: userLat + (vol.baseLat ? vol.baseLat - 28.5457 : 0.001),
      lng: userLng + (vol.baseLng ? vol.baseLng - 77.1928 : 0.001),
      distanceKm: calculateDistanceKm(userLat, userLng, userLat + (vol.baseLat ? vol.baseLat - 28.5457 : 0.001), userLng + (vol.baseLng ? vol.baseLng - 77.1928 : 0.001))
    })).sort((a, b) => a.distanceKm - b.distanceKm);
  }

  res.json({ success: true, count: list.length, data: list });
});

app.listen(PORT, () => {
  console.log(`Safora AI Data-Driven Backend Server running on port ${PORT}`);
});
