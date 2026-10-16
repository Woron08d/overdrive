function getPlayerIdFromUrl() {
  var params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function showPlayer(player) {
  var box = document.getElementById('playerBox');
  var html = '';

  html += '<div class="card__head">';
  html += '  <div class="avatar">' + getInitials(player.nickname) + '</div>';
  html += '  <div>';
  html += '    <h1>' + player.nickname + '</h1>';
  html += '    <span class="tag tag--accent">' + player.game_role + '</span> ';
  html += '    <span class="tag tag--muted">' + player.region + '</span>';
  html += '  </div>';
  html += '</div>';

  html += '<div class="card__row"><span>Рейтинг ELO</span><b>' + player.elo + '</b></div>';
  html += '<div class="card__row"><span>Статус</span><b>' +
    (player.looking === 'team' ? 'Ищет команду' : 'Не ищет команду') + '</b></div>';

  html += '<h3 style="margin-top:18px">О себе</h3>';
  html += '<p class="card__bio">' + (player.bio || 'Игрок пока не заполнил описание') + '</p>';

  html += '<div class="card__actions">';
  html += '  <button class="button" type="button" onclick="invitePlayer(' + player.id +
    ', \'' + player.nickname + '\')">Пригласить в команду</button>';
  html += '  <a class="button button--ghost" href="players.html">Назад в каталог</a>';
  html += '</div>';

  box.innerHTML = html;
}

function loadPlayer() {
  var id = getPlayerIdFromUrl();
  var box = document.getElementById('playerBox');

  if (!id) {
    box.innerHTML = '<div class="empty">Игрок не указан. <a href="players.html">Вернуться в каталог</a></div>';
    return;
  }

  fetch('/api/players/' + id)
    .then(function (response) { return response.json(); })
    .then(function (data) {
      if (data.error) {
        box.innerHTML = '<div class="empty">' + data.error +
          '. <a href="players.html">Вернуться в каталог</a></div>';
        return;
      }
      showPlayer(data.player);
    })
    .catch(function () {
      box.innerHTML = '<div class="empty">Сервер не отвечает</div>';
    });
}

function invitePlayer(playerId, nickname) {
  if (!isLoggedIn()) {
    alert('Чтобы приглашать игроков, войдите в систему');
    window.location.href = 'login.html';
    return;
  }

  var message = prompt('Сообщение для игрока ' + nickname + ':', 'Приглашаем вас в наш состав');
  if (message === null) {
    return;
  }

  fetch('/api/invitations', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ player_id: playerId, message: message })
  })
    .then(function (response) { return response.json(); })
    .then(function (data) {
      if (data.error) {
        alert(data.error);
        return;
      }
      alert('Приглашение отправлено');
    })
    .catch(function () { alert('Сервер не отвечает'); });
}

loadPlayer();