# PIS⚙️

## Tech Stack

| NodeJs | NextJS | TypeScript | PostgreSQL | Sequelize | Docker |
| ------ | ------ | ---------- | ---------- | --------- | --------- |
| <img height="60" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/node_js.png"> | <img height="60" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/next_js.png"> | <img height="60" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/typescript.png"> | <img height="60" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/postgresql.png"> | <img height="60" src="https://sequelize.org/img/logo.svg"> | <img height="60" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/docker.png"> |


# Getting Started

## Enviroments

### Production

On production we will be setting up the whole infrastructure with Docker containers, using the command:
### [Important]: Before doing any of the steps below generate the .env file within th root of the proyect, also in the .env file the DB_HOST should be the local ip address in the network of the machine instead of localhost since during the build procces of the next js app it hits the db that will be running on the host machine, once the next js is built it will continue to use the docker network link instead.
```shell
docker compose up postgres -d && npx sequelize-cli db:migrate && docker compose up --build -d
```
### Local development

For local development we will setup the DB on Docker but run locally the Next application in order to take advantage of tools like hot reload to see changes on the code be reflected on real-time.
Before pushing to the repo all changes should be testes dockerizing the whole application.

### [Important]: Before doing any of the steps below generate the .env file within th root of the proyect
```shell
docker compose up postgres -d
```
```shell
npm run dev
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

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Managment

### Migrations

For running pending migrations: 
```shell
npx sequelize-cli db:migrate
```
To undo most recent migrations: 
```shell
npx sequelize-cli db:migrate:undo
```
To generate a new migration file:
```shell
npx sequelize-cli migration:generate --name name-of-migration
```

### Seeds

To generate hard-coded data into the DB:

```shell
npx sequelize-cli seed:generate --name seed-name
```
```shell
npx sequelize-cli db:seed:all
```
or
```shell
npx sequelize-cli db:seed --seed name-of-seed-file
```

To undo a seed:
```shell
npx sequelize-cli db:seed:undo
```
