function updatePlayerFields() {
  var role = document.getElementById('role').value;
  var playerFields = document.getElementById('playerFields');

  if (role === 'player') {
    playerFields.style.display = 'block';
  } else {
    playerFields.style.display = 'none';
  }
}

function sendRegister(event) {
  event.preventDefault();

  var nickname = document.getElementById('nickname').value.trim();
  var email = document.getElementById('email').value.trim();
  var password = document.getElementById('password').value;
  var role = document.getElementById('role').value;
  var button = document.getElementById('submitButton');

  if (!nickname || !email || !password) {
    showMessage('formMessage', 'Заполните все поля', 'error');
    return;
  }
  if (password.length < 6) {
    showMessage('formMessage', 'Пароль должен быть не короче 6 символов', 'error');
    return;
  }
  button.disabled = true;
  button.textContent = 'Отправляем...';

  var body = {
    nickname: nickname,
    email: email,
    password: password,
    role: role,
    game_role: document.getElementById('game_role').value,
    region: document.getElementById('region').value,
    elo: document.getElementById('elo').value
  };

  fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
    .then(function (response) { return response.json(); })
    .then(function (data) {
      button.disabled = false;
      button.textContent = 'Зарегистрироваться';

      if (data.error) {
        showMessage('formMessage', data.error, 'error');
        return;
      }

      showMessage('formMessage', 'Готово! Аккаунт создан, сейчас перейдём на страницу входа.', 'ok');
      setTimeout(function () {
        window.location.href = 'login.html';
      }, 1200);
    })
    .catch(function () {
      button.disabled = false;
      button.textContent = 'Зарегистрироваться';
      showMessage('formMessage', 'Сервер не отвечает. Проверьте, запущен ли npm start', 'error');
    });
}

document.getElementById('role').addEventListener('change', updatePlayerFields);
document.getElementById('registerForm').addEventListener('submit', sendRegister);
updatePlayerFields();