// Vehicle & Public Emergency Lookup Module
const vehicleLookup = {
  async performSearch() {
    const input = document.getElementById('vehicle-search-input');
    const query = input ? input.value.trim() : '';

    if (!query) {
      app.showToast('Please enter a vehicle license plate number (e.g. KA01AB1234)', 'error');
      return;
    }

    this.quickSearch(query);
  },

  async quickSearch(query) {
    const resultsArea = document.getElementById('search-results-area');
    resultsArea.innerHTML = `<div class="card" style="text-align: center; color: var(--text-secondary);">Searching emergency records for <strong>${query}</strong>...</div>`;

    try {
      const res = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Search failed');

      if (data.count === 0) {
        resultsArea.innerHTML = `
          <div class="card" style="border-left: 4px solid var(--color-warning);">
            <h3>🔍 No Registered Emergency Record Found</h3>
            <p style="color: var(--text-secondary); margin-top: 6px;">
              No vehicle plate or ID matched <code>${query}</code>. Please check for typos or ensure the owner has registered their vehicle number on LifePulse.
            </p>
          </div>
        `;
        return;
      }

      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      resultsArea.innerHTML = data.results.map(profile => {
        const p1Phone = (profile.primaryContactPhone || '').replace(/[^0-9+]/g, '');
        const p2Phone = (profile.secondaryContactPhone || '').replace(/[^0-9+]/g, '');
        const p1Clean = p1Phone.replace(/[^0-9]/g, '');
        const p2Clean = p2Phone.replace(/[^0-9]/g, '');

        const msg = `🚨 EMERGENCY ALERT: I am contacting regarding ${profile.name}'s vehicle (${profile.vehicleNumber}).`;
        const p1Wa = isMobile ? `https://api.whatsapp.com/send?phone=${p1Clean}&text=${encodeURIComponent(msg)}` : `https://web.whatsapp.com/send?phone=${p1Clean}&text=${encodeURIComponent(msg)}`;
        const p2Wa = isMobile ? `https://api.whatsapp.com/send?phone=${p2Clean}&text=${encodeURIComponent(msg)}` : `https://web.whatsapp.com/send?phone=${p2Clean}&text=${encodeURIComponent(msg)}`;

        return `
          <div class="card" style="border: 2px solid var(--color-accent); box-shadow: var(--shadow-glow);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
              <div style="display: flex; gap: 14px; align-items: center;">
                <img src="${profile.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=ff3b5c&color=fff&size=150`}" 
                     alt="${profile.name}" 
                     style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 2px solid var(--color-accent); box-shadow: 0 4px 10px rgba(0,210,211,0.3);" />
                <div>
                  <span style="font-size: 0.75rem; color: var(--color-accent); font-weight: 700; text-transform: uppercase;">REGISTERED OWNER / RIDER</span>
                  <h2 style="font-size: 1.6rem; font-weight: 800; margin: 0;">${profile.name}</h2>
                  <div style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 2px;">
                    🚗 Vehicle Plate: <strong style="color: var(--text-primary); text-transform: uppercase;">${profile.vehicleNumber || 'Unregistered'}</strong>
                  </div>
                </div>
              </div>
              <div class="blood-badge">🩸 ${profile.bloodGroup}</div>
            </div>

            <div style="background: rgba(0, 210, 211, 0.08); border: 1px dashed var(--color-accent); padding: 14px; border-radius: var(--radius-md); margin-bottom: 16px;">
              <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 8px;">
                🚨 <strong>Bystander Action:</strong> Tap below to send live location coordinates to ${profile.name}'s family.
              </div>
              <button class="btn btn-accent btn-block" onclick="sosAlert.dispatchBystanderLocation('${profile.id}')">
                📍 SEND ACCIDENT LOCATION PIN TO FAMILY NOW
              </button>
            </div>

            <h4 style="margin-bottom: 10px;">📞 Direct Emergency Call Options</h4>
            <div class="contact-box" style="flex-wrap: wrap; gap: 10px;">
              <div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">PRIMARY CONTACT</div>
                <strong>${profile.primaryContactName}</strong>
                <div style="color: var(--color-accent); font-size: 0.9rem;">${profile.primaryContactPhone}</div>
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
                <strong>${profile.secondaryContactName || 'Family Member'}</strong>
                <div style="color: var(--color-accent); font-size: 0.9rem;">${profile.secondaryContactPhone}</div>
              </div>
              <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                <a href="tel:${p2Phone}" class="contact-action-btn" onclick="app.handleCallClick(event, '${p2Phone}')">📞 Cellular Call</a>
                <a href="${p2Wa}" target="_blank" class="contact-action-btn" style="background: #25D366;">💬 WhatsApp Chat</a>
                <button class="btn btn-secondary" style="padding: 6px 10px; font-size: 0.8rem;" onclick="app.copyText('${p2Phone}', 'Phone number copied!')">📋 Copy</button>
              </div>
            </div>` : ''}

            <div style="margin-top: 14px; text-align: right;">
              <button class="btn btn-secondary" style="font-size: 0.85rem;" onclick="app.switchTab('bystander-tab'); app.loadBystanderProfile('${profile.id}')">
                📋 Open Full Bystander Card →
              </button>
            </div>
          </div>
        `;
      }).join('');

    } catch (err) {
      resultsArea.innerHTML = `<div class="card" style="border-left: 4px solid var(--color-danger); color: var(--color-danger);">Failed to search: ${err.message}</div>`;
    }
  }
};
