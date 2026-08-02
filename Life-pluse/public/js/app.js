// LifePulse App Core Router & State Controller (PWA & Desktop/Mobile Compatible)
const app = {
  activeTab: 'search-tab',
  currentProfile: null,

  init() {
    console.log('Initializing LifePulse Application...');
    
    this.registerServiceWorker();

    window.addEventListener('online', () => this.updateOnlineStatus(true));
    window.addEventListener('offline', () => this.updateOnlineStatus(false));
    this.updateOnlineStatus(navigator.onLine);

    const urlParams = new URLSearchParams(window.location.search);
    const emergencyId = urlParams.get('emergency_id');

    if (emergencyId) {
      console.log('Emergency ID detected in URL:', emergencyId);
      this.switchTab('bystander-tab');
      this.loadBystanderProfile(emergencyId);
    } else {
      this.switchTab('search-tab');
    }

    profileManager.loadSavedLocalProfile();
    nearbyFinder.locateHospitals();
    this.loadFirstAidGuides();
  },

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('[LifePulse] Service Worker registered:', reg.scope))
        .catch(err => console.warn('[LifePulse] Service Worker failed:', err));
    }
  },

  updateOnlineStatus(isOnline) {
    const badge = document.getElementById('network-status-badge');
    if (badge) {
      if (isOnline) {
        badge.className = 'status-badge online';
        badge.innerHTML = '🟢 Online Mode';
      } else {
        badge.className = 'status-badge offline';
        badge.innerHTML = '⚡ Offline Mode (Cellular SMS & Cache Active)';
        this.showToast('You are offline. Cellular SMS & Offline MedTags remain 100% functional!', 'warning');
      }
    }
  },

  switchTab(tabId) {
    this.activeTab = tabId;

    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    const targetBtn = document.getElementById(`btn-${tabId}`);
    if (targetBtn) targetBtn.classList.add('active');

    document.querySelectorAll('.tab-view').forEach(view => view.classList.remove('active'));
    const targetView = document.getElementById(tabId);
    if (targetView) targetView.classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  async loadBystanderProfile(profileId) {
    try {
      const res = await fetch(`/api/profile/${profileId}`);
      if (!res.ok) throw new Error('Profile not found');
      const data = await res.json();
      
      this.currentProfile = data.profile;
      this.renderBystanderCard(data.profile);
    } catch (err) {
      console.error(err);
      
      const localId = localStorage.getItem('lifepulse_user_id');
      if (localId && localId === profileId) {
        const localProfile = JSON.parse(localStorage.getItem('lifepulse_profile_data') || '{}');
        if (localProfile.id) {
          this.renderBystanderCard(localProfile);
          return;
        }
      }

      document.getElementById('bystander-card-container').innerHTML = `
        <div class="card" style="text-align: center; color: var(--color-danger); padding: 30px;">
          <h3>⚠️ Profile Not Found</h3>
          <p style="margin-top: 8px;">No registered emergency record found for ID: <code>${profileId}</code>.</p>
        </div>
      `;
    }
  },

  renderBystanderCard(profile) {
    const container = document.getElementById('bystander-card-container');
    const p1Phone = (profile.primaryContactPhone || '').replace(/[^0-9+]/g, '');
    const p2Phone = (profile.secondaryContactPhone || '').replace(/[^0-9+]/g, '');

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const p1Clean = p1Phone.replace(/[^0-9]/g, '');
    const p2Clean = p2Phone.replace(/[^0-9]/g, '');

    const msg = `🚨 EMERGENCY ALERT: I am calling regarding ${profile.name}'s emergency record.`;
    const p1Wa = isMobile ? `https://api.whatsapp.com/send?phone=${p1Clean}&text=${encodeURIComponent(msg)}` : `https://web.whatsapp.com/send?phone=${p1Clean}&text=${encodeURIComponent(msg)}`;
    const p2Wa = isMobile ? `https://api.whatsapp.com/send?phone=${p2Clean}&text=${encodeURIComponent(msg)}` : `https://web.whatsapp.com/send?phone=${p2Clean}&text=${encodeURIComponent(msg)}`;

    container.innerHTML = `
      <div class="card" style="border: 2px solid var(--color-danger); box-shadow: var(--shadow-glow);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
          <div>
            <span style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1px;">EMERGENCY VICTIM NAME</span>
            <h1 style="font-size: 1.8rem; font-weight: 800;">${profile.name}</h1>
            ${profile.vehicleNumber ? `<div style="font-size: 0.85rem; color: var(--color-accent); margin-top: 2px;">🚗 Vehicle Plate: <strong>${profile.vehicleNumber}</strong></div>` : ''}
          </div>
          <div class="blood-badge">🩸 ${profile.bloodGroup}</div>
        </div>

        <div style="background: linear-gradient(135deg, rgba(255, 59, 92, 0.2), rgba(0, 210, 211, 0.15)); border: 1px solid var(--color-danger); padding: 18px; border-radius: var(--radius-md); margin-bottom: 24px; text-align: center;">
          <h3 style="margin-bottom: 6px;">📍 Send Live Accident Location to Family</h3>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 12px;">
            Tap below to capture location and alert family via <strong>WhatsApp</strong> or <strong>Cellular SMS</strong>.
          </p>
          <button class="btn btn-primary btn-block" style="font-size: 1.05rem; padding: 14px;" onclick="sosAlert.dispatchBystanderLocation('${profile.id}')">
            🚨 DISPATCH GPS LOCATION & ALERT FAMILY NOW
          </button>
        </div>

        <h3 style="margin-bottom: 12px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">📞 Direct Emergency Call Options</h3>
        
        <div class="contact-box" style="flex-wrap: wrap; gap: 10px;">
          <div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">PRIMARY CONTACT</div>
            <strong style="font-size: 1.1rem;">${profile.primaryContactName}</strong>
            <div style="color: var(--color-accent); font-size: 0.95rem;">${profile.primaryContactPhone}</div>
          </div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <a href="tel:${p1Phone}" class="contact-action-btn" onclick="app.handleCallClick(event, '${p1Phone}')">📞 Cellular Call</a>
            <a href="${p1Wa}" target="_blank" class="contact-action-btn" style="background: #25D366;">💬 WhatsApp Chat</a>
            <button class="btn btn-secondary" style="padding: 6px 10px; font-size: 0.8rem;" onclick="app.copyText('${p1Phone}', 'Phone number copied!')">📋 Copy</button>
          </div>
        </div>

        ${profile.secondaryContactPhone ? `
        <div class="contact-box" style="flex-wrap: wrap; gap: 10px;">
          <div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">SECONDARY CONTACT</div>
            <strong style="font-size: 1.1rem;">${profile.secondaryContactName || 'Family Member'}</strong>
            <div style="color: var(--color-accent); font-size: 0.95rem;">${profile.secondaryContactPhone}</div>
          </div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <a href="tel:${p2Phone}" class="contact-action-btn" onclick="app.handleCallClick(event, '${p2Phone}')">📞 Cellular Call</a>
            <a href="${p2Wa}" target="_blank" class="contact-action-btn" style="background: #25D366;">💬 WhatsApp Chat</a>
            <button class="btn btn-secondary" style="padding: 6px 10px; font-size: 0.8rem;" onclick="app.copyText('${p2Phone}', 'Phone number copied!')">📋 Copy</button>
          </div>
        </div>` : ''}

        <h3 style="margin: 20px 0 12px 0; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">🩺 Critical Triage Medical Info</h3>
        <div class="grid-2">
          <div class="info-badge">
            <div class="info-label">Allergies</div>
            <div class="info-value" style="color: var(--color-danger);">${profile.allergies || 'None declared'}</div>
          </div>
          <div class="info-badge">
            <div class="info-label">Chronic Conditions</div>
            <div class="info-value">${profile.chronicConditions || 'None declared'}</div>
          </div>
          <div class="info-badge">
            <div class="info-label">Current Medications</div>
            <div class="info-value">${profile.currentMedications || 'None declared'}</div>
          </div>
          <div class="info-badge">
            <div class="info-label">Organ Donor</div>
            <div class="info-value" style="color: var(--color-success);">${profile.organDonor ? '✅ Registered Donor' : 'Not specified'}</div>
          </div>
        </div>

        ${profile.isPinProtected ? `
        <div style="margin-top: 20px; text-align: center; border-top: 1px solid var(--border-color); padding-top: 16px;">
          <small style="color: var(--text-muted);">Full Medical History protected by PIN.</small><br>
          <button class="btn btn-secondary" style="margin-top: 8px; font-size: 0.8rem;" onclick="profileManager.promptUnlockPin('${profile.id}')">
            🔒 Enter Doctor/User PIN for Full Records
          </button>
        </div>` : ''}
      </div>
    `;
  },

  handleCallClick(e, phone) {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile) {
      // On desktop PCs, tel: links prompt "Pick an app"
      this.copyText(phone, `Phone number ${phone} copied to clipboard! (Mobile SIM required for direct cellular call)`);
    }
  },

  copyText(text, successMsg) {
    navigator.clipboard.writeText(text).then(() => {
      this.showToast(successMsg, 'success');
    }).catch(() => {
      prompt('Copy phone number:', text);
    });
  },

  async loadFirstAidGuides() {
    try {
      const res = await fetch('/api/firstaid');
      const data = await res.json();
      const container = document.getElementById('firstaid-list-container');
      
      container.innerHTML = data.guides.map(guide => `
        <div class="card" style="margin-bottom: 0;">
          <div style="font-size: 2rem; margin-bottom: 8px;">${guide.icon}</div>
          <h3 style="color: var(--color-accent); margin-bottom: 4px;">${guide.title}</h3>
          <span style="font-size: 0.75rem; padding: 2px 8px; background: rgba(255,255,255,0.1); border-radius: 4px; color: var(--text-muted);">${guide.category}</span>
          <ol style="margin-top: 12px; padding-left: 18px; color: var(--text-secondary); font-size: 0.9rem;">
            ${guide.steps.map(step => `<li style="margin-bottom: 6px;">${step}</li>`).join('')}
          </ol>
        </div>
      `).join('');
    } catch (err) {
      console.error('Failed to load first aid guides:', err);
    }
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${type === 'error' ? '⚠️' : type === 'warning' ? '⚡' : '✅'}</span> <div>${message}</div>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }
};

document.addEventListener('DOMContentLoaded', () => app.init());
