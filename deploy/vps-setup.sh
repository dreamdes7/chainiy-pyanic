#!/bin/bash
# Запускать ОДИН РАЗ вручную на VPS при первичной настройке
set -e

APP_DIR=/opt/apps/chainiy-pyanic
DOMAIN=tea.example.com  # замени на свой домен

# 1. Установить PostgreSQL если нет
if ! command -v psql &> /dev/null; then
  apt-get update && apt-get install -y postgresql postgresql-contrib
fi

# 2. Создать БД и пользователя
sudo -u postgres psql <<SQL
DO \$\$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'chainiy_user') THEN
    CREATE USER chainiy_user WITH PASSWORD 'CHANGE_THIS_PASSWORD';
  END IF;
END \$\$;
CREATE DATABASE chainiy_pyanic OWNER chainiy_user;
GRANT ALL PRIVILEGES ON DATABASE chainiy_pyanic TO chainiy_user;
SQL

# 3. Создать директорию приложения
mkdir -p $APP_DIR

# 4. Настроить systemd-сервис
cp $APP_DIR/deploy/chainiy-pyanic.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable chainiy-pyanic

# 5. Настроить nginx
cp $APP_DIR/deploy/nginx.conf /etc/nginx/sites-available/chainiy-pyanic
ln -sf /etc/nginx/sites-available/chainiy-pyanic /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# 6. HTTPS через certbot
if ! command -v certbot &> /dev/null; then
  apt-get install -y certbot python3-certbot-nginx
fi
certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m admin@example.com

echo "VPS setup complete!"
echo "Теперь создай /opt/apps/chainiy-pyanic/.env на основе .env.example"
