
function renderProfile(user) {
  var box = document.getElementById('profileBox');
  var html = '';

  html += '<div class="card__head">';
  html += '  <div class="avatar">' + getInitials(user.nickname) + '</div>';
  html += '  <div>';
  html += '    <h1>' + user.nickname + '</h1>';
  html += '    <span class="tag tag--accent">' +
    (user.role === 'team' ? 'Команда' : 'Игрок') + '</span>';
  html += '  </div>';
  html += '</div>';

  html += '<div class="card__row"><span>Электронная почта</span><b>' + user.email + '</b></div>';
  html += '<div class="card__row"><span>Номер аккаунта</span><b>' + user.id + '</b></div>';

  html += '<div class="card__actions">';
  html += '  <button class="button button--danger button--small" type="button" onclick="logout()">Выйти из аккаунта</button>';
  html += '</div>';

  box.innerHTML = html;
}
function fillProfileForm(player) {
  document.getElementById('game_role').value = player.game_role;
  document.getElementById('region').value = player.region;
  document.getElementById('elo').value = player.elo;
  document.getElementById('looking').value = player.looking;
  document.getElementById('bio').value = player.bio || '';
}
function saveProfile(event) {
  event.preventDefault();

  var button = document.getElementById('saveProfileButton');
  button.disabled = true;
  button.textContent = 'Сохраняем...';

  var body = {
    game_role: document.getElementById('game_role').value,
    region: document.getElementById('region').value,
    elo: document.getElementById('elo').value,
    looking: document.getElementById('looking').value,
    bio: document.getElementById('bio').value
  };

  fetch('/api/players/me', {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(body)
  })
    .then(function (response) { return response.json(); })
    .then(function (data) {
      button.disabled = false;
      button.textContent = 'Сохранить анкету';

      if (data.error) {
        showMessage('profileMessage', data.error, 'error');
        return;
      }
      showMessage('profileMessage', 'Анкета сохранена', 'ok');
    })
    .catch(function () {
      button.disabled = false;
      button.textContent = 'Сохранить анкету';
      showMessage('profileMessage', 'Сервер не отвечает', 'error');
    });
}

