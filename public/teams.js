// teams.js - список команд с поиском по названию и региону

var allTeams = [];

function buildTeamCard(team) {
  var html = '';

  html += '<div class="card fade-in">';
  html += '  <div class="card__head">';
  html += '    <div class="avatar">' + getInitials(team.name) + '</div>';
  html += '    <div>';
  html += '      <h3 class="card__title">' + team.name + '</h3>';
  html += '      <span class="tag tag--muted">' + team.region + '</span>';
  html += '    </div>';
  html += '  </div>';

  html += '  <div class="card__row"><span>Нужна роль</span><b>' +
    (team.needed_role || 'любая') + '</b></div>';
  html += '  <div class="card__row"><span>Минимальный ELO</span><b>' + team.min_elo + '</b></div>';

  html += '  <p class="card__bio">' + (team.description || 'Описание не заполнено') + '</p>';
  html += '</div>';

  return html;
}

function renderTeams(teams) {
  var container = document.getElementById('teams');
  var count = document.getElementById('teamCount');

  if (teams.length === 0) {
    container.innerHTML = '<div class="empty">Команды не найдены</div>';
    count.textContent = 'Найдено: 0';
    return;
  }

  var html = '';
  for (var i = 0; i < teams.length; i++) {
    html += buildTeamCard(teams[i]);
  }

  container.innerHTML = html;
  count.textContent = 'Найдено команд: ' + teams.length;
}

function applyTeamFilters() {
  var search = document.getElementById('teamSearch').value.toLowerCase();
  var region = document.getElementById('teamRegion').value;

  var filtered = allTeams.filter(function (team) {
    var matchSearch = team.name.toLowerCase().indexOf(search) !== -1;
    var matchRegion = region === 'all' || team.region === region;
    return matchSearch && matchRegion;
  });

  renderTeams(filtered);
}

function loadTeams() {
  fetch('/api/teams')
    .then(function (response) { return response.json(); })
    .then(function (data) {
      if (data.error) {
        document.getElementById('teamCount').textContent = 'Ошибка: ' + data.error;
        return;
      }
      allTeams = data.teams;
      applyTeamFilters();
    })
    .catch(function () {
      document.getElementById('teamCount').textContent =
        'Сервер не отвечает. Проверьте, запущен ли npm start';
    });
}

document.getElementById('teamSearch').addEventListener('input', applyTeamFilters);
document.getElementById('teamRegion').addEventListener('change', applyTeamFilters);

loadTeams();