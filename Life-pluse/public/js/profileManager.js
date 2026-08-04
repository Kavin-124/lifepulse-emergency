// Profile Manager Module
const profileManager = {
  loadSavedLocalProfile() {
    const localId = localStorage.getItem('lifepulse_user_id') || 'LP-712653';
    if (localId) {
      this.fetchAndPopulateProfile(localId);
    }
  },

  quickLoad(profileId) {
    const input = document.getElementById('load-profile-input');
    if (input) input.value = profileId;
    this.loadProfileByIdOrVehicle();
  },

  async loadProfileByIdOrVehicle() {
    const input = document.getElementById('load-profile-input');
    const query = input ? input.value.trim().toUpperCase() : '';

    if (!query) {
      app.showToast('Please enter your Profile ID (e.g. LP-712653) or Vehicle Plate', 'error');
      return;
    }

    try {
      let res = await fetch(`/api/profile/${query}`);
      if (res.ok) {
        const data = await res.json();
        this.populateForm(data.profile);
        localStorage.setItem('lifepulse_user_id', data.profile.id);
        app.showToast(`Loaded profile for ${data.profile.name}!`, 'success');
        return;
      }

      res = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
      if (res.ok) {
        const searchData = await res.json();
        if (searchData.count > 0) {
          const profileId = searchData.results[0].id;
          await this.fetchAndPopulateProfile(profileId);
          localStorage.setItem('lifepulse_user_id', profileId);
          app.showToast(`Loaded profile for ${searchData.results[0].name}!`, 'success');
          return;
        }
      }

      app.showToast(`No profile found matching "${query}"`, 'error');
    } catch (err) {
      app.showToast('Failed to load profile.', 'error');
    }
  },

  async fetchAndPopulateProfile(profileId) {
    try {
      const res = await fetch(`/api/profile/${profileId}`);
      if (!res.ok) return;
      const data = await res.json();
      this.populateForm(data.profile);
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  },

  populateForm(p) {
    document.getElementById('profile-id').value = p.id || '';
    document.getElementById('prof-name').value = p.name || '';
    if (document.getElementById('prof-photo')) document.getElementById('prof-photo').value = p.photoUrl || '';
    document.getElementById('prof-blood').value = p.bloodGroup || '';
    document.getElementById('prof-age').value = p.age || '';
    document.getElementById('prof-gender').value = p.gender || 'Male';
    document.getElementById('prof-vehicle').value = p.vehicleNumber || '';
    document.getElementById('prof-contact1-name').value = p.primaryContactName || '';
    document.getElementById('prof-contact1-phone').value = p.primaryContactPhone || '';
    document.getElementById('prof-contact2-name').value = p.secondaryContactName || '';
    document.getElementById('prof-contact2-phone').value = p.secondaryContactPhone || '';
    document.getElementById('prof-allergies').value = p.allergies || '';
    document.getElementById('prof-conditions').value = p.chronicConditions || '';
    document.getElementById('prof-meds').value = p.currentMedications || '';
    document.getElementById('prof-organ').value = p.organDonor ? 'true' : 'false';

    qrGenerator.renderProfileMedTag(p);
  },

  async saveProfile(event) {
    event.preventDefault();

    const payload = {
      id: document.getElementById('profile-id').value || null,
      name: document.getElementById('prof-name').value.trim(),
      photoUrl: document.getElementById('prof-photo')?.value.trim() || '',
      bloodGroup: document.getElementById('prof-blood').value,
      age: document.getElementById('prof-age').value,
      gender: document.getElementById('prof-gender').value,
      vehicleNumber: document.getElementById('prof-vehicle').value.trim(),
      primaryContactName: document.getElementById('prof-contact1-name').value.trim(),
      primaryContactPhone: document.getElementById('prof-contact1-phone').value.trim(),
      secondaryContactName: document.getElementById('prof-contact2-name').value.trim(),
      secondaryContactPhone: document.getElementById('prof-contact2-phone').value.trim(),
      allergies: document.getElementById('prof-allergies').value.trim(),
      chronicConditions: document.getElementById('prof-conditions').value.trim(),
      currentMedications: document.getElementById('prof-meds').value.trim(),
      organDonor: document.getElementById('prof-organ').value,
      pin: document.getElementById('prof-pin').value.trim() || '1234'
    };

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save profile');

      localStorage.setItem('lifepulse_user_id', data.profile.id);
      document.getElementById('profile-id').value = data.profile.id;

      app.showToast('Emergency profile & MedTags saved successfully!', 'success');
      qrGenerator.renderProfileMedTag(data.profile);
    } catch (err) {
      app.showToast(err.message, 'error');
    }
  },

  async promptUnlockPin(profileId) {
    const pin = prompt('Enter 4-digit Security PIN to view full private medical records:');
    if (!pin) return;

    try {
      const res = await fetch(`/api/profile/${profileId}?pin=${encodeURIComponent(pin)}`);
      const data = await res.json();

      if (data.accessType === 'FULL') {
        app.showToast('PIN verified! Unlocking full records...', 'success');
        app.renderBystanderCard(data.profile);
      } else {
        app.showToast('Incorrect PIN. Access denied.', 'error');
      }
    } catch (err) {
      app.showToast('Failed to verify PIN.', 'error');
    }
  }
};
