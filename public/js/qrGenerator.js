// QR Code & Printable MedTag Badge Generator Module
const qrGenerator = {
  async renderProfileMedTag(profile) {
    const area = document.getElementById('medtag-preview-area');
    if (!area) return;

    area.innerHTML = '<p style="color: var(--text-secondary);">Generating QR Code and Printable MedTags...</p>';

    try {
      const res = await fetch(`/api/qr/${profile.id}`);
      const data = await res.json();
      const qrUrl = data.qrDataUrl;

      area.innerHTML = `
        <div style="margin-bottom: 24px;">
          <h4 style="margin-bottom: 8px;">📱 Digital Lockscreen QR Code</h4>
          <div class="qr-preview-box">
            <img src="${qrUrl}" alt="Emergency QR Code">
            <div style="font-weight: 800; color: #111; font-size: 0.9rem; margin-top: 4px;">ID: ${profile.id}</div>
          </div>
          <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 8px;">
            Save this image to set as your mobile lockscreen wallpaper.
          </p>
        </div>

        <div style="border-top: 1px solid var(--border-color); padding-top: 20px;">
          <h4 style="margin-bottom: 12px;">📇 Printable Helmet & Wallet MedTag</h4>
          
          <div id="printable-tag-area">
            <div class="printable-tag">
              <div class="printable-tag-header">🚨 EMERGENCY MEDICAL TAG</div>
              <div style="font-weight: 800; font-size: 1.1rem; color: #111;">${profile.name}</div>
              <div style="display: flex; justify-content: space-around; align-items: center; margin: 6px 0;">
                <div>
                  <div style="font-size: 0.65rem; color: #666;">BLOOD TYPE</div>
                  <div class="printable-tag-blood">${profile.bloodGroup}</div>
                </div>
                <div>
                  <img src="${qrUrl}" class="printable-tag-qr" alt="Scan QR">
                </div>
              </div>
              <div style="font-size: 0.75rem; color: #222; font-weight: 600;">
                ICE CONTACT: ${profile.primaryContactPhone}
              </div>
              ${profile.vehicleNumber ? `<div style="font-size: 0.7rem; color: #555; margin-top: 2px;">VEHICLE: ${profile.vehicleNumber}</div>` : ''}
              <div style="font-size: 0.65rem; color: #d63031; font-weight: 700; margin-top: 4px;">
                SCAN WITH ANY CAMERA IN EMERGENCY
              </div>
            </div>
          </div>

          <button class="btn btn-secondary" style="margin-top: 16px; font-size: 0.85rem;" onclick="window.print()">
            🖨️ Print Wallet & Helmet Sticker Tag
          </button>
        </div>
      `;
    } catch (err) {
      console.error(err);
      area.innerHTML = '<p style="color: var(--color-danger);">Failed to render QR Code.</p>';
    }
  }
};
