
function saveSession(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('userId', user.id);
  localStorage.setItem('nickname', user.nickname);
  localStorage.setItem('role', user.role);
}
function isLoggedIn() {
  var token = localStorage.getItem('token');
  return Boolean(token);
}
function getCurrentUser() {
  if (!isLoggedIn()) {
    return null;
  }
  return {
    id: localStorage.getItem('userId'),
    nickname: localStorage.getItem('nickname'),
    role: localStorage.getItem('role')
  };
}
function logout() {
  var token = localStorage.getItem('token');

  fetch('/api/logout', {
    method: 'POST',
    headers: { 'X-Session-Token': token }
  })
    .then(function () { return true; })
    .catch(function () { return false; })
    .then(function () {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('nickname');
      localStorage.removeItem('role');
      window.location.href = 'index.html';
    });
}
function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'X-Session-Token': localStorage.getItem('token') || ''
  };
}
function showMessage(elementId, text, type) {
  var element = document.getElementById(elementId);
  if (!element) {
    return;
  }

  element.textContent = text;
  element.className = 'message is-visible message--error';
  if (type === 'ok') {
    element.className = 'message is-visible message--ok';
  }
}
function getInitials(nickname) {
  if (!nickname) {
    return '?';
  }
  var parts = nickname.split('_');
  if (parts.length > 1) {
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }
  return nickname.substring(0, 2).toUpperCase();
}
function renderNavigation() {
  var navAccount = document.getElementById('navAccount');
  if (!navAccount) {
    return;
  }

  if (isLoggedIn()) {
    navAccount.textContent = localStorage.getItem('nickname');
    navAccount.href = 'account.html';
    navAccount.className = 'is-active';
  } else {
    navAccount.textContent = 'Вход';
    navAccount.href = 'login.html';
  }
}
function highlightCurrentPage() {
  var page = window.location.pathname.split('/').pop();
  if (page === '') {
    page = 'index.html';
  }

  var links = document.querySelectorAll('.nav a');
  for (var i = 0; i < links.length; i++) {
    var href = links[i].getAttribute('href');
    if (href === page) {
      links[i].className = 'is-active';
    }
  }
}
function isEmail(value) {
  return value.indexOf('@') !== -1 && value.indexOf('.') !== -1;
}

document.addEventListener('DOMContentLoaded', function () {
  renderNavigation();
  highlightCurrentPage();
});