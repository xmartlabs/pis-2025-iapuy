# PIS⚙️

## Tech Stack

| NodeJs | NextJS | TypeScript | PostgreSQL | Sequelize | Docker |
| ------ | ------ | ---------- | ---------- | --------- | --------- |
| <img height="60" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/node_js.png"> | <img height="60" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/next_js.png"> | <img height="60" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/typescript.png"> | <img height="60" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/postgresql.png"> | <img height="60" src="https://sequelize.org/img/logo.svg"> | <img height="60" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/docker.png"> |

## Ambientes

### Produccion

La idea es que en producción se levante la infra completa

```shell
npx next build && docker-compose up --build
```
### Desarrollo local

Para desarrollo local se levanta la db con Docker, pero la Next se corre localmente para poder usar las facilidades del framework como cambios en tiempo real.

```shell
docker-compose up postgres -d
```
```shell
cd my-app && npm run dev
```
