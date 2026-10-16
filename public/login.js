// login.js - логика страницы входа

function sendLogin(event) {
  event.preventDefault();

  var nickname = document.getElementById('nickname').value.trim();
  var password = document.getElementById('password').value;
  var button = document.getElementById('submitButton');

  if (!nickname || !password) {
    showMessage('formMessage', 'Введите логин и пароль', 'error');
    return;
  }

  button.disabled = true;
  button.textContent = 'Проверяем...';

  fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nickname: nickname, password: password })
  })
    .then(function (response) { return response.json(); })
    .then(function (data) {
      button.disabled = false;
      button.textContent = 'Войти';

      if (data.error) {
        showMessage('formMessage', data.error, 'error');
        return;
      }
      saveSession(data.token, data.user);

      showMessage('formMessage', 'Вход выполнен! Открываем личный кабинет...', 'ok');
      setTimeout(function () {
        window.location.href = 'account.html';
      }, 700);
    })
    .catch(function () {
      button.disabled = false;
      button.textContent = 'Войти';
      showMessage('formMessage', 'Сервер не отвечает. Проверьте, запущен ли npm start', 'error');
    });
}

document.getElementById('loginForm').addEventListener('submit', sendLogin);