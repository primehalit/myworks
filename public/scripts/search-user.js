async function liveSearch() {
    const input = document.getElementById('searchedUsername');
    const resultContainer = document.getElementById('searchResults');
    resultContainer.innerHTML = '';  // Clear previous results
  
    const query = input.value.trim();
  
    if (query !== '') {
      try {
        const response = await fetch(`/live-search?query=${query}`);
        const data = await response.json();
  
        data.forEach(user => {
          const listItem = document.createElement('li');
          listItem.textContent = user.username;
          listItem.classList.add('list-group-item');
          listItem.addEventListener('click', async function() {
            const userDetailsResponse = await fetch(`/user-details/${user._id}`);
            const userDetailsData = await userDetailsResponse.json();
            // Gender bilgisini getirmek için ayrı bir sorgu yapalım
            const userGenderResponse = await fetch(`/get-user-gender/${user._id}`);
            const userGenderData = await userGenderResponse.json();
            // Gender bilgisini userDetailsData nesnesine ekleyelim
            userDetailsData.gender = userGenderData.gender;
            updateDetails(userDetailsData);
          });
          resultContainer.appendChild(listItem);
        });
      } catch (error) {
        console.error('Live search sırasında hata oluştu:', error);
      }
    }
  }

  function updateDetails(data) {
    const userDetailsContainer = document.getElementById('userDetails');
    userDetailsContainer.innerHTML = '';

    if (data.error) {
      const errorElement = document.createElement('p');
      errorElement.classList.add('text-danger');
      errorElement.textContent = data.error;
      userDetailsContainer.appendChild(errorElement);
    } else {
      const userElement = document.createElement('h2');
      userElement.textContent = 'Kullanıcı Detayları';
      userDetailsContainer.appendChild(userElement);

      const usernameElement = document.createElement('p');
      usernameElement.textContent = `Kullanıcı İsmi: ${data.user.username}`;
      userDetailsContainer.appendChild(usernameElement);

      if (data.details.length > 0) {
        const postgresDetailsElement = document.createElement('h2');
        postgresDetailsElement.textContent = 'PostgreSQL Kullanıcı Detayları';
        userDetailsContainer.appendChild(postgresDetailsElement);

        const ulElement = document.createElement('ul');
        ulElement.classList.add('list-group');
        data.details.forEach(detail => {
          const liElement = document.createElement('li');
          liElement.classList.add('list-group-item');
          liElement.textContent = `Şehir: ${detail.city}, Doğum Tarihi: ${detail.birthdate}`;
          ulElement.appendChild(liElement);
        });
        userDetailsContainer.appendChild(ulElement);
      } else {
        const noDetailsElement = document.createElement('p');
        noDetailsElement.textContent = 'Bu kullanıcının detayı Veritabanında bulunamadı.';
        userDetailsContainer.appendChild(noDetailsElement);
      }

      if (data.gender) {
        const genderElement = document.createElement('p');
        genderElement.textContent = `Cinsiyet: ${data.gender}`;
        userDetailsContainer.appendChild(genderElement);
      }
    }
  }

  // Sayfa yüklendiğinde cinsiyet seçeneklerini al
document.addEventListener('DOMContentLoaded', async function() {
await getGenderOptions();

// Live search sonuçlarını dinamik olarak oluştur
const resultContainer = document.getElementById('searchResults');
resultContainer.addEventListener('click', async function(event) {
  if (event.target.tagName === 'LI') {
    const username = event.target.textContent;
    const userDetailsResponse = await fetch(`/user-details/${username}`);
    const userDetailsData = await userDetailsResponse.json();

    // Cinsiyet bilgisini getirmek için ayrı bir sorgu yapalım
    const userGenderResponse = await fetch(`/get-user-gender/${username}`);
    const userGenderData = await userGenderResponse.json();

    // Cinsiyet bilgisini userDetailsData nesnesine ekleyelim
    userDetailsData.gender = userGenderData.gender;
    updateDetails(userDetailsData);
  }
});
});

