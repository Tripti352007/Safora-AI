// Safora AI Proactive Context Reasoning & Expanded Knowledge Assistant Engine

export function analyzeContextualSafety({
  mode = 'outdoor', // 'outdoor' | 'home' | 'unsafe'
  userMessage = '',
  timeOfDay = 'Night (10:45 PM)',
  isIsolated = false,
  routeDeviated = false,
  demographic = 'women',
  language = 'en'
}) {
  const isHindi = language === 'hi';
  const msgLower = userMessage.toLowerCase().trim();

  let riskLevel = 'LOW'; // 'LOW' | 'MODERATE' | 'HIGH' | 'EMERGENCY'
  let riskBadgeColor = '🟢';
  let title = '';
  let reason = '';
  let recommendation = '';
  let saferAlternative = '';
  let emergencyEscalation = false;
  let steps = [];

  // Expanded Conversational Query Handlers
  if (msgLower.includes('cab') || msgLower.includes('auto') || msgLower.includes('taxi') || msgLower.includes('ride')) {
    riskLevel = 'MODERATE';
    riskBadgeColor = '🟡';
    title = isHindi ? "कैब/ऑटो यात्रा सुरक्षा" : "Transit & Ride Safety Advisory";
    reason = isHindi ? "अनजान ऑटो या कैब यात्रा में सतर्कता आवश्यक है।" : "Cab or auto transit requires proactive sharing and route tracking.";
    recommendation = isHindi 
      ? "सवारी में बैठते ही गाड़ी की प्लेट नंबर का फोटो लें और अपने ट्रस्टेड सर्कल के साथ शेयर करें।"
      : "Share the vehicle license plate number and live GPS tracking link with your Trusted Circle contacts immediately.";
    steps = isHindi ? [
      "1. चालक के नाम और नंबर प्लेट की पुष्टि करें।",
      "2. लाइव जीपीएस ट्रैकिंग ऑन रखें।",
      "3. फोन पर बात करते हुए दिखें (Fake Call इस्तेमाल करें)।"
    ] : [
      "1. Verify driver name & license plate before getting inside.",
      "2. Keep live GPS tracking link shared with family.",
      "3. Enable Fake Call generator so you appear actively on a phone call."
    ];
  } else if (msgLower.includes('medical') || msgLower.includes('fall') || msgLower.includes('chot') || msgLower.includes('चोट') || msgLower.includes('doctor')) {
    riskLevel = 'HIGH';
    riskBadgeColor = '🟠';
    title = isHindi ? "मेडिकल आपातकालीन सहायता" : "Medical Emergency Protocol";
    reason = isHindi ? "अचानक स्वास्थ्य समस्या या गिरने की आपात स्थिति।" : "Medical distress or physical injury reported.";
    recommendation = isHindi
      ? "तुरंत 112 एम्बुलेंस सेवा को कॉल करें और पास के NGO मेडिकल स्वयंसेवक को सूचित करें।"
      : "Contact 112 Ambulance Helpline immediately and alert nearby NGO Medic Meera Patel (+91 98990 11223).";
    steps = isHindi ? [
      "1. 112 एम्बुलेंस को डायल करें।",
      "2. शांत रहें और गहरी सांस लें।",
      "3. पास के NGO स्वयंसेवक को लाइव संकेत भेजा गया है।"
    ] : [
      "1. Dial 112 National Emergency Helpline.",
      "2. Stay calm and sit in a comfortable position.",
      "3. Live location sync dispatched to nearby NGO Medic."
    ];
  } else if (msgLower.includes('panic') || msgLower.includes('anxious') || msgLower.includes('ghabrahut') || msgLower.includes('घबराहट')) {
    riskLevel = 'LOW';
    riskBadgeColor = '🟢';
    title = isHindi ? "मानसिक तनाव एवं पैनिक से राहत" : "Calm & De-Stress Support";
    reason = isHindi ? "अत्यधिक तनाव या घबराहट की स्थिति।" : "Anxiety or stress reported. Measured calm guidance active.";
    recommendation = isHindi
      ? "गहरी सांस लें: 4 सेकंड तक सांस खींचें, 4 सेकंड रोकें और 4 सेकंड में छोड़ें। आप सुरक्षित हैं।"
      : "Take deep breaths: 4-4-4 box breathing (Inhale 4s, Hold 4s, Exhale 4s). You are surrounded by safe zones.";
    steps = isHindi ? [
      "1. 4-4-4 बॉक्स ब्रीदिंग व्यायाम करें।",
      "2. अपने आसपास के सुरक्षित दुकान या बेंच पर बैठें।",
      "3. अपने विश्वसनीय मित्र को कॉल करें।"
    ] : [
      "1. Practice 4-4-4 box breathing technique.",
      "2. Sit down at a well-lit coffee shop or bench.",
      "3. Connect with your trusted friend or NSS companion."
    ];
  } else if (mode === 'home' || msgLower.includes('home') || msgLower.includes('noise') || msgLower.includes('doorbell') || msgLower.includes('ghar')) {
    if (msgLower.includes('doorbell') || msgLower.includes('door') || msgLower.includes('घंटी') || msgLower.includes('दरवाजा')) {
      riskLevel = 'MODERATE';
      riskBadgeColor = '🟡';
      title = isHindi ? "अज्ञात आगंतुक / घंटी - मध्यम जोखिम" : "Unknown Visitor / Doorbell — Moderate Risk";
      reason = isHindi 
        ? "घर पर अकेले होने और रात के समय अज्ञात व्यक्ति द्वारा घंटी बजाए जाने के कारण अलर्ट।"
        : "Alert triggered due to being home alone and an unknown person ringing the doorbell at night.";
      recommendation = isHindi
        ? "यदि आप असहज महसूस करते हैं या व्यक्ति को नहीं पहचानते हैं तो दरवाजा न खोलें। पीपहोल या खिड़की से जांचें।"
        : "Do not open the door if you are uncomfortable or do not recognize the person. Check through a safe method such as a peephole.";
      steps = isHindi ? [
        "1. दरवाजा न खोलें और शांति बनाए रखें।",
        "2. पीपहोल या दूर से पहचान की पुष्टि करें।",
        "3. टीवी/लाइट्स ऑन रखें ताकि आप व्यस्त दिखें।",
        "4. अपने किसी विश्वसनीय संपर्क या पास के NSS स्वयंसेवक को सूचित करें।"
      ] : [
        "1. Stay calm and do not open the door immediately.",
        "2. Verify identity through peephole or window without unlocking.",
        "3. Keep your phone with you and ready to call trusted contacts.",
        "4. Call nearby NGO Guard Arjun (+91 98333 44556) if feeling suspicious."
      ];
    } else if (msgLower.includes('noise') || msgLower.includes('sound') || msgLower.includes('आवाज़') || msgLower.includes('शोर')) {
      riskLevel = 'MODERATE';
      riskBadgeColor = '🟡';
      title = isHindi ? "अपरिचित आवाज़ - मध्यम जोखिम" : "Unfamiliar Sound — Moderate Risk";
      reason = isHindi
        ? "घर में अकेली स्थिति और अनजानी आवाज़। AI बिना प्रमाण के खतरे की पुष्टि नहीं करता।"
        : "Unfamiliar sound detected while home alone. AI maintains measured uncertainty as wind or appliances can cause sounds.";
      recommendation = isHindi
        ? "शांत रहें। अकेले जांच के लिए बाहर न निकलें। सुरक्षित कमरे में जाएं, दरवाजा लॉक करें और फोन पास रखें।"
        : "Stay calm. Do not investigate an unfamiliar noise alone. Move to a secure room, lock the door, and keep your phone close.";
      steps = isHindi ? [
        "1. शांत रहें और खुद को खतरे में डाले बिना आवाज़ का स्रोत समझने की कोशिश करें।",
        "2. सुरक्षित कमरे में चले जाएं और दरवाजा अंदर से लॉक करें।",
        "3. यदि संदेह बढ़ता है, तो तुरंत अपने 'ट्रस्टेड सर्कल' को मैसेज भेजें।"
      ] : [
        "1. Stay calm — thermal shifts or household items often create unexpected sounds.",
        "2. Do not go looking around in the dark alone. Move to a secure room.",
        "3. Lock your bedroom door and keep your phone charged and handy.",
        "4. Start a 15-minute Smart Check-In timer for peace of mind."
      ];
    } else {
      riskLevel = 'LOW';
      riskBadgeColor = '🟢';
      title = isHindi ? "घर पर अकेले सुरक्षा मोड" : "Alone-at-Home Guard Active — Low Risk";
      reason = isHindi ? "घर का वातावरण सुरक्षित है। सभी दरवाजे और खिड़कियां लॉक रखें।" : "Home environment normal. Doors secured and trusted contact check-in ready.";
      recommendation = isHindi ? "अपनी सुरक्षा बनाए रखें। आपातकालीन बटन केवल एक क्लिक दूर है।" : "Maintain normal indoor vigilance. Emergency controls & NGO medic nearby.";
      steps = [
        isHindi ? "1. मुख्य दरवाजे का लॉक जांचें।" : "1. Ensure main doors & balcony locks are secured.",
        isHindi ? "2. अपने फोन की बैटरी पर्याप्त रखें।" : "2. Keep phone battery charged above 30%."
      ];
    }
  } else if (mode === 'unsafe' || msgLower.includes('follow') || msgLower.includes('picha') || msgLower.includes('पीछा') || msgLower.includes('stalk') || msgLower.includes('scared') || msgLower.includes('डर')) {
    riskLevel = 'HIGH';
    riskBadgeColor = '🟠';
    title = isHindi ? "संभावित पीछा / असुरक्षित - उच्च जोखिम" : "Potential Stalking / Unsafe Area — High Risk";
    reason = isHindi ? "सड़क पर पीछा किए जाने का अंदेशा। AI टकराव से बचने की सलाह देता है।" : "User feels potentially followed. AI recommends avoiding confrontation and moving to a populated venue.";
    recommendation = isHindi 
      ? "टकराव से बचें। तुरंत गति बढ़ाकर पास की खुली दुकान, पेट्रोल पंप, या रोशन स्टेशन में प्रवेश करें।" 
      : "Avoid direct confrontation. Increase speed and step inside the nearest open pharmacy, petrol station, or illuminated metro station.";
    saferAlternative = isHindi ? "मुख्य सड़क की ओर 120 मीटर बढ़ें (Main Market Gate)।" : "Divert 120 meters right to Main Illuminated Market.";
    emergencyEscalation = true;
    steps = isHindi ? [
      "1. गति बढ़ाएं, पीछे मुड़कर बहस न करें।",
      "2. किसी भी खुली दुकान या सुरक्षा गार्ड के पास चले जाएं।",
      "3. Safora AI का 'Fake Call' ऑन करें।",
      "4. निकटतम NSS लीड प्रिया शर्मा (+91 98765 43210) को सिग्नल भेजें।"
    ] : [
      "1. Increase walking pace, do not stop or confront anyone.",
      "2. Move directly into any lit commercial shop or guard booth.",
      "3. Activate Safora AI 'Fake Call' generator so you appear actively on a phone call.",
      "4. Signal live tracking with NSS Lead Priya Sharma (+91 98765 43210)."
    ];
  } else {
    if (isIsolated || routeDeviated) {
      riskLevel = 'MODERATE';
      riskBadgeColor = '🟡';
      title = isHindi ? "मार्ग विचलन एवं कम प्रकाश" : "Route Deviation & Low Illumination — Moderate Risk";
      reason = isHindi ? "आपका मार्ग मुख्य रास्ते से हट गया है और आगे प्रकाश कम प्रतीत होता है।" : "Your current journey includes an isolated section with fewer public facilities nearby.";
      recommendation = isHindi ? "मुख्य रोशन सड़क पर रहें और आबादी वाले क्षेत्र की ओर बढ़ें।" : "Consider staying on the main road and moving toward a populated or well-lit area.";
      saferAlternative = isHindi ? "सुझाया गया safe detour: मुख्य गेट रोड (150m दूर)।" : "Suggested Safe Detour: Main Gate Illuminated Avenue (150m away).";
      steps = isHindi ? [
        "1. मुख्य उजली सड़क पर बने रहें।",
        "2. 15 मिनट का स्मार्ट चेक-इन शुरू करें।",
        "3. पास के NSS स्वयंसेवक (राहुल वर्मा - 0.6km) सक्रिय हैं।"
      ] : [
        "1. Stay on the main illuminated avenue rather than narrow side-lanes.",
        "2. Start a 15-minute Safety Check-In timer.",
        "3. Active NGO Companion Rahul Verma is 0.6km away on standby."
      ];
    } else {
      riskLevel = 'LOW';
      riskBadgeColor = '🟢';
      title = isHindi ? "सुरक्षित यात्रा - निम्न जोखिम" : "Illuminated Commute Corridor — Low Risk";
      reason = isHindi ? "मार्ग 94% रोशन है। आसपास पुलिस सहायता बूथ और NSS स्वयंसेवक सक्रिय हैं।" : "Journey corridor has 94% lighting rating. Public transport and police booths nearby.";
      recommendation = isHindi ? "सामान्य सतर्कता बनाए रखें। आपका लाइव GPS सिंक चालू है।" : "Maintain standard vigilance. Your live GPS tracking is securely sync'd.";
      steps = [
        isHindi ? "1. सामान्य गति से यात्रा जारी रखें।" : "1. Proceed along planned illuminated route.",
        isHindi ? "2. समस्या होने पर SOS एवं वॉयस असिस्टेंट उपलब्ध है।" : "2. SOS and Voice Assistant on standby."
      ];
    }
  }

  return {
    riskLevel,
    riskBadgeColor,
    title,
    reason,
    recommendation,
    saferAlternative,
    emergencyEscalation,
    steps,
    helpline: demographic === 'women' ? '1091 (Women Helpline)' : demographic === 'child' ? '1098 (Childline)' : demographic === 'elder' ? '14567 (Senior Helpline)' : '112 (National Emergency)'
  };
}
