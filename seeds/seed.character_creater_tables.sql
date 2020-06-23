BEGIN;

TRUNCATE
  characters,
  character_creater_users
  RESTART IDENTITY CASCADE;

INSERT INTO character_creater_users (user_name, password, deleted, email)
VALUES
  ('pookie', 'password', FALSE, 'pookiemaster@gmail.com'),
  ('darkmath', 'password', FALSE, 'dark.math@darkness.org'),
  ('nova', 'password', FALSE, 'nova@spacecases.com');


INSERT INTO characters (first_name, last_name, major_trait, modified, status, user_id)
VALUES
  ('p', 'k', 'adventerous', NULL, 'completed', 1),
  ('Johnny', 'Poppins', 'hot-tempered', NULL, 'completed', 1),
  ('Kat', 'Kline', 'reticent', NULL, 'completed', 2);

COMMIT;