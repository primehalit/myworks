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
            updateDetails(userDetailsData);
          });
          resultContainer.appendChild(listItem);
        });
      } catch (error) {
        console.error('Error during live search:', error);
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
      usernameElement.textContent = `Kullanıcı Ismi: ${data.user.username}`;
      userDetailsContainer.appendChild(usernameElement);

      if (data.details.length > 0) {
        const postgresDetailsElement = document.createElement('h2');
        postgresDetailsElement.textContent = 'Kullanıcı PostgreSQL Detayları';
        userDetailsContainer.appendChild(postgresDetailsElement);

        const ulElement = document.createElement('ul');
        ulElement.classList.add('list-group');
        data.details.forEach(detail => {
          const liElement = document.createElement('li');
          liElement.classList.add('list-group-item');
          liElement.textContent = `City: ${detail.city}, Birthdate: ${detail.birthdate}`;
          ulElement.appendChild(liElement);
        });
        userDetailsContainer.appendChild(ulElement);
      } else {
        const noDetailsElement = document.createElement('p');
        noDetailsElement.textContent = 'Bu kullanıcı için PostgreSQLde Detayı bulunamadı.';
        userDetailsContainer.appendChild(noDetailsElement);
      }
    }
  }

  // Şifre görünürlüğünü değiştiren fonksiyon
  function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const passwordToggle = document.querySelector('.password-toggle');

    // Şifrenin tipini değiştir (görünür veya gizli)
    passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';

    // Göz simgesini değiştir
    passwordToggle.innerHTML = passwordInput.type === 'password'
      ? '<i class="bi bi-eye"></i>' // Göz simgesi
      : '<i class="bi bi-eye-slash"></i>'; // Göz çizgisi üzerinde çarpı simgesi
  }