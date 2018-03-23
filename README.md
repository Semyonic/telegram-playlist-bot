# telegram-playlist-bot [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/d88e992469eb477bbf6521e8af5ad0d0)](https://www.codacy.com/app/semih.onay/telegram-playlist-bot?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=Semyonic/telegram-playlist-bot&amp;utm_campaign=Badge_Grade)

It was a toy project to share playlist changes to my friends following playlists.

> Detects changes on given users Spotify playlist then sends added tracks to the Telegram users via bot. (Spotify doesn't support such Events,WebHooks currently)

## Pre-Installation

1. Obtain ****Telegram Bot API Token**** from BotFather [@BotFather](https://telegram.me/BotFather)
2. Create a Spotify Application from [Developer Spotify](https://developer.spotify.com/my-applications)

## Installation

```sh
$ npm install
```

Then configure your ****.env**** file (Sample .env exists in this project)

## Configuration

You can change polling frequency in .env file

### ****<center>.env Configuration Parameters</center>****

| Name | Description |
| --- | --- |
| `TELEGRAM_BOT_TOKEN` | Your bot access token |
| `TELEGRAM_ADMIN_ID` | Your Telegram ID (Stored in mongoDB after initializing chat with the bot) |
| `SPOTIFY_ID` | Your Spotify Application ID|
| `SPOTIFY_SECRET` | Your Spotify Application Secret|
| `SPOTIFY_ID_ME` | Your Spotify Profile info (You can obtain via share profile button in Spotify App)|
| `SPOTIFY_PLAYLIST_ID` | Your Spotify Playlist ID (You can obtain via share playlist button in Spotify App)|
| `SPOTIFY_POLLING` | Polling frequency in MiliSeconds to check playlist changes (****Be aware of Rate Limits !****)|
| `MONGO_URI` | Your mongoDB connection URL (You can use free 500mb from ****[mLab](https://mlab.com/)****)|

## Usage

```js
npm start
```

## License

MIT © [Semih Onay](https://semyonic.github.io)
