// Structured AI Safety Context & Non-Overreacting Reasoning Engine

export function processStructuredSafetyContext({
  latitude,
  longitude,
  destination,
  time,
  travelMode,
  situation,
  alone,
  mode,
  demographic,
  language = 'en',
  nearbyPlaces = [],
  routes = []
}) {
  const isHindi = language === 'hi';
  const msgLower = (situation || '').toLowerCase().trim();

  let riskLevel = 'moderate'; // 'low' | 'moderate' | 'high' | 'emergency'
  let riskScore = 72;
  let reason = '';
  let recommendation = '';
  let saferAlternative = '';
  let steps = [];

  const hour = new Date().getHours();
  const isNight = hour >= 21 || hour < 6;

  // 1. ALONE AT HOME MODE (No walking routes or outdoor advice unless requested)
  if (mode === 'home' || msgLower.includes('noise') || msgLower.includes('doorbell') || msgLower.includes('ghar') || msgLower.includes('home')) {
    if (msgLower.includes('doorbell') || msgLower.includes('door') || msgLower.includes('घंटी') || msgLower.includes('दरवाजा')) {
      riskLevel = 'moderate';
      riskScore = 68;
      reason = isHindi
        ? `घर पर अकेले होने और रात के समय घंटी बजने का संकेत (GPS: ${latitude.toFixed(3)}, ${longitude.toFixed(3)})।`
        : `Home alone context at ${time || 'present time'}. Doorbell reported without visual verification.`;
      recommendation = isHindi
        ? "यदि आप असहज महसूस करते हैं या आगंतुक को नहीं पहचानते हैं तो दरवाजा न खोलें। पीपहोल या सुरक्षा कैमरे से जांचें।"
        : "Do not open the door if you are uncomfortable or do not recognize the visitor. Verify identity safely through a peephole or window.";
      steps = isHindi ? [
        "1. दरवाजा न खोलें और शांति बनाए रखें।",
        "2. पीपहोल से सुरक्षित रूप से पहचान की पुष्टि करें।",
        "3. अपने फोन को चार्ज रखें और 'ट्रस्टेड संपर्क' को सूचित करें।"
      ] : [
        "1. Stay calm and avoid unlocking the door immediately.",
        "2. Verify identity through a peephole or window without opening the door.",
        "3. Keep your phone with you and ready to alert your trusted contact."
      ];
    } else if (msgLower.includes('noise') || msgLower.includes('sound') || msgLower.includes('आवाज़')) {
      riskLevel = 'moderate';
      riskScore = 65;
      reason = isHindi
        ? "घर में अकेली स्थिति और अपरिचित आवाज़। AI बिना प्रमाण के खतरे की पुष्टि नहीं करता।"
        : "Unfamiliar sound reported while home alone. AI maintains measured uncertainty as household items or wind can create sounds.";
      recommendation = isHindi
        ? "शांत रहें। अकेले अज्ञात आवाज़ की जांच के लिए बाहर न निकलें। सुरक्षित कमरे में जाएं, दरवाजा लॉक करें और फोन पास रखें।"
        : "Since you are alone at home, avoid investigating unfamiliar noises directly. Move to a secure location, lock the door, and keep your phone close.";
      steps = isHindi ? [
        "1. शांत रहें और खुद को खतरे में डाले बिना आवाज़ समझने की कोशिश करें।",
        "2. सुरक्षित कमरे में चले जाएं और दरवाजा अंदर से लॉक करें।",
        "3. संदेह होने पर 15 मिनट का स्मार्ट चेक-इन शुरू करें।"
      ] : [
        "1. Stay calm — thermal expansion or household objects frequently cause noises.",
        "2. Move to a secure room with your phone rather than inspecting in the dark.",
        "3. Keep emergency contact and 112 hotline ready if suspicious activity persists."
      ];
    } else {
      riskLevel = 'low';
      riskScore = 88;
      reason = isHindi ? "घर का माहौल सामान्य है। सभी मुख्य दरवाजे बंद रखें।" : "Home environment normal. Doors secured and trusted contact check-in ready.";
      recommendation = isHindi ? "साधारण इनडोर सतर्कता बनाए रखें।" : "Maintain normal indoor vigilance. Emergency controls ready.";
      steps = [
        isHindi ? "1. मुख्य दरवाजों के लॉक जांचें।" : "1. Ensure main entry points are locked.",
        isHindi ? "2. फोन बैटरी पर्याप्त रखें।" : "2. Keep phone battery above 30%."
      ];
    }
  }

  // 2. STALKING / UNSAFE OUTDOOR SCENARIO
  else if (mode === 'unsafe' || msgLower.includes('follow') || msgLower.includes('picha') || msgLower.includes('पीछा') || msgLower.includes('stalk') || msgLower.includes('scared')) {
    riskLevel = 'high';
    riskScore = 48;
    reason = isHindi
      ? `सड़क पर पीछा किए जाने की आशंका (GPS: ${latitude.toFixed(3)}, ${longitude.toFixed(3)}, गंतव्य: ${destination || 'अज्ञात'})।`
      : `Potential stalking reported while travelling toward ${destination || 'destination'} by ${travelMode || 'walking'}. AI advises avoiding confrontation.`;
    recommendation = isHindi
      ? "टकराव से बचें। अपनी चलने की गति बढ़ाएं और पास की खुली दुकान, पेट्रोल पंप या पुलिस सहायता केंद्र में प्रवेश करें।"
      : "Do not confront anyone. Increase your pace and move directly inside the nearest open commercial establishment or police booth.";
    saferAlternative = routes[0]?.name ? `Divert to ${routes[0].name}` : "Divert toward main illuminated avenue.";
    steps = isHindi ? [
      "1. गति बढ़ाएं, पीछे मुड़कर बहस न करें।",
      "2. खुली दुकान या सुरक्षा गार्ड के पास जाएं।",
      "3. Safora AI का 'Fake Call' ऑन करें।",
      "4. तुरंत अपने 'ट्रस्टेड संपर्क' को लाइव GPS सिग्नल भेजें।"
    ] : [
      "1. Increase your walking pace — do not stop or confront anyone.",
      "2. Step inside any open shop, pharmacy, or illuminated petrol station.",
      "3. Enable Fake Call so you appear actively connected on a phone call.",
      "4. Broadcast live GPS tracking link to your Primary Trusted Contact."
    ];
  }

  // 3. OUTDOOR COMMUTE & JOURNEY ANALYSIS
  else {
    const primaryRoute = routes[0];
    if (primaryRoute) {
      riskLevel = primaryRoute.safetyScore < 70 ? 'moderate' : 'low';
      riskScore = primaryRoute.safetyScore;
      reason = isHindi
        ? `${destination || 'गंतव्य'} का मार्ग (${primaryRoute.distanceKm} km, ETA ${primaryRoute.durationMin} min)। समय: ${time || 'वर्तमान'}।`
        : `Calculated journey from GPS (${latitude.toFixed(3)}, ${longitude.toFixed(3)}) to ${destination} (${primaryRoute.distanceKm} km, ${primaryRoute.durationMin} min ETA).`;
      recommendation = isHindi
        ? `${primaryRoute.name} पर बने रहें। ${nearbyPlaces.length} निकटतम आपातकालीन सुविधाएं मार्ग पर उपलब्ध हैं।`
        : `Stay on ${primaryRoute.name}. There are ${nearbyPlaces.length} verified emergency resources near your active GPS location.`;
      saferAlternative = primaryRoute.reason;
      steps = isHindi ? [
        "1. मुख्य उजली सड़क पर यात्रा जारी रखें।",
        "2. 15 मिनट का स्मार्ट सुरक्षा चेक-इन ऑन करें।"
      ] : [
        "1. Stay on main illuminated avenues rather than unlit side-lanes.",
        "2. Start a 15-minute Smart Check-In timer."
      ];
    } else {
      riskLevel = isNight ? 'moderate' : 'low';
      riskScore = isNight ? 74 : 90;
      reason = isHindi ? "वर्तमान स्थान पर लाइव सुरक्षा विश्लेषण सक्रिय।" : `Live GPS safety session active (${latitude.toFixed(3)}, ${longitude.toFixed(3)}).`;
      recommendation = isHindi ? "सजग रहें और अपनी लोकेशन ट्रस्टेड सर्कल के साथ शेयर रखें।" : "Stay vigilant and keep location tracking shared with your trusted contact.";
      steps = [
        isHindi ? "1. सामान्य गति से यात्रा करें।" : "1. Proceed along main illuminated routes.",
        isHindi ? "2. समस्या पर 1-Click SOS उपलब्ध है।" : "2. 1-Click SOS on standby."
      ];
    }
  }

  return {
    riskLevel,
    score: riskScore,
    reason,
    recommendation,
    saferAlternative,
    steps,
    helpline: demographic === 'women' ? '1091 (Women Helpline)' : demographic === 'child' ? '1098 (Childline)' : demographic === 'elder' ? '14567 (Senior Helpline)' : '112 (National Emergency)',
    disclaimer: "Safety assessment is based on available route, location, time, and nearby-place information. This is not a guarantee of actual safety."
  };
}