function buildInvitationItem(item) {
  var statusText = 'Ожидает ответа';
  var statusClass = 'tag--muted';

  if (item.status === 'accepted') {
    statusText = 'Принято';
    statusClass = 'tag--ok';
  }
  if (item.status === 'rejected') {
    statusText = 'Отклонено';
    statusClass = 'tag--bad';
  }

  var html = '';
  html += '<div class="list-item fade-in">';
  html += '  <div class="list-item__head">';
  html += '    <div><b>Команда ' + item.team_name + '</b> ' +
    '<span class="tag tag--muted">' + item.region + '</span> ' +
    '<span class="tag ' + statusClass + '">' + statusText + '</span></div>';
  if (item.status === 'pending') {
    html += '    <div class="card__actions">';
    html += '      <button class="button button--small" type="button" onclick="answerInvitation(' +
      item.id + ', \'accepted\')">Принять</button>';
    html += '      <button class="button button--danger button--small" type="button" onclick="answerInvitation(' +
      item.id + ', \'rejected\')">Отклонить</button>';
    html += '    </div>';
  }

  html += '  </div>';
  html += '  <p class="list-item__text">' + (item.message || 'Без сообщения') + '</p>';
  if (item.needed_role) {
    html += '  <p class="list-item__text">Нужна роль: ' + item.needed_role +
      ', минимальный ELO: ' + item.min_elo + '</p>';
  }
  html += '</div>';

  return html;
}                                    
function loadInbox() {
  fetch('/api/invitations', { headers: authHeaders() })
    .then(function (response) { return response.json(); })
    .then(function (data) {
      var list = document.getElementById('inboxList');

      if (data.error) {
        list.innerHTML = '<div class="empty">' + data.error + '</div>';
        return;
      }
      if (data.invitations.length === 0) {
        list.innerHTML = '<div class="empty">Приглашений пока нет</div>';
        return;
      }

      var html = '';
      for (var i = 0; i < data.invitations.length; i++) {
        html += buildInvitationItem(data.invitations[i]);
      }
      list.innerHTML = html;
    })
    .catch(function () {
      document.getElementById('inboxList').innerHTML =
        '<div class="empty">Сервер не отвечает</div>';
    });
}
function answerInvitation(invitationId, status) {
  fetch('/api/invitations/' + invitationId, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ status: status })
  })
    .then(function (response) { return response.json(); })
    .then(function (data) {
      if (data.error) {
        alert(data.error);
        return;
      }
      loadInbox();
    })
    .catch(function () { alert('Сервер не отвечает'); });
}
function loadSent() {
  fetch('/api/invitations/sent', { headers: authHeaders() })
    .then(function (response) { return response.json(); })
    .then(function (data) {
      var list = document.getElementById('sentList');

      if (data.error) {
        list.innerHTML = '<div class="empty">' + data.error + '</div>';
        return;
      }
      if (data.invitations.length === 0) {
        list.innerHTML = '<div class="empty">Вы ещё никого не приглашали</div>';
        return;
      }

      var html = '';
      for (var i = 0; i < data.invitations.length; i++) {
        var item = data.invitations[i];
        var statusText = 'Ожидает';
        if (item.status === 'accepted') { statusText = 'Принято'; }
        if (item.status === 'rejected') { statusText = 'Отклонено'; }

        html += '<div class="list-item fade-in">';
        html += '  <div class="list-item__head">';
        html += '    <div><b>' + (item.player_nickname || 'Игрок') + '</b> ' +
          '<span class="tag tag--muted">' + (item.game_role || '') + '</span> ' +
          '<span class="tag tag--muted">ELO ' + (item.elo || 0) + '</span></div>';
        html += '    <span class="tag tag--muted">' + statusText + '</span>';
        html += '  </div>';
        html += '  <p class="list-item__text">' + (item.message || 'Без сообщения') + '</p>';
        html += '</div>';
      }
      list.innerHTML = html;
    })
    .catch(function () {
      document.getElementById('sentList').innerHTML =
        '<div class="empty">Сервер не отвечает</div>';
    });
}
function loadPlayerProfile() {
  var user = getCurrentUser();

  if (user.role === 'team') {
    document.getElementById('teamSection').style.display = 'block';
    document.getElementById('sentSection').style.display = 'block';
    document.getElementById('teamBox').innerHTML =
      '<p>Аккаунт команды. Приглашения игрокам отправляются со страницы ' +
      '<a href="players.html">«Игроки»</a>.</p>';
    loadSent();
    return;
  }

  document.getElementById('playerSection').style.display = 'block';
  document.getElementById('inboxSection').style.display = 'block';

  fetch('/api/me', { headers: authHeaders() })
    .then(function (response) { return response.json(); })
    .then(function (data) {
      if (data.error) {
        return;
      }
      fetch('/api/players')
        .then(function (response) { return response.json(); })
        .then(function (playersData) {
          var players = playersData.players || [];
          for (var i = 0; i < players.length; i++) {
            if (String(players[i].user_id) === String(data.user.id)) {
              fillProfileForm(players[i]);
              return;
            }
          }
        });
    });

  loadInbox();
}
function startAccount() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
    return;
  }

  fetch('/api/me', { headers: authHeaders() })
    .then(function (response) { return response.json(); })
    .then(function (data) {
      if (data.error) {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
        return;
      }

      renderProfile(data.user);
      loadPlayerProfile();
    })
    .catch(function () {
      document.getElementById('profileBox').innerHTML =
        '<div class="empty">Сервер не отвечает. Проверьте, запущен ли npm start</div>';
    });
}

document.getElementById('profileForm').addEventListener('submit', saveProfile);
document.getElementById('reloadButton').addEventListener('click', loadInbox);

startAccount();