// Nearby Hospitals & Trauma Center Finder Module (Live GPS & City Geocoding)
const nearbyFinder = {
  currentLat: 12.9716,
  currentLng: 77.5946,
  locationName: 'Detecting Location...',

  locateHospitals(userInitiated = false) {
    const statusBadge = document.getElementById('hospital-status-badge');
    const container = document.getElementById('hospitals-list-container');
    if (!container) return;

    if (userInitiated) {
      app.showToast('Requesting browser GPS location...', 'info');
    }

    if (statusBadge) statusBadge.innerHTML = '📍 Requesting Browser GPS Access...';

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.currentLat = pos.coords.latitude;
          this.currentLng = pos.coords.longitude;
          if (statusBadge) {
            statusBadge.innerHTML = `✅ Live GPS Active (${this.currentLat.toFixed(4)}, ${this.currentLng.toFixed(4)})`;
          }
          app.showToast('Live GPS Location detected!', 'success');
          this.fetchHospitals(this.currentLat, this.currentLng);
        },
        (err) => {
          console.warn('Geolocation error/denied:', err);
          if (statusBadge) {
            statusBadge.innerHTML = '⚠️ GPS permission denied. Showing city search results or default center.';
          }
          if (userInitiated) {
            app.showToast('GPS access denied or unavailable. You can enter your City/Pincode below!', 'warning');
          }
          this.fetchHospitals(this.currentLat, this.currentLng);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      this.fetchHospitals(this.currentLat, this.currentLng);
    }
  },

  async searchByCity() {
    const input = document.getElementById('hospital-city-input');
    const cityName = input ? input.value.trim() : '';

    if (!cityName) {
      app.showToast('Please enter a City Name or Pincode (e.g., Chennai, Delhi, 600001)', 'error');
      return;
    }

    const container = document.getElementById('hospitals-list-container');
    const statusBadge = document.getElementById('hospital-status-badge');
    container.innerHTML = `<p style="color: var(--text-secondary);">Geocoding location for <strong>"${cityName}"</strong>...</p>`;

    try {
      // Use OpenStreetMap Nominatim Geocoding API to resolve City Name or Pincode to Lat/Lng
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}&limit=1`, {
        headers: { 'User-Agent': 'LifePulseApp/1.0' }
      });
      const data = await res.json();

      if (data && data.length > 0) {
        this.currentLat = parseFloat(data[0].lat);
        this.currentLng = parseFloat(data[0].lon);
        this.locationName = data[0].display_name.split(',')[0];

        if (statusBadge) {
          statusBadge.innerHTML = `📍 Location: <strong>${this.locationName}</strong> (${this.currentLat.toFixed(4)}, ${this.currentLng.toFixed(4)})`;
        }

        app.showToast(`Found location: ${this.locationName}`, 'success');
        this.fetchHospitals(this.currentLat, this.currentLng);
      } else {
        container.innerHTML = `<div class="card" style="border-left: 4px solid var(--color-warning);">Could not find location "${cityName}". Please try another city or pincode.</div>`;
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      container.innerHTML = `<div class="card" style="border-left: 4px solid var(--color-danger);">Geocoding failed. Please check internet connection.</div>`;
    }
  },

  async fetchHospitals(lat, lng) {
    const container = document.getElementById('hospitals-list-container');
    container.innerHTML = '<p style="color: var(--text-secondary);">Querying live emergency hospital database around your coordinates...</p>';

    try {
      const res = await fetch(`/api/hospitals?lat=${lat}&lng=${lng}`);
      const data = await res.json();

      if (!res.ok || !data.hospitals || data.hospitals.length === 0) {
        container.innerHTML = '<div class="card" style="color: var(--color-warning);">No nearby emergency hospitals found for these coordinates. Try searching a major city above!</div>';
        return;
      }

      const isLiveSource = data.source === 'LIVE_GPS_MAPS';

      container.innerHTML = `
        <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 14px;">
          ${isLiveSource ? '🌐 <strong>Source:</strong> Live OpenStreetMap Emergency Database' : '📁 <strong>Source:</strong> Curated Regional Directory'}
          • Found <strong>${data.count} emergency facilities</strong> nearby.
        </div>

        <div class="grid-2">
          ${data.hospitals.map(h => `
            <div class="info-badge" style="background: rgba(18, 24, 36, 0.9); border: 1px solid var(--border-color); border-left: 4px solid var(--color-medical); padding: 16px; border-radius: var(--radius-md);">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; gap: 8px;">
                <h4 style="font-size: 1.1rem; color: var(--text-primary); font-weight: 700;">${h.name}</h4>
                <span style="background: rgba(0, 210, 211, 0.15); color: var(--color-accent); font-weight: 700; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; white-space: nowrap;">
                  📍 ${h.distanceKm} km
                </span>
              </div>
              <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px;">🏢 ${h.address}</p>

              <div style="display: flex; gap: 6px; margin-bottom: 14px; flex-wrap: wrap;">
                ${h.traumaCenter ? '<span style="font-size: 0.7rem; background: rgba(255, 59, 92, 0.2); color: var(--color-danger); padding: 2px 6px; border-radius: 4px;">🚨 Trauma Center</span>' : ''}
                ${h.bloodBank ? '<span style="font-size: 0.7rem; background: rgba(255, 159, 67, 0.2); color: var(--color-warning); padding: 2px 6px; border-radius: 4px;">🩸 Blood Bank</span>' : ''}
                ${h.open24x7 ? '<span style="font-size: 0.7rem; background: rgba(16, 172, 132, 0.2); color: var(--color-success); padding: 2px 6px; border-radius: 4px;">⏰ 24x7 Emergency</span>' : ''}
              </div>

              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <a href="${h.mapsUrl || `https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}`}" target="_blank" class="btn btn-accent" style="flex: 1; font-size: 0.85rem; padding: 8px;">
                  🗺️ Google Maps Route
                </a>
                <a href="tel:${h.ambulancePhone || '108'}" class="btn btn-primary" style="flex: 1; font-size: 0.85rem; padding: 8px;">
                  🚑 Call Ambulance (${h.ambulancePhone || '108'})
                </a>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } catch (err) {
      console.error(err);
      container.innerHTML = '<p style="color: var(--color-danger);">Failed to load nearby hospital data.</p>';
    }
  }
};
