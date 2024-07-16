// public>scripts>dashboard.js
function updateDateTime() {
    const dateTimeContainer = document.querySelector('.datetime-container');
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', timeZoneName: 'short' };
    const formattedDateTime = now.toLocaleDateString('tr-TR', options);
    dateTimeContainer.textContent = formattedDateTime;
  }

  // İlk çalıştırma
  updateDateTime();

  // Belirli aralıklarla güncelle
  setInterval(updateDateTime, 1000); // Her 1 saniyede bir güncelle