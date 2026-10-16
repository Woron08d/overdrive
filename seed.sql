BEGIN;

CREATE TEMP TABLE seed_users (user_id INTEGER);

WITH new_users AS (
  INSERT INTO users (nickname, email, password, role) VALUES
    ('alexey_awp',   'alex@mail.ru',      'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'player'),
    ('ivan_rifler',  'ivan@mail.ru',      'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'player'),
    ('shadow_sniper','shadow@mail.ru',    'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'player'),
    ('kostya_entry', 'kostya@mail.ru',    'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'player'),
    ('marina_sup',   'marina@mail.ru',    'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'player'),
    ('denis_igl',    'denis@mail.ru',     'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'player'),
    ('oleg_lurk',    'oleg@mail.ru',      'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'player'),
    ('pavel_frag',   'pavel@mail.ru',     'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'player'),
    ('nikita_awp',   'nikita@mail.ru',    'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'player'),
    ('artem_sup',    'artem@mail.ru',     'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'player'),
    ('sergey_rifle', 'sergey@mail.ru',    'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'player'),
    ('vlad_entry',   'vlad@mail.ru',      'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'player'),
    ('roman_awp',    'roman@mail.ru',     'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'player'),
    ('egor_lurk',    'egor@mail.ru',      'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'player'),
    ('maxim_igl',    'maxim@mail.ru',     'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'player'),
    ('andrey_sup',   'andrey@mail.ru',    'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'player'),
    ('dmitry_frag',  'dmitry@mail.ru',    'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'player'),
    ('kirill_awp',   'kirill@mail.ru',    'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'player'),
    ('anton_entry',  'anton@mail.ru',     'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'player'),
    ('yana_sup',     'yana@mail.ru',      'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'player'),
    ('gleb_rifle',   'gleb@mail.ru',      'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'player'),
    ('timur_lurk',   'timur@mail.ru',     'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'player'),
    ('ruslan_igl',   'ruslan@mail.ru',    'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'player'),
    ('ilya_awp',     'ilya@mail.ru',      'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'player'),
    ('nastya_rifle', 'nastya@mail.ru',    'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'player'),
    ('boris_entry',  'boris@mail.ru',     'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'player')
  ON CONFLICT (nickname) DO NOTHING
  RETURNING id
)
INSERT INTO seed_users (user_id) SELECT id FROM new_users;
INSERT INTO players (user_id, nickname, game_role, elo, region, bio, looking)
SELECT users.id, users.nickname, data.game_role, data.elo, data.region, data.bio, data.looking
FROM users
JOIN (VALUES
    ('alexey_awp',   'AWP',     2200, '������',      '����� 3 ����, ��� ���������� ������',            'team'),
    ('ivan_rifler',  'Rifler',  1850, '���',         '���� ���� � �������������������� ��������',      'team'),
    ('shadow_sniper','AWP',     2450, '������',      '���������� ������ ����, ������ �����',           'team'),
    ('kostya_entry', 'Entry',   1720, '���',         '����������� ����, ����� ������ �����',           'team'),
    ('marina_sup',   'Support', 1980, '������',      '������ ������� � �������� � �������',            'team'),
    ('denis_igl',    'IGL',     2380, '���',         '����� ��������� � ���� ������������ ��������',   'team'),
    ('oleg_lurk',    'Lurker',  1610, '���',         '����� ����������, ����� ����',                   'team'),
    ('pavel_frag',   'Rifler',  2050, '������',      '��������� ����� 1.1 ������� �� FACEIT',          'team'),
    ('nikita_awp',   'AWP',     1930, '���',         '����� �������� ������� � ����������� AWP',       'team'),
    ('artem_sup',    'Support', 1480, '���',         '����� ������ �� ����� �����',                    'team'),
    ('sergey_rifle', 'Rifler',  1790, '������',      '��������� �����, ����� �� �������',              'team'),
    ('vlad_entry',   'Entry',   2140, '������',      '������� ���� �� �����, ������ ������� � ������',  'team'),
    ('roman_awp',    'AWP',     1670, '���',         '���������� AWP, ������ �����',                   'team'),
    ('egor_lurk',    'Lurker',  2260, '������',      '���������� � �������� - ��� ������� �������',    'team'),
    ('maxim_igl',    'IGL',     2510, '������',      '���� ���� ����������� �� LAN',                   'team'),
    ('andrey_sup',   'Support', 1560, '���',         '����� ������� ����� �����',                      'none'),
    ('dmitry_frag',  'Rifler',  1880, '���',         '��� ������� ��� ������� � ��������',             'team'),
    ('kirill_awp',   'AWP',     2330, '������',      '������������� - ������ ����� A',                 'team'),
    ('anton_entry',  'Entry',   1440, '���',         '������ ����� ������ � ���������������� ������',  'none'),
    ('yana_sup',     'Support', 2010, '������',      '���������� ����, ������� ������',                'team'),
    ('gleb_rifle',   'Rifler',  1750, '���',         '����� � ����������� 3 ���� � ������',            'team'),
    ('timur_lurk',   'Lurker',  2120, '���',         '����� ������ ����� ����������',                  'team'),
    ('ruslan_igl',   'IGL',     1950, '���',         '���� ���� ������ ����� � �������',               'team'),
    ('ilya_awp',     'AWP',     1690, '������',      '��� ������ �������� ������',                     'team'),
    ('nastya_rifle', 'Rifler',  2210, '������',      '����� �� ������� ������� �����',                 'team'),
    ('boris_entry',  'Entry',   1830, '���',         '���� ����� ������ � ��������',                   'team')
) AS data(nickname, game_role, elo, region, bio, looking)
  ON users.nickname = data.nickname
WHERE users.role = 'player'
  AND NOT EXISTS (SELECT 1 FROM players WHERE players.user_id = users.id);

WITH new_teams AS (
  INSERT INTO users (nickname, email, password, role) VALUES
    ('team_phoenix',  'phoenix@team.ru',  'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'team'),
    ('team_vega',     'vega@team.ru',     'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'team'),
    ('team_nordwind', 'nordwind@team.ru', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'team'),
    ('team_steel',    'steel@team.ru',    'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'team'),
    ('team_orion',    'orion@team.ru',    'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'team'),
    ('team_aurora',   'aurora@team.ru',   'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'team'),
    ('team_krypton',  'krypton@team.ru',  'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'team'),
    ('team_tundra',   'tundra@team.ru',   'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'team')
  ON CONFLICT (nickname) DO NOTHING
  RETURNING id
)
INSERT INTO seed_users (user_id) SELECT id FROM new_teams;

INSERT INTO teams (user_id, name, region, needed_role, min_elo, description)
SELECT users.id, data.name, data.region, data.needed_role, data.min_elo, data.description
FROM users
JOIN (VALUES
    ('team_phoenix',  'Phoenix',  '������', 'AWP',     2000, '������� ������, ������ ������ �����. ���� ��������.'),
    ('team_vega',     'Vega',     '���',    'Support', 1500, '������� ������� ��� ������� � ������������ ��������.'),
    ('team_nordwind', 'Nordwind', '������', 'Rifler',  1800, '���������� ��� ���� � ������, ������ ����� ����������.'),
    ('team_steel',    'Steel',    '���',    'Entry',   1700, '����������� ����� ����, ����� ������� �����.'),
    ('team_orion',    'Orion',    '������', 'IGL',     2100, '���� �������� � ������ �����������.'),
    ('team_aurora',   'Aurora',   '���',    'Lurker',  1600, '��������� ���������, ������ �� ���������.'),
    ('team_krypton',  'Krypton',  '������', 'AWP',     2300, '������ �������� ������, ����� �� ��������.'),
    ('team_tundra',   'Tundra',   '���',    'Rifler',  1400, '����� �������, �������� ������ � ����.')
) AS data(nickname, name, region, needed_role, min_elo, description)
  ON users.nickname = data.nickname
WHERE users.role = 'team'
  AND NOT EXISTS (SELECT 1 FROM teams WHERE teams.user_id = users.id);

INSERT INTO invitations (team_id, player_id, message, status)
SELECT teams.id, players.user_id, data.message, data.status
FROM (VALUES
    ('Phoenix',  'ivan_rifler',  '������! ����� ������� ������, �������� ��� ������.', 'pending'),
    ('Krypton',  'shadow_sniper','���� AWP �������� ������, ���������� �� �������� ����.', 'pending'),
    ('Vega',     'artem_sup',    '����� �������, ������ �� �������.', 'pending'),
    ('Orion',    'denis_igl',    '���� ��������, � ��� ���� ���� ������.', 'pending'),
    ('Steel',    'vlad_entry',   '���� ����� ����� ��� ��������, �������������.', 'pending')
) AS data(team_name, nickname, message, status)
JOIN teams ON teams.name = data.team_name
JOIN players ON players.nickname = data.nickname
ON CONFLICT (team_id, player_id) DO NOTHING;

COMMIT;
SELECT 'users' AS table_name, COUNT(*) FROM users
UNION ALL SELECT 'players', COUNT(*) FROM players
UNION ALL SELECT 'teams', COUNT(*) FROM teams
UNION ALL SELECT 'invitations', COUNT(*) FROM invitations;
