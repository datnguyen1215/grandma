# Deploy Guide

## Server Info

- Host: Hetzner VPS
- OS: Linux
- Reverse proxy: Caddy (system-level, imports `/etc/caddy/sites/*.caddy`)
- Apps live in: `/sites/<app-name>/`
- Domain: `grandma.dnguyen.us` (Cloudflare proxied, SSL handled by Cloudflare)

## Architecture

```
Cloudflare (HTTPS) -> Server :80 (Caddy) -> localhost:3002 (Docker container)
```

## Deploy Steps

1. Build the project locally:

```bash
tar --exclude='node_modules' --exclude='.svelte-kit' --exclude='build' --exclude='data.db' -czf /tmp/grandma.tar.gz .
```

2. Upload to server:

```bash
scp /tmp/grandma.tar.gz root@<SERVER_IP>:/tmp/grandma.tar.gz
```

3. SSH into server and build:

```bash
ssh root@<SERVER_IP>
cd /sites/grandma/src
rm -rf *
tar xzf /tmp/grandma.tar.gz
rm /tmp/grandma.tar.gz
docker build -t grandma:latest .
```

4. Restart the container:

```bash
cd /sites/grandma
docker compose up -d
```

## Server Files (already set up)

### `/sites/grandma/docker-compose.yml`

```yaml
services:
  app:
    image: grandma:latest
    restart: unless-stopped
    environment:
      NODE_ENV: production
      HOST: 0.0.0.0
      PORT: 3000
      DATA_DIR: /app/data
    volumes:
      - app_data:/app/data
    ports:
      - "3002:3000"

volumes:
  app_data:
```

### `/etc/caddy/sites/crazyaboutfish.caddy` (shared Caddyfile)

The grandma route:

```
@grandma host grandma.dnguyen.us
handle @grandma {
    reverse_proxy localhost:3002
}
```

After modifying Caddy config: `systemctl reload caddy`

## DNS

- A record: `grandma.dnguyen.us` -> `<SERVER_IP>` (Cloudflare proxied)
- Managed in Cloudflare zone for `dnguyen.us`

## Notes

- SQLite database persists in Docker volume `grandma_app_data`
- No authentication on either route
- `/` = camera view (grandma)
- `/view` = photo viewer (you)
- Realtime updates via Server-Sent Events
