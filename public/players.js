var allPlayers = [];

function buildCard(player) {
  var html = '';

  html += '<div class="card fade-in">';
  html += '  <div class="card__head">';
  html += '    <div class="avatar">' + getInitials(player.nickname) + '</div>';
  html += '    <div>';
  html += '      <h3 class="card__title">' + player.nickname + '</h3>';
  html += '      <span class="tag tag--accent">' + player.game_role + '</span>';
  html += '    </div>';
  html += '  </div>';

  html += '  <div class="card__row"><span>ELO</span><b>' + player.elo + '</b></div>';
  html += '  <div class="card__row"><span>Регион</span><b>' + player.region + '</b></div>';
  html += '  <div class="card__row"><span>Статус</span><b>' +
    (player.looking === 'team' ? 'Ищет команду' : 'Не ищет') + '</b></div>';

  html += '  <p class="card__bio">' + (player.bio || 'Описание не заполнено') + '</p>';

  html += '  <div class="card__actions">';
  html += '    <button class="button button--small" type="button" onclick="invitePlayer(' +
    player.id + ', \'' + player.nickname + '\')">Пригласить</button>';
  html += '    <a class="button button--ghost button--small" href="player.html?id=' +
    player.id + '">Подробнее</a>';
  html += '  </div>';

  html += '</div>';
  return html;
}
function renderPlayers(players) {
  var container = document.getElementById('players');
  var countText = document.getElementById('countText');

  if (players.length === 0) {
    container.innerHTML = '<div class="empty">Игроки не найдены. Измените условия поиска.</div>';
    countText.textContent = 'Найдено: 0';
    return;
  }

  var html = '';
  for (var i = 0; i < players.length; i++) {
    html += buildCard(players[i]);
  }

  container.innerHTML = html;
  countText.textContent = 'Найдено игроков: ' + players.length;
}
function applyFilters() {
  var search = document.getElementById('search').value.toLowerCase();
  var role = document.getElementById('roleFilter').value;
  var region = document.getElementById('regionFilter').value;
  var look = document.getElementById('lookFilter').value;
  var sort = document.getElementById('sortFilter').value;

  var filtered = allPlayers.filter(function (player) {
    var matchSearch = player.nickname.toLowerCase().indexOf(search) !== -1;
    var matchRole = role === 'all' || player.game_role === role;
    var matchRegion = region === 'all' || player.region === region;
    var matchLook = look === 'all' || player.looking === look;

    return matchSearch && matchRole && matchRegion && matchLook;
  });

  filtered.sort(function (a, b) {
    if (sort === 'elo_asc') {
      return a.elo - b.elo;
    }
    if (sort === 'nickname') {
      return a.nickname.localeCompare(b.nickname, 'ru');
    }
    return b.elo - a.elo;
  });

  renderPlayers(filtered);
}
function loadPlayers() {
  fetch('/api/players')
    .then(function (response) { return response.json(); })
    .then(function (data) {
      if (data.error) {
        document.getElementById('countText').textContent = 'Ошибка: ' + data.error;
        return;
      }

      allPlayers = data.players;
      applyFilters();
    })
    .catch(function () {
      document.getElementById('countText').textContent =
        'Сервер не отвечает. Проверьте, запущен ли npm start';
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
      alert('Приглашение отправлено игроку ' + nickname);
    })
    .catch(function () {
      alert('Сервер не отвечает');
    });
}

document.getElementById('search').addEventListener('input', applyFilters);
document.getElementById('roleFilter').addEventListener('change', applyFilters);
document.getElementById('regionFilter').addEventListener('change', applyFilters);
document.getElementById('lookFilter').addEventListener('change', applyFilters);
document.getElementById('sortFilter').addEventListener('change', applyFilters);

document.getElementById('resetButton').addEventListener('click', function () {
  document.getElementById('search').value = '';
  document.getElementById('roleFilter').value = 'all';
  document.getElementById('regionFilter').value = 'all';
  document.getElementById('lookFilter').value = 'all';
  document.getElementById('sortFilter').value = 'elo_desc';
  applyFilters();
});

loadPlayers();