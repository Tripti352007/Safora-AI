import express from 'express';
import cors from 'cors';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const volunteers = require('./data/volunteers.json');
const safeZones = require('./data/safeZones.json');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Get verified NSS & NGO volunteers
app.get('/api/volunteers', (req, res) => {
  const { category, type } = req.query;
  let filtered = [...volunteers];
  if (type) {
    filtered = filtered.filter(v => v.type.toLowerCase() === type.toLowerCase());
  }
  res.json({ success: true, count: filtered.length, data: filtered });
});

// Get Safe Zones
app.get('/api/safe-zones', (req, res) => {
  res.json({ success: true, count: safeZones.length, data: safeZones });
});

// AI Risk & Substitute Recommendation Engine Endpoint
app.post('/api/analyze-risk', (req, res) => {
  const { problemType, locationContext, demographic, userNote, language } = req.body;
  const isHindi = language === 'hi';

  let riskLevel = 'MEDIUM'; // LOW, MEDIUM, HIGH, CRITICAL
  let riskScore = 65;
  let substituteSolution = '';
  let volunteerRecommendation = volunteers[0];
  let recommendedHelpline = '112';
  let panicJokes = [];

  if (demographic === 'women') {
    recommendedHelpline = '1091 (Women Helpline)';
  } else if (demographic === 'child') {
    recommendedHelpline = '1098 (Childline)';
  } else if (demographic === 'elder') {
    recommendedHelpline = '14567 (Senior Citizen Helpline)';
  }

  // Evaluate problem type
  switch (problemType) {
    case 'lonely_place':
      riskLevel = 'HIGH';
      riskScore = 85;
      substituteSolution = isHindi
        ? `⚠️ सुनसान इलाका चेतावनी! \n1. पास के NSS स्वयंसेवक (${volunteerRecommendation.name} - ${volunteerRecommendation.phone}) से तुरंत संपर्क करें।\n2. मुख्य उजली सड़क (Main Illuminated Road - 150m दूर) पर शिफ्ट हो जाएं।\n3. Safora AI का 'Fake Call' फीचर ऑन करें ताकि आप कॉल पर बात करते हुए दिखें।`
        : `⚠️ Isolated Area Alert! \n1. Contact nearest NSS Volunteer (${volunteerRecommendation.name} - ${volunteerRecommendation.phone}) immediately.\n2. Divert path to Main Illuminated Road (150m away).\n3. Enable Safora AI 'Fake Call' mode so you appear actively connected on a phone call.`;
      break;

    case 'crowded_place':
      riskLevel = 'MEDIUM';
      riskScore = 55;
      substituteSolution = isHindi
        ? `👥 भीड़भाड़ वाला इलाका सहायता:\n1. घबराएं नहीं। अपने बैग/कीमती सामान को आगे संभालें।\n2. पास के मेट्रो सहायता केंद्र या NSS बूथ की ओर बढ़ें।\n3. यदि आप तनाव महसूस कर रहे हैं, तो नीचे AI डी-स्ट्रेस मोड चालू करें।`
        : `👥 Crowded Area Support:\n1. Stay calm. Keep personal belongings in front.\n2. Move towards Metro Assistance Desk or NSS Information Booth.\n3. If feeling anxious, activate AI De-stress mode below.`;
      panicJokes = isHindi ? [
        "अगर कोई भीड़ में आपको परेशान करे, तो जोर से बोलिए: 'अरे भैया! आपने मेरा 500 रुपये का नोट क्यों चुराया?' - पूरी भीड़ उसी को घूरने लगेगी! 😅",
        "शांत रहें! भीड़ में सबसे बड़ी ताकत यह है कि हर तरफ लोग हैं - एक तेज आवाज ही सुरक्षा है!"
      ] : [
        "If someone makes you uncomfortable in a crowd, loudly yell: 'Hey! Did you just drop a 500 rupee note?' - Everyone will look down instantly! 😅",
        "Keep calm! In a crowd, your voice is your super-strength. Speak with confidence and step towards an open shop or guard desk."
      ];
      break;

    case 'following_stalking':
      riskLevel = 'CRITICAL';
      riskScore = 95;
      substituteSolution = isHindi
        ? `🚨 पीछा किए जाने की तुरंत चेतावनी!\n1. तुरंत 1-Click SOS बटन दबाएं और निकटतम दुकान/दवाखाने या पुलिस स्टेशन में प्रवेश करें।\n2. NSS लीड प्रिया शर्मा (+91 98765 43210) आपकी लोकेशन ट्रैकिंग चालू कर रही हैं।\n3. रुको मत, किसी भी भीड़-भाड़ वाली दुकान में चले जाओ।`
        : `🚨 Critical Stalking Alert!\n1. Press 1-Click SOS immediately and step into any open shop/pharmacy or police booth.\n2. NSS Lead Priya Sharma (+91 98765 43210) has received live signal.\n3. Do not stop in dark alleys. Enter the nearest lit establishment immediately.`;
      break;

    case 'medical_fall':
      riskLevel = 'HIGH';
      riskScore = 80;
      substituteSolution = isHindi
        ? `🚑 मेडिकल इमरजेंसी सहायता:\n1. 112 / 102 एम्बुलेंस हेल्पलाइन को कॉल सिंक भेज दिया गया है।\n2. पास की NGO बुजुर्ग देखभाल विशेषज्ञ मीरा पटेल (+91 98990 11223) को अलर्ट भेजा गया है।`
        : `🚑 Medical Emergency Support:\n1. Emergency sync initiated for 112 Ambulance response.\n2. Alert dispatched to nearby Elder Care Medic Meera Patel (+91 98990 11223).`;
      break;

    default:
      riskLevel = 'MEDIUM';
      riskScore = 60;
      substituteSolution = isHindi
        ? `🛡️ साफ़ोरा सुरक्षा AI सलाह:\nअपने आसपास का ध्यान रखें, अपनी लाइव लोकेशन किसी विश्वसनीय व्यक्ति या हमारे NSS स्वयंसेवक के साथ शेयर करें।`
        : `🛡️ Safora Safety AI Advisory:\nStay vigilant of your surroundings. Share your live location link with a trusted contact or our active NSS Volunteer network.`;
      break;
  }

  res.json({
    success: true,
    riskLevel,
    riskScore,
    demographic,
    recommendedHelpline,
    substituteSolution,
    volunteerRecommendation,
    panicJokes,
    predictiveAlert: {
      title: isHindi ? "साफ़ोरा पूर्व चेतावनी (Predictive Alert)" : "Safora Predictive Alert",
      message: isHindi 
        ? `सावधान: 200m आगे प्रकाश व्यवस्था कम है। सुरक्षित मार्ग सुझाई गई है।`
        : `Warning: Low lighting detected 200m ahead. Safe illuminated alternative plotted.`,
      timestamp: new Date().toISOString()
    }
  });
});

// Emergency Alert Dispatch Simulator
app.post('/api/emergency-alert', (req, res) => {
  const { userLocation, demographic, message } = req.body;
  res.json({
    success: true,
    dispatchedTo: [
      "National Emergency Response System (112)",
      "Women/Child Helpline Hub",
      "Nearest NSS Volunteer Unit (IIT Delhi Circle)",
      "Emergency Contacts (Simulated SMS Dispatched)"
    ],
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Safora AI Safety Backend running on port ${PORT}`);
});
