# PM2-Agent-Keeper

This repository is a tiny web projects that collects and display data from instances of [pm2-agent](https://github.com/fatmatto/pm2-agent)

## Usage

After installing dependencies with

```
npm install
```

you can start the webapp with

```
npm start
```

Now you should be able to open your browser at `http://localhost:3000` and see an almost blank screen.

Navigate to  `http://localhost:3000/#/hosts` and in the form add your the host in which
you started an instance of [pm2-agent](https://github.com/fatmatto/pm2-agent).

In my case I have an instance of the agent in the same host, so i will enter ```Localhost``` as name
and `http://localhost:4000` as url (My agent listens on port 4000)
