import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from './db.js';
import { makeHash, makeToken } from './hash.js';

const app = express();
app.use(express.json());
app.use(express.static('public'));
const thisFolder = path.dirname(fileURLToPath(import.meta.url));
function toInt(value, defaultValue) {
  const number = parseInt(value, 10);
  if (isNaN(number)) {
    return defaultValue;
  }
  return number;
}
async function findUserByToken(req) {
  const token = req.headers['x-session-token'];
  if (!token) {
    return null;
  }

  const result = await query(
    'SELECT users.id, users.nickname, users.email, users.role FROM sessions ' +
      'JOIN users ON users.id = sessions.user_id WHERE sessions.token = $1',
    [token]
  );

  if (result.rows.length === 0) {
    return null;
  }
  return result.rows[0];
}
app.get('/hello', function (req, res) {
  res.send('Привет! Сервер OverDrive работает.');
});
app.get('/api/tables', async function (req, res) {
  try {
    const result = await query(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public'"
    );
    res.json(result.rows);
  } catch (error) {
    res.json({ error: error.message });
  }
});
app.post('/api/register', async function (req, res) {
  try {
    const nickname = req.body.nickname;
    const email = req.body.email;
    const password = req.body.password;
    const role = req.body.role;

    if (!nickname || !email || !password) {
      return res.json({ error: 'Заполните все поля' });
    }
    if (password.length < 6) {
      return res.json({ error: 'Пароль должен быть не короче 6 символов' });
    }
    if (nickname.length > 50) {
      return res.json({ error: 'Никнейм слишком длинный (максимум 50 символов)' });
    }
    if (email.indexOf('@') === -1) {
      return res.json({ error: 'Почта указана неверно' });
    }
    let userRole = 'player';
    if (role === 'team') {
      userRole = 'team';
    }

    const hash = makeHash(password);

    const result = await query(
      'INSERT INTO users (nickname, email, password, role) VALUES ($1, $2, $3, $4) ' +
        'RETURNING id, nickname, email, role',
      [nickname, email, hash, userRole]
    );

    const user = result.rows[0];
    if (userRole === 'player') {
      await query(
        'INSERT INTO players (user_id, nickname, game_role, elo, region, bio, looking) ' +
          'VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [
          user.id,
          nickname,
          req.body.game_role || 'Rifler',
          toInt(req.body.elo, 1000),
          req.body.region || 'СНГ',
          req.body.bio || '',
          'team'
        ]
      );
    }

    res.json({ user: user });
  } catch (error) {
    if (error.code === '23505') {
      return res.json({ error: 'Такой никнейм или почта уже заняты' });
    }
    res.json({ error: error.message });
  }
});
app.post('/api/login', async function (req, res) {
  try {
    const login = req.body.nickname || req.body.login || req.body.email;
    const password = req.body.password;

    if (!login || !password) {
      return res.json({ error: 'Введите логин и пароль' });
    }

    const result = await query(
      'SELECT id, nickname, email, password, role FROM users WHERE nickname = $1 OR email = $1',
      [login]
    );

    if (result.rows.length === 0) {
      return res.json({ error: 'Неверный логин или пароль' });
    }

    const user = result.rows[0];
    const hash = makeHash(password);

    if (hash !== user.password) {
      return res.json({ error: 'Неверный логин или пароль' });
    }

    const token = makeToken();
    await query('INSERT INTO sessions (token, user_id) VALUES ($1, $2)', [
      token,
      user.id
    ]);

    res.json({
      token: token,
      user: {
        id: user.id,
        nickname: user.nickname,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

app.get('/api/me', async function (req, res) {
  try {
    const user = await findUserByToken(req);
    if (!user) {
      return res.json({ error: 'Вы не вошли в систему' });
    }
    res.json({ user: user });
  } catch (error) {
    res.json({ error: error.message });
  }
});

app.post('/api/logout', async function (req, res) {
  try {
    const token = req.headers['x-session-token'];
    if (token) {
      await query('DELETE FROM sessions WHERE token = $1', [token]);
    }
    res.json({ ok: true });
  } catch (error) {
    res.json({ error: error.message });
  }
});
app.get('/api/players', async function (req, res) {
  try {
    const role = req.query.role;
    const region = req.query.region;
    const look = req.query.look;
    const search = req.query.search;

    const conditions = [];
    const values = [];

    if (role && role !== 'all') {
      values.push(role);
      conditions.push('game_role = $' + values.length);
    }
    if (region && region !== 'all') {
      values.push(region);
      conditions.push('region = $' + values.length);
    }
    if (look === 'team') {
      conditions.push("looking = 'team'");
    }
    if (search) {
      values.push('%' + search + '%');
      conditions.push('nickname ILIKE $' + values.length);
    }

    let sql = 'SELECT * FROM players';
    if (conditions.length > 0) {
      sql = sql + ' WHERE ' + conditions.join(' AND ');
    }

    const sort = req.query.sort;
    if (sort === 'elo_asc') {
      sql = sql + ' ORDER BY elo ASC';
    } else if (sort === 'nickname') {
      sql = sql + ' ORDER BY nickname ASC';
    } else {
      sql = sql + ' ORDER BY elo DESC';
    }

    const result = await query(sql, values);
    res.json({ players: result.rows });
  } catch (error) {
    res.json({ error: error.message });
  }
});
app.get('/api/players/:id', async function (req, res) {
  try {
    const result = await query('SELECT * FROM players WHERE id = $1', [
      req.params.id
    ]);
    if (result.rows.length === 0) {
      return res.json({ error: 'Игрок не найден' });
    }
    res.json({ player: result.rows[0] });
  } catch (error) {
    res.json({ error: error.message });
  }
});

app.post('/api/players', async function (req, res) {
  try {
    const user = await findUserByToken(req);
    if (!user) {
      return res.json({ error: 'Сначала войдите в систему' });
    }

    const check = await query('SELECT id FROM players WHERE user_id = $1', [
      user.id
    ]);
    if (check.rows.length > 0) {
      return res.json({ error: 'У вас уже есть анкета игрока' });
    }

    const result = await query(
      'INSERT INTO players (user_id, nickname, game_role, elo, region, bio, looking) ' +
        'VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [
        user.id,
        user.nickname,
        req.body.game_role || 'Rifler',
        toInt(req.body.elo, 1000),
        req.body.region || 'СНГ',
        req.body.bio || '',
        'team'
      ]
    );

    res.json({ player: result.rows[0] });
  } catch (error) {
    res.json({ error: error.message });
  }
});
app.put('/api/players/me', async function (req, res) {
  try {
    const user = await findUserByToken(req);
    if (!user) {
      return res.json({ error: 'Сначала войдите в систему' });
    }

    const result = await query(
      'UPDATE players SET game_role = $1, elo = $2, region = $3, bio = $4, looking = $5 ' +
        'WHERE user_id = $6 RETURNING *',
      [
        req.body.game_role || 'Rifler',
        toInt(req.body.elo, 1000),
        req.body.region || 'СНГ',
        req.body.bio || '',
        req.body.looking === 'none' ? 'none' : 'team',
        user.id
      ]
    );

    if (result.rows.length === 0) {
      return res.json({ error: 'Анкета не найдена' });
    }
    res.json({ player: result.rows[0] });
  } catch (error) {
    res.json({ error: error.message });
  }
});
app.get('/api/teams', async function (req, res) {
  try {
    const result = await query(
      'SELECT id, name, region, needed_role, min_elo, description FROM teams ORDER BY name ASC'
    );
    res.json({ teams: result.rows });
  } catch (error) {
    res.json({ error: error.message });
  }
});
app.post('/api/teams', async function (req, res) {
  try {
    const user = await findUserByToken(req);
    if (!user) {
      return res.json({ error: 'Сначала войдите в систему' });
    }

    const check = await query('SELECT id FROM teams WHERE user_id = $1', [user.id]);
    if (check.rows.length > 0) {
      return res.json({ error: 'У вас уже есть команда' });
    }
    if (!req.body.name) {
      return res.json({ error: 'Введите название команды' });
    }

    const result = await query(
      'INSERT INTO teams (user_id, name, region, needed_role, min_elo, description) ' +
        'VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [
        user.id,
        req.body.name,
        req.body.region || 'СНГ',
        req.body.needed_role || '',
        toInt(req.body.min_elo, 0),
        req.body.description || ''
      ]
    );

    res.json({ team: result.rows[0] });
  } catch (error) {
    res.json({ error: error.message });
  }
});

app.post('/api/invitations', async function (req, res) {
  try {
    const user = await findUserByToken(req);
    if (!user) {
      return res.json({ error: 'Сначала войдите в систему' });
    }

    const playerId = toInt(req.body.player_id, 0);
    if (playerId === 0) {
      return res.json({ error: 'Игрок не выбран' });
    }

    const teamResult = await query('SELECT id, name FROM teams WHERE user_id = $1', [
      user.id
    ]);
    if (teamResult.rows.length === 0) {
      return res.json({ error: 'Приглашать игроков может только команда' });
    }

    const team = teamResult.rows[0];

    const result = await query(
      'INSERT INTO invitations (team_id, player_id, message) ' +
        'SELECT $1, players.user_id, $2 FROM players WHERE players.id = $3 ' +
        'RETURNING id, team_id, player_id, message, status',
      [team.id, req.body.message || 'Приглашаем вас в наш состав', playerId]
    );

    if (result.rows.length === 0) {
      return res.json({ error: 'Игрок не найден' });
    }

    res.json({ invitation: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.json({ error: 'Вы уже приглашали этого игрока' });
    }
    res.json({ error: error.message });
  }
});
app.get('/api/invitations', async function (req, res) {
  try {
    const user = await findUserByToken(req);
    if (!user) {
      return res.json({ error: 'Сначала войдите в систему' });
    }

    const result = await query(
      'SELECT invitations.id, invitations.message, invitations.status, ' +
        'teams.name AS team_name, teams.region, teams.needed_role, teams.min_elo, ' +
        'players.nickname AS invited_nickname ' +
        'FROM invitations ' +
        'JOIN teams ON teams.id = invitations.team_id ' +
        'LEFT JOIN players ON players.user_id = invitations.player_id ' +
        'WHERE invitations.player_id = $1 ' +
        'ORDER BY invitations.id DESC',
      [user.id]
    );

    res.json({ invitations: result.rows });
  } catch (error) {
    res.json({ error: error.message });
  }
});
app.get('/api/invitations/sent', async function (req, res) {
  try {
    const user = await findUserByToken(req);
    if (!user) {
      return res.json({ error: 'Сначала войдите в систему' });
    }

    const result = await query(
      'SELECT invitations.id, invitations.message, invitations.status, ' +
        'players.nickname AS player_nickname, players.game_role, players.elo ' +
        'FROM invitations ' +
        'JOIN teams ON teams.id = invitations.team_id ' +
        'LEFT JOIN players ON players.user_id = invitations.player_id ' +
        'WHERE teams.user_id = $1 ' +
        'ORDER BY invitations.id DESC',
      [user.id]
    );

    res.json({ invitations: result.rows });
  } catch (error) {
    res.json({ error: error.message });
  }
});
app.put('/api/invitations/:id', async function (req, res) {
  try {
    const user = await findUserByToken(req);
    if (!user) {
      return res.json({ error: 'Сначала войдите в систему' });
    }

    const status = req.body.status;
    if (status !== 'accepted' && status !== 'rejected') {
      return res.json({ error: 'Неверный статус приглашения' });
    }
    const result = await query(
      'UPDATE invitations SET status = $1 WHERE id = $2 AND player_id = $3 ' +
        'RETURNING id, status',
      [status, req.params.id, user.id]
    );

    if (result.rows.length === 0) {
      return res.json({ error: 'Приглашение не найдено' });
    }
    res.json({ invitation: result.rows[0] });
  } catch (error) {
    res.json({ error: error.message });
  }
});
app.get('/api/stats', async function (req, res) {
  try {
    const players = await query('SELECT COUNT(*) AS count FROM players');
    const teams = await query('SELECT COUNT(*) AS count FROM teams');
    const looking = await query(
      "SELECT COUNT(*) AS count FROM players WHERE looking = 'team'"
    );
    res.json({
      players: players.rows[0].count,
      teams: teams.rows[0].count,
      looking: looking.rows[0].count
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});
app.use(function (req, res) {
  res.status(404).sendFile(path.join(thisFolder, 'public', '404.html'));
});

app.listen(3000, function () {
  console.log('Сервер запущен! Откройте: http://localhost:3000/');
});
