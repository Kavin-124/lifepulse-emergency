# 🚨 LifePulse - Smart Emergency Medical & First-Responder Network

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![PWA](https://img.shields.io/badge/PWA-Offline%20Ready-ff69b4.svg)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![Express](https://img.shields.io/badge/Express.js-4.x-lightgrey.svg)](https://expressjs.com/)

**LifePulse** is an end-to-end, production-ready full-stack Progressive Web Application (PWA) designed to solve real-world emergency response and medical data accessibility gaps during road accidents.

When accidents occur, victims are often unconscious, locked out of their mobile phones, or have their devices destroyed. **LifePulse** enables first-responders, bystanders, and traffic police to access vital life-saving medical data (blood group, critical allergies, emergency contacts) and dispatch live accident GPS pins to family members in seconds—**working seamlessly online or 100% offline via cellular SMS**.

---

## 🌟 Key Real-World Innovations

### 1. 3-Tier Emergency Identification Framework
* **Tier 1 (Phone Lockscreen / App)**: Scannable Emergency QR card displaying vital triage info.
* **Tier 2 (Printable Wearable MedTags)**: Built-in generator for printable, water-resistant **Helmet Stickers**, **Wallet Cards**, and **Keychain Tags**.
* **Tier 3 (Zero-Sticker Lost-Phone Search Portal)**: Public search portal (`/search`) allowing bystanders or police to look up emergency contacts using only the victim's **Vehicle Registration Plate** (e.g. `TN47BB0583`).

### 2. Bystander Auto GPS & Cellular SMS Location Dispatcher
* **Online Mode (WhatsApp API)**: Captures bystander's GPS coordinates and compiles a 1-tap WhatsApp message containing a live Google Maps accident location link sent to family.
* **Offline Mode (Native Cellular SMS Protocol)**: In remote dead-zones with no 4G/5G mobile internet, the app automatically triggers the phone's native Cellular SMS app (`sms:`) over standard GSM voice channels.
* **Zero-GPS Fallback**: If GPS hardware is disabled on both devices, the app prompts for a landmark description (e.g., *"NH-44 Highway near Shell Fuel Station"*) to embed in the alert.

### 3. Real-Time OpenStreetMap Emergency Hospital Locator
* Queries live **OpenStreetMap (Nominatim API)** to detect real emergency rooms, trauma centers, and blood banks anywhere in the world.
* Calculates exact distance in kilometers and provides direct **Google Maps Navigation links**.

### 4. Built-in Emergency Beacon & First-Aid Protocol Library
* **Web Audio API Distress Beacon**: Dual-tone emergency audio siren (800Hz–1200Hz sweep) and flashing visual signal for low-visibility night accident scenes.
* **Interactive First-Aid Guides**: Step-by-step instructions for CPR, severe bleeding control, choking (Heimlich), burns, and seizures.

---

## 📊 Comparison Matrix (Existing Apps vs. LifePulse)

| Scenario / Feature | Commercial Apps (NekInsan, ProfileTap, RoadID) | **LifePulse (Our Solution)** |
| :--- | :--- | :--- |
| **Cost Barrier** | Charges ₹300–₹500 for physical stickers. | **100% Free** digital generator for Lockscreen Wallpapers & Printable Badges. |
| **Lost Phone + No Sticker Scenario** | ❌ **Fails completely**. No way to reach contacts. | ✅ **Public Vehicle License Plate Search (`/search`)**. |
| **No Internet Data Coverage** | ❌ **Fails completely**. Cannot reach web servers. | ✅ **PWA Offline Service Worker** & **Native Cellular SMS Protocol**. |
| **Location Sharing** | Often just displays raw phone number. | ✅ **Auto GPS Pin / Landmark Dispatch** to family via WhatsApp or SMS. |

---

## 🛠️ Technology Stack

* **Frontend**: HTML5, Vanilla CSS3 (Custom Glassmorphism Design System, Emergency Dark Mode), JavaScript (ES6+ Modules).
* **Web APIs**: HTML5 Geolocation API, Web Audio API (Siren Synthesizer), Service Worker API (Progressive Web App Offline Caching).
* **Backend**: Node.js, Express.js REST API.
* **External APIs**: OpenStreetMap Nominatim Geocoding API, Google Maps Routing.
* **Utilities**: `qrcode` (SVG & Canvas QR Rendering).

---

## 📁 Repository Structure

```
lifepulse-emergency/
├── package.json               # Node.js dependencies & scripts
├── server.js                  # Express API Server (Profiles, Vehicle Lookup, OSM Hospitals)
├── vercel.json                # Vercel zero-sleep deployment config
├── .gitignore                 # Excluded files
├── README.md                  # Documentation
├── data/
│   └── mockData.json          # Seed JSON database
└── public/
    ├── index.html             # Main Application Interface
    ├── manifest.json          # Web App Manifest for mobile PWA installation
    ├── sw.js                  # Offline Service Worker
    ├── css/
    │   └── styles.css         # Glassmorphism & dark emergency theme
    └── js/
        ├── app.js             # Client router, tabs, and toast manager
        ├── profileManager.js  # Profile creation, local cache, and PIN security
        ├── vehicleLookup.js   # Zero-sticker vehicle license plate search engine
        ├── qrGenerator.js     # Dynamic QR code & printable MedTag layout builder
        ├── sosAlert.js        # Web Audio Siren & Bystander GPS/SMS Dispatcher
        └── nearbyFinder.js    # OpenStreetMap hospital locator & route generator
```

---

## 🚀 Installation & Local Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Kavin-124/lifepulse-emergency.git
   cd lifepulse-emergency
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start local server**:
   ```bash
   node server.js
   ```

4. **Open in browser**:
   * Local: `http://localhost:3000`
   * Mobile / LAN: `http://<YOUR_LOCAL_IP>:3000`

---

## 🌐 Live Demo & Deployment

* **Live Web Application**: **[https://lifepulse-emergency.vercel.app/](https://lifepulse-emergency.vercel.app/)**
* **GitHub Repository**: **[https://github.com/Kavin-124/lifepulse-emergency](https://github.com/Kavin-124/lifepulse-emergency)**

---

## 👤 Author

* **Kavin** - *Pre-Final Year Engineering Student*
* GitHub: [@Kavin-124](https://github.com/Kavin-124)
* Email: kavinravi124@gmail.com

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
