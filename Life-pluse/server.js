const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const https = require('https');
const os = require('os');
const QRCode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DATA_FILE = path.join(__dirname, 'data', 'mockData.json');

// Get local IPv4 address for multi-device / mobile QR scanning
function getLocalIpAddress() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

const LOCAL_IP = getLocalIpAddress();

// Helper to read data
function readData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading mock data:', err);
    return { profiles: [], hospitals: [], firstAidGuides: [] };
  }
}

// Helper to write data
function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing mock data:', err);
  }
}

// Helper to fetch live real hospitals from OpenStreetMap (Nominatim API)
function fetchLiveHospitalsOSM(lat, lng) {
  return new Promise((resolve) => {
    const minLng = lng - 0.15;
    const maxLat = lat + 0.15;
    const maxLng = lng + 0.15;
    const minLat = lat - 0.15;
    const viewbox = `${minLng},${maxLat},${maxLng},${minLat}`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=hospital&viewbox=${viewbox}&bounded=1&limit=15`;

    const req = https.get(url, { headers: { 'User-Agent': 'LifePulseEmergencyApp/1.0 (contact@lifepulse.org)' } }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const items = JSON.parse(body);
          if (Array.isArray(items) && items.length > 0) {
            const realHospitals = items.map((item, index) => {
              const itemLat = parseFloat(item.lat);
              const itemLng = parseFloat(item.lon);
              const dist = calculateDistanceKm(lat, lng, itemLat, itemLng);
              
              const nameParts = item.display_name.split(',');
              const mainName = nameParts[0] || 'Emergency Care Hospital';
              const cleanAddress = nameParts.slice(1, 4).join(',').trim() || item.display_name;

              return {
                id: `osm-${item.place_id || index}`,
                name: mainName,
                address: cleanAddress,
                phone: '+91-112 (Emergency)',
                ambulancePhone: '108',
                distanceKm: parseFloat(dist.toFixed(1)),
                lat: itemLat,
                lng: itemLng,
                traumaCenter: true,
                bloodBank: true,
                open24x7: true,
                mapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${itemLat},${itemLng}`
              };
            }).sort((a, b) => a.distanceKm - b.distanceKm);

            return resolve(realHospitals);
          }
          resolve(null);
        } catch (e) {
          console.error('OSM parse error:', e);
          resolve(null);
        }
      });
    });

    req.on('error', (err) => {
      console.error('OSM request error:', err.message);
      resolve(null);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve(null);
    });
  });
}

// --- API ROUTES ---

// 1. Health & Server Info Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'LifePulse Emergency Network API',
    localIp: LOCAL_IP,
    port: PORT,
    accessUrls: {
      local: `http://localhost:${PORT}`,
      network: `http://${LOCAL_IP}:${PORT}`
    },
    timestamp: new Date()
  });
});

// 2. Save or Update Profile
app.post('/api/profile', (req, res) => {
  const data = readData();
  const profileData = req.body;

  if (!profileData.name || !profileData.primaryContactPhone || !profileData.bloodGroup) {
    return res.status(400).json({ error: 'Name, Blood Group, and Primary Contact Phone are required.' });
  }

  let profileId = profileData.id;
  let isNew = false;

  if (!profileId) {
    profileId = 'LP-' + Math.floor(100000 + Math.random() * 900000);
    isNew = true;
  }

  const cleanVehicle = (profileData.vehicleNumber || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

  const newProfile = {
    id: profileId,
    name: profileData.name.trim(),
    age: parseInt(profileData.age, 10) || 0,
    gender: profileData.gender || 'Not specified',
    bloodGroup: profileData.bloodGroup,
    vehicleNumber: cleanVehicle,
    secondaryVehicleNumber: (profileData.secondaryVehicleNumber || '').toUpperCase().replace(/[^A-Z0-9]/g, ''),
    primaryContactName: profileData.primaryContactName || 'Emergency Contact 1',
    primaryContactPhone: profileData.primaryContactPhone,
    secondaryContactName: profileData.secondaryContactName || '',
    secondaryContactPhone: profileData.secondaryContactPhone || '',
    allergies: profileData.allergies || 'None declared',
    chronicConditions: profileData.chronicConditions || 'None declared',
    currentMedications: profileData.currentMedications || 'None declared',
    organDonor: profileData.organDonor === true || profileData.organDonor === 'true',
    insuranceProvider: profileData.insuranceProvider || '',
    insurancePolicyNo: profileData.insurancePolicyNo || '',
    pin: profileData.pin || '1234',
    updatedAt: new Date().toISOString()
  };

  const existingIndex = data.profiles.findIndex(p => p.id === profileId);
  if (existingIndex >= 0) {
    data.profiles[existingIndex] = { ...data.profiles[existingIndex], ...newProfile };
  } else {
    data.profiles.push(newProfile);
  }

  writeData(data);

  res.json({
    success: true,
    message: isNew ? 'Emergency profile created successfully!' : 'Emergency profile updated successfully!',
    profile: newProfile
  });
});

// 3. Get Public Profile Card or Private Full Profile (with PIN)
app.get('/api/profile/:id', (req, res) => {
  const data = readData();
  const profile = data.profiles.find(p => p.id.toUpperCase() === req.params.id.toUpperCase());

  if (!profile) {
    return res.status(404).json({ error: 'Profile not found with ID: ' + req.params.id });
  }

  const pinProvided = req.query.pin;

  if (pinProvided && pinProvided === profile.pin) {
    return res.json({ accessType: 'FULL', profile });
  } else {
    const publicCard = {
      id: profile.id,
      name: profile.name,
      bloodGroup: profile.bloodGroup,
      vehicleNumber: profile.vehicleNumber,
      primaryContactName: profile.primaryContactName,
      primaryContactPhone: profile.primaryContactPhone,
      secondaryContactName: profile.secondaryContactName,
      secondaryContactPhone: profile.secondaryContactPhone,
      allergies: profile.allergies,
      chronicConditions: profile.chronicConditions,
      currentMedications: profile.currentMedications,
      organDonor: profile.organDonor,
      isPinProtected: !!profile.pin
    };
    return res.json({ accessType: 'PUBLIC_CARD', profile: publicCard });
  }
});

// 4. Search Profile by Vehicle Number or ID (Zero-Sticker Emergency Lookup)
app.get('/api/search', (req, res) => {
  const query = (req.query.query || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!query) {
    return res.status(400).json({ error: 'Search query (Vehicle number or Profile ID) is required.' });
  }

  const data = readData();

  const matches = data.profiles.filter(p => {
    const v1 = (p.vehicleNumber || '').toUpperCase();
    const v2 = (p.secondaryVehicleNumber || '').toUpperCase();
    const pid = (p.id || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const pName = (p.name || '').toUpperCase();

    return v1.includes(query) || v2.includes(query) || pid.includes(query) || pName.includes(query);
  });

  const results = matches.map(profile => ({
    id: profile.id,
    name: profile.name,
    bloodGroup: profile.bloodGroup,
    vehicleNumber: profile.vehicleNumber,
    primaryContactName: profile.primaryContactName,
    primaryContactPhone: profile.primaryContactPhone,
    secondaryContactName: profile.secondaryContactName,
    secondaryContactPhone: profile.secondaryContactPhone,
    allergies: profile.allergies,
    chronicConditions: profile.chronicConditions
  }));

  res.json({
    count: results.length,
    query: query,
    results: results
  });
});

// 5. Bystander SOS Dispatch Link Generator
app.post('/api/sos/dispatch', (req, res) => {
  const { profileId, bystanderLat, bystanderLng, bystanderNote } = req.body;
  const data = readData();
  const profile = data.profiles.find(p => p.id === profileId);

  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  const mapsLink = (bystanderLat && bystanderLng)
    ? `https://maps.google.com/?q=${bystanderLat},${bystanderLng}`
    : (bystanderNote || 'Location pending');

  const messageText = `🚨 EMERGENCY ALERT: ${profile.name} was involved in an incident. A bystander/first-responder scanned their LifePulse ID. Live Accident Location: ${mapsLink}. Medical Notes: Blood ${profile.bloodGroup}, Allergies: ${profile.allergies}.`;

  const cleanPhone = profile.primaryContactPhone.replace(/[^0-9]/g, '');
  const primaryWhatsapp = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(messageText)}`;
  const primarySMS = `sms:${profile.primaryContactPhone}?body=${encodeURIComponent(messageText)}`;

  res.json({
    success: true,
    victimName: profile.name,
    primaryContact: {
      name: profile.primaryContactName,
      phone: profile.primaryContactPhone,
      whatsappUrl: primaryWhatsapp,
      smsUrl: primarySMS
    },
    mapsLink,
    messageText
  });
});

// 6. Nearby Hospitals
app.get('/api/hospitals', async (req, res) => {
  const userLat = parseFloat(req.query.lat) || 12.9716;
  const userLng = parseFloat(req.query.lng) || 77.5946;

  const liveHospitals = await fetchLiveHospitalsOSM(userLat, userLng);

  if (liveHospitals && liveHospitals.length > 0) {
    return res.json({
      source: 'LIVE_GPS_MAPS',
      userLocation: { lat: userLat, lng: userLng },
      count: liveHospitals.length,
      hospitals: liveHospitals
    });
  }

  const data = readData();
  const fallbackHospitals = data.hospitals.map(h => {
    const d = calculateDistanceKm(userLat, userLng, h.lat, h.lng);
    return {
      ...h,
      distanceKm: parseFloat(d.toFixed(1)),
      mapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}`
    };
  }).sort((a, b) => a.distanceKm - b.distanceKm);

  res.json({
    source: 'CURATED_DIRECTORY',
    userLocation: { lat: userLat, lng: userLng },
    count: fallbackHospitals.length,
    hospitals: fallbackHospitals
  });
});

