// public/scripts/add-details.js
async function getGenderOptions() {
  try {
    const response = await fetch('/public/scripts/get-gender-options'); // Endpoint'ini güncelledik
    const data = await response.json();

    const genderSelect = document.getElementById('gender');

    data.options.forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = option;
      optionElement.textContent = option;
      genderSelect.appendChild(optionElement);
    });
  } catch (error) {
    console.error('Error getting gender options:', error);
  }
}

// Sayfa yüklendiğinde cinsiyet seçeneklerini al
document.addEventListener('DOMContentLoaded', getGenderOptions);
