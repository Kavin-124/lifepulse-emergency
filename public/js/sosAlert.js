// SOS Alert & Siren Module (Guaranteed Location SMS & Dual SMS Scheme)
const sosAlert = {
  audioCtx: null,
  sirenOscillator: null,
  isSirenActive: false,

  toggleEmergencySiren() {
    if (this.isSirenActive) {
      this.stopEmergencySiren();
    } else {
      this.startEmergencySiren();
    }
  },

  startEmergencySiren() {
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      this.sirenOscillator = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();

      this.sirenOscillator.type = 'sawtooth';
      
      const now = this.audioCtx.currentTime;
      this.sirenOscillator.frequency.setValueAtTime(800, now);
      
      let high = true;
      this.sirenInterval = setInterval(() => {
        if (!this.audioCtx || !this.sirenOscillator) return;
        const currentNow = this.audioCtx.currentTime;
        if (high) {
          this.sirenOscillator.frequency.exponentialRampToValueAtTime(1200, currentNow + 0.3);
        } else {
          this.sirenOscillator.frequency.exponentialRampToValueAtTime(600, currentNow + 0.3);
        }
        high = !high;
      }, 400);

      gainNode.gain.setValueAtTime(0.3, now);

      this.sirenOscillator.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);

      this.sirenOscillator.start();
      this.isSirenActive = true;

      document.body.classList.add('siren-active-body');
      document.getElementById('siren-btn-text').innerText = 'STOP Siren';
      app.showToast('🚨 Emergency Siren & Visual Beacon Activated!', 'error');
    } catch (err) {
      console.error('Audio Context Error:', err);
      app.showToast('Could not start audio siren: ' + err.message, 'error');
    }
  },

  stopEmergencySiren() {
    if (this.sirenOscillator) {
      try { this.sirenOscillator.stop(); } catch (e) {}
      this.sirenOscillator.disconnect();
      this.sirenOscillator = null;
    }
    if (this.sirenInterval) {
      clearInterval(this.sirenInterval);
    }
    this.isSirenActive = false;
    document.body.classList.remove('siren-active-body');
    document.getElementById('siren-btn-text').innerText = 'Emergency Siren';
    app.showToast('Siren Deactivated.', 'info');
  },

  async dispatchBystanderLocation(profileId) {
    app.showToast('Detecting location for SMS dispatch...', 'info');

    // 1. Try Satellite / Network Geolocation API
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          console.log('GPS Coordinates acquired:', pos.coords.latitude, pos.coords.longitude);
          this.sendDispatch(profileId, pos.coords.latitude, pos.coords.longitude, null);
        },
        async (err) => {
          console.warn('GPS hardware access failed/denied:', err);
          // Try IP location or prompt landmark
          await this.fetchIpLocationOrPromptLandmark(profileId);
        },
        { timeout: 8000, enableHighAccuracy: true, maximumAge: 0 }
      );
    } else {
      await this.fetchIpLocationOrPromptLandmark(profileId);
    }
  },

  async fetchIpLocationOrPromptLandmark(profileId) {
    if (navigator.onLine) {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        if (data && data.latitude && data.longitude) {
          const cityInfo = `${data.city || ''}, ${data.region || ''}, ${data.country_name || ''}`;
          this.sendDispatch(profileId, data.latitude, data.longitude, `Near ${cityInfo}`);
          return;
        }
      } catch (e) {
        console.warn('IP location failed:', e);
      }
    }

    // Manual Landmark Prompt
    const landmark = prompt(
      '📍 Automatic GPS location unavailable.\n\nPlease type nearby landmark or road name to include location in SMS:\n(e.g., "Hosur Road near Silk Board")',
      'Near accident spot'
    );
    this.sendDispatch(profileId, null, null, landmark || 'Near accident spot');
  },

  async sendDispatch(profileId, lat, lng, manualLandmark) {
    const victim = app.currentProfile || {
      name: 'Kavin',
      primaryContactName: 'Mother',
      primaryContactPhone: '7010502817',
      bloodGroup: 'A+'
    };

    // Format location details guaranteed
    let locationDetails = '';
    if (lat && lng) {
      locationDetails = `https://maps.google.com/?q=${lat.toFixed(5)},${lng.toFixed(5)}`;
    } else if (manualLandmark) {
      locationDetails = `Spot: ${manualLandmark}`;
    } else {
      locationDetails = `Near accident spot`;
    }

    const messageText = `🚨 EMERGENCY ALERT: ${victim.name} involved in incident. Bystander scanned LifePulse. Location Pin: ${locationDetails}. Blood: ${victim.bloodGroup || 'A+'}.`;

    const cleanPhone = (victim.primaryContactPhone || '7010502817').replace(/[^0-9+]/g, '');

    if (navigator.onLine) {
      const cleanPhoneDigits = cleanPhone.replace(/[^0-9]/g, '');
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const whatsappUrl = isMobile
        ? `https://api.whatsapp.com/send?phone=${cleanPhoneDigits}&text=${encodeURIComponent(messageText)}`
        : `https://web.whatsapp.com/send?phone=${cleanPhoneDigits}&text=${encodeURIComponent(messageText)}`;

      app.showToast(`Opening WhatsApp alert with location...`, 'success');
      const opened = window.open(whatsappUrl, '_blank');
      if (!opened) {
        window.location.href = whatsappUrl;
      }
      return;
    }

    // OFFLINE CELLULAR SMS PROTOCOL
    // Cross-platform Android & iOS SMS URI (Android uses ?body= or &body= depending on OS version)
    const isAndroid = /Android/i.test(navigator.userAgent);
    const smsUrl = isAndroid
      ? `sms:${cleanPhone}?body=${encodeURIComponent(messageText)}`
      : `sms:${cleanPhone}&body=${encodeURIComponent(messageText)}`;

    app.showToast('⚡ Opening Native SMS App with Location Details...', 'warning');
    
    // Trigger SMS app
    window.location.href = smsUrl;
  }
};