// 7. First Aid Guides
app.get('/api/firstaid', (req, res) => {
  const data = readData();
  res.json({ guides: data.firstAidGuides });
});

// 8. Generate QR Code API (Embeds Local LAN IP so Mobile Phones on Wi-Fi scan cleanly!)
app.get('/api/qr/:id', async (req, res) => {
  try {
    // If request host is localhost, replace with LAN IP so scanned phones can reach server over Wi-Fi
    const requestHost = req.get('host') || 'localhost:3000';
    let targetHost = requestHost;
    if (requestHost.includes('localhost') || requestHost.includes('127.0.0.1')) {
      targetHost = `${LOCAL_IP}:${PORT}`;
    }

    const fullUrl = `${req.protocol}://${targetHost}?emergency_id=${req.params.id}`;
    
    const qrImage = await QRCode.toDataURL(fullUrl, {
      color: { dark: '#d32f2f', light: '#ffffff' },
      width: 400,
      margin: 2
    });
    res.json({ qrDataUrl: qrImage, targetUrl: fullUrl, networkIp: LOCAL_IP });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Distance calculation helper (Haversine formula)
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Serve APK download via GitHub high-speed CDN redirect
app.get('/lifepulse-mobile.apk', (req, res) => {
  res.redirect('https://github.com/Kavin-124/lifepulse-emergency/raw/main/Life-pluse/public/lifepulse-mobile.apk');
});

// Fallback to SPA index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Listen on 0.0.0.0 to accept connections from mobile phones on LAN
app.listen(PORT, '0.0.0.0', () => {
  console.log(`LifePulse Server running!`);
  console.log(`Local Access:   http://localhost:${PORT}`);
  console.log(`Mobile/LAN Access: http://${LOCAL_IP}:${PORT}`);
});
