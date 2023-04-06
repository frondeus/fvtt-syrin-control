# Necessary packages

0. Install necessary dependencies:

- docker with `docker compose` plugin
- nodejs with npm

# Building the module

1. Install dependencies
   You need to do it only once unless you change something in `package.json`

```
  npm install
```

2. Build the module at least once

```
  npm run build
```

This populates `./dist` folder with built SyrinControl

# Preparing dev environment

1. Download foundry - Latest release for Linux/NodeJS.
2. Go to `docs/foundry`

```
  cd docs/foundry
```

3. Copy `FoundryVTT-10.xxx.zip` to `docs/foundry`

```
  cp ~/Downloads/FoundryVTT-10.xxx.zip .
```

4. Create a new folder called `foundryvtt-v10` inside of `docs/foundry`

```
  mkdir foundryvtt-v10
```

5. unpack zip **to this new folder**:

```
  unzip ./FoundryVTT-10.xxx.zip -d foundryvtt-v10
```

6. Remove zip file

```
  rm ./FoundryVTT-10.xxx.zip
```

8. Build the docker image.

```
  docker compose build
```

9. Now you can run foundry in docker!

```
  docker compose up -d
```

10. Setup license and create a world `e2e`
    Go to http://localhost:3000/
    Admin password: `1` (just number one)
    Install any preferable system
    Install socketlib module
    Run the world
    Enable socketlib and syrincontrol
    Add your personal auth key in syrincontrol settings

# Developing the module

Requirements: running docker with foundry.

1. Run the module dev
   Run dev server in root of the project

```
npm run dev
```

2. From now on you want to access the foundry by this address:
   https://localhost:9443/join

3. The server will automatically refresh page as well as recompile SyrinControl when you save changes.
   The server requires foundry running on http://localhost:3000 so make sure you ran

```
  docker compose up -d
```

in `docs/foundry` folder.
If not sure check `docker ps` if the foundry is running.

4. To stop the server just press CTRL+C in terminal where you ran `npm run dev`.
5. to stop foundry go to `docs/foundry` and run `docker compose down`

# Running E2E

Requirements: running docker with foundry & running dev server

1. Run cypress open
   Run cypress e2e tests in root of the project

```
  npm run cypress open --e2e -b chrome
```

4. Run all specs at least once
5. When developing feature focus only on spec describing the feature.

# Scripts

To make it even simpler I prepared couple of scripts:

- `./scripts/dev.sh` - it will run docker compose with foundry and then call `npm run dev`.
- `./scripts/e2e.sh` - it will run E2E tests in Firefox
