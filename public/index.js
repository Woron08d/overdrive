function loadStats() {
  fetch('/api/stats')
    .then(function (response) { return response.json(); })
    .then(function (data) {
      if (data.error) {
        return;
      }
      document.getElementById('statPlayers').textContent = data.players;
      document.getElementById('statTeams').textContent = data.teams;
      document.getElementById('statLooking').textContent = data.looking;
    })
    .catch(function () {
      document.getElementById('statPlayers').textContent = '—';
      document.getElementById('statTeams').textContent = '—';
      document.getElementById('statLooking').textContent = '—';
    });
}

loadStats();