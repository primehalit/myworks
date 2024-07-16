// public/scripts/deleteAccount.js
function submitForm() {
  var password = document.getElementById('password').value;
  var confirmPassword = document.getElementById('confirmPassword').value;

  if (password !== confirmPassword) {
    document.getElementById('errorMessage').innerText = "Şifreler eşleşmiyor.";
  } else {
    document.getElementById('deleteAccountForm').submit();
  }
}