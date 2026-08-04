# 📊 LifePulse Project Presentation Deck (12 Slides)

**Project Title**: LifePulse – Smart Emergency Medical & First-Responder Network  
**Presenter**: Kavin (`github.com/Kavin-124`)  
**Domain**: Full-Stack IoT, Mobile Computing & Emergency Response Systems  

---

## 📽️ SLIDE 1: TITLE SLIDE
* **Header**: **LifePulse: Smart Emergency Medical & First-Responder Network**
* **Subtitle**: Instant Bystander Medical Access, High-G Crash Sensing, & Zero-Sticker Vehicle Lookup
* **Presenter**: Kavin (Pre-Final Year Engineering Project)
* **Live Web App**: https://lifepulse-emergency.vercel.app/
* **Mobile App (.apk)**: https://lifepulse-emergency.vercel.app/download
* **GitHub Repository**: https://github.com/Kavin-124/lifepulse-emergency

---

## 📽️ SLIDE 2: THE CRITICAL PROBLEM & REAL-WORLD EMERGENCY GAPS
* **The "Golden Hour" Delay**: Over 1,50,000 road fatalities occur annually in India. 50%+ victims could be saved if medical history (blood group, allergies) and family contact (ICE) were available within the first 15 minutes ("Golden Hour").
* **Unconscious Victim Scenario**: When a victim is unconscious, bystanders cannot unlock their smartphone or ask for family contacts.
* **Loss of Phone During Accidents**: In high-impact crashes, the victim's phone is often thrown away, damaged, or lost in surrounding terrain.

---

## 📽️ SLIDE 3: ❌ FAILURES & LIMITATIONS OF EXISTING MODELS
| Existing System / Competitor | How It Works | **Critical Failure / Limitation** | **LifePulse Innovation** |
| :--- | :--- | :--- | :--- |
| **Physical Emergency Stickers** *(ProfileTap, QR Stickers)* | Requires victim to buy & stick physical QR stickers on helmet/car | ❌ **High Cost & Low Adoption**: People refuse to put permanent stickers on luxury vehicles.<br>❌ **Physical Damage**: Stickers peel off, get scratched, or burned in crashes. | **Zero-Sticker Search**: Bystanders search the vehicle's standard Government License Plate (`TN47BB0583`) directly! |
| **Bystander Good Samaritan Apps** *(NekInsan)* | Manual registration portal | ❌ **No Live Hardware Sensing**: Requires a conscious bystander to discover the app.<br>❌ **No Hospital Navigation**: Only displays plain emergency phone numbers. | **High-G Impact Sensors + Live OSM**: Automatic 30s crash alarm + real-time 24x7 trauma center locator. |
| **Traditional 108 Emergency Dialing** | Verbal phone call to centralized dispatch center | ❌ **Cellular Voice Congestion**: Voice lines drop in remote highway areas.<br>❌ **Location Confusion**: Bystanders struggle to articulate exact highway milestone coordinates. | **1-Tap GPS Location Dispatch**: Auto-generates Google Maps pin & sends via Cellular SMS + WhatsApp. |
| **Lockscreen Emergency Contacts** | Built-in iOS / Android ICE info | ❌ **Device Destruction**: If victim's phone screen shatters in crash, ICE info is 100% unreadable. | **Zero-Sticker Plate Lookup**: Family contacted via vehicle registration without touching victim's broken phone! |

---

## 📽️ SLIDE 4: PROPOSED SOLUTION – LIFEPULSE NETWORK
* **Unified Emergency Ecosystem**: Integrates physical vehicle lookup, native smartphone hardware sensors, and cloud web services.
* **Zero Barrier to Access**: Bystanders need **NO app installation** to help. Scanning a QR code or entering a license plate (`TN47BB0583`) works on any mobile browser.
* **100% Free & Open-Source**: Eliminates commercial sticker subscriptions and expensive hardware tags.

---

## 📽️ SLIDE 5: SYSTEM ARCHITECTURE & DUAL TECH STACK
* **Frontend PWA**: HTML5, Vanilla Glassmorphic CSS, JS Modules, Service Worker (`sw.js`) for 100% offline access.
* **Backend API Engine**: Node.js + Express REST Server listening on `0.0.0.0` for LAN IP dynamic binding.
* **Native Mobile App**: React Native with Expo, `@react-navigation`, `expo-sensors`, `expo-location`, `expo-sms`.
* **Cloud Infrastructure**: Live Vercel serverless deployment + GitHub CI/CD daily activity automation.

---

## 📽️ SLIDE 6: NOVEL HARDWARE INNOVATION – HIGH-G CRASH SENSOR
* **Accelerometer Sensor Integration**: Uses phone motion hardware (`expo-sensors`) to compute real-time resultant acceleration:
  Total G-Force = sqrt(x^2 + y^2 + z^2)
* **Impact Threshold**: Triggers when deceleration exceeds **3.2G** (simulating motorcycle crashes or head-on vehicle collisions).
* **Automatic 30-Second Alarm**:
  1. High-G impact detected -> Loud 100dB audio siren sounds.
  2. 30-second visual countdown appears.
  3. If uncancelled (victim unconscious), phone **automatically sends GPS location SMS to family**!

---

## 📽️ SLIDE 7: ZERO-STICKER VEHICLE LOOKUP PORTAL (`/search`)
* **Core Concept**: Every vehicle already carries a mandatory Government License Plate.
* **How It Works**:
  1. Bystander sees accident victim's vehicle (e.g. `TN47BB0583`).
  2. Opens `lifepulse-emergency.vercel.app` on their phone.
  3. Enters license plate number -> Instantly displays victim's blood group (`A+`), critical allergies, and 1-tap family call buttons.
* **Privacy & Security**: Sensitive medical history (chronic conditions) is locked behind a 4-digit PIN (`1111`), while life-saving ICE contacts and blood group remain public to first responders.

---

## 📽️ SLIDE 8: BYSTANDER SOS DISPATCHER & DUAL-CHANNEL ALERTING
* **1-Tap Location Sharing**: Captures bystander's live GPS coordinates (`Location.getCurrentPositionAsync`).
* **Dual Channel Fallback Engine**:
  1. **Primary**: WhatsApp API link (`https://api.whatsapp.com/send?phone=...`) pre-filled with live Google Maps link.
  2. **Offline Fallback**: Native Cellular SMS (`sms:7010502817?body=...`) using cellular voice channels without requiring active 4G/5G mobile internet.

---

## 📽️ SLIDE 9: LIVE OPENSTREETMAP TRAUMA CENTER ROUTING
* **Dynamic Geocoding**: Queries OpenStreetMap Nominatim API (`https://nominatim.openstreetmap.org/search?q=hospital...`).
* **Intelligent Trauma Filtering**:
  * Displays distance in kilometers (`distanceKm`) using Haversine formula.
  * Filters 24x7 emergency rooms, blood banks, and ICU trauma centers near victim.
  * Direct 1-tap **Google Maps Route Navigation** + 1-tap **108 Ambulance Call**.

---

## 📽️ SLIDE 10: EDGE CASE HANDLING & FAIL-SAFE DESIGN
* **Edge Case 1: Bystander Location Turned OFF**:
  * *Solution*: IP Geolocation API fallback + manual landmark / highway milestone entry bar.
* **Edge Case 2: Victim's Phone Screen Shattered**:
  * *Solution*: Zero-Sticker Vehicle Plate lookup + printable QR MedTag badges for helmet/wallet.
* **Edge Case 3: Zero Cellular Data / No Internet**:
  * *Solution*: Service Worker (`sw.js`) caches full app shell offline; Native SMS protocol dispatches emergency alerts over cellular tower channels.

---

## 📽️ SLIDE 11: DEPLOYMENT METRICS & VERIFICATION
* **Live PWA Web Application**: Deployed at https://lifepulse-emergency.vercel.app/ (100% Lighthouse PWA compliance).
* **Native Android App**: Standalone compiled APK file (`lifepulse-mobile.apk` ~89MB) built via Expo EAS Cloud.
* **GitHub Repository**: Hosted at https://github.com/Kavin-124/lifepulse-emergency with automated GitHub Actions CI/CD pipeline (`daily-commit.yml`).

---

## 📽️ SLIDE 12: FUTURE ROADMAP & CONCLUSION
* **Future Work**:
  1. **OBD-II Vehicle CAN-bus Integration**: Connect hardware crash sensors directly to vehicle airbags.
  2. **Regional Emergency Call Center API**: Direct webhook integration with 108/112 state emergency control rooms.
* **Conclusion**: LifePulse bridges the critical gap between accident occurrence and first-responder arrival, turning every smartphone and vehicle plate into a life-saving emergency beacon.
