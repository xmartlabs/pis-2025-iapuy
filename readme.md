# PIS⚙️

## Tech Stack

| NodeJs | NextJS | TypeScript | PostgreSQL | Sequelize | Docker |
| ------ | ------ | ---------- | ---------- | --------- | --------- |
| <img height="60" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/node_js.png"> | <img height="60" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/next_js.png"> | <img height="60" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/typescript.png"> | <img height="60" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/postgresql.png"> | <img height="60" src="https://sequelize.org/img/logo.svg"> | <img height="60" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/docker.png"> |

## Enviroments

### Production

On production we will be setting up the whole infrastructure with Docker containers, using the command:

```shell
npx next build && docker-compose up --build
```
### Local development

For local development we will setup the DB on Docker but run locally the Next application in order to take advantage of tools like hot reload to see changes on the code be reflected on real-time.
Before pushing to the repo all changes should be testes dockerizing the whole application.
```shell
docker-compose up postgres -d
```
```shell
cd my-app && npm run dev
```

### Example .env file

```shell
DB_HOST=localhost
DB_PORT=5432
DB_USER=[username]
DB_PASS=[password]
DB_NAME=[name for db]

JWT_SECRET=ba1b46dcbd266376.......

ENVIROMENT=dev
```
