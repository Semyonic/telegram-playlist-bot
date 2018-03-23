import _ from 'lodash';
import bodyParser from 'body-parser';
import express from 'express';
import logger from 'morgan';
import TeleBot from 'telebot';
import mongoose from 'mongoose';
import request from 'request';

import User from './models/User';
import Chat from './models/Chat';
import PlayListSnap from './models/PlayListSnap';

import index from './routes/index';

const app = express();
const bot = new TeleBot(process.env.TELEGRAM_BOT_TOKEN);

/**
 * Set Authorization info for Spotify
 */
const authOptions = {
  url: 'https://accounts.spotify.com/api/token',
  headers: {
    Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_ID}:${process.env.SPOTIFY_SECRET}`).toString('base64')}`,
  },
  form: {
    grant_type: 'client_credentials',
  },
  json: true,
};

mongoose.Promise = global.Promise;
mongoose.connection.openUri(process.env.MONGO_URI).then(() => {
  console.log('mongoDB Connected');
  bot.start();
}).catch((error) => {
  console.log(error);
});

/**
 * Bot welcome message
 */
bot.on(['/start'], (msg) => msg.reply.text('Hoş geldin !'));

/**
 * Send random tracks from playlist
 */
bot.on('/rastgele', (msg) => {
  msg.reply.text('Rastgele şarkı gelecek');
});

/**
 * Creator of the bot
 */
bot.on('/yaratici', (msg) => {
  msg.reply.text('@Semyonic');
});

/**
 * Help command
 */
bot.on('/yardim', (msg) => {
  bot.getChatMembersCount(msg.chat.id).then((resp) => {
    msg.reply.text(`Bot ile konuşan kişi sayısı : ${resp} \n \nKullanılabilecek bot komutları \n \n/enson : Listeye eklenen en son parçayı getirir \n/rastgele : Listeden rastgele parça gönderir \n/yardim : Bu sayfayı gösterir \n/yaratici : Botun yazarı ile iletişime geçmek için`);
  });
});

/**
 * Reply every user input
 */
bot.on('text', (msg) => {
  if (!msg.hasOwnProperty('entities')) {
    User.findOne({$where: 'userId ==' + msg.from.id}, (error) => {
      if (error) return error;
      User.create({
        userName: msg.from.first_name,
        userId: msg.from.id,
      }, (err) => {
        if (err) return err;
      });
    });
    Chat.create({
      chatId: msg.chat.id,
      userName: msg.from.first_name,
      message: msg.text,
    }, (err, post) => {
      if (err) return err;
    });
    if (msg.text.includes('kimsin')) {
      msg.reply.text('@Semyonic tarafından yaratılmış bir botum.');
    } else {
      msg.reply.text(msg.text);
    }
  }
});

/**
 * Polling playlist snapshot_id'to detect changes on playlist and
 * send them to the users at Telegram via Bot
 */
setInterval(() => {
  request.post(authOptions, (error, response, body) => {
    if (!error && response.statusCode === 200) {

      const token = body.access_token;
      const options = {
        url: `https://api.spotify.com/v1/users/${process.env.SPOTIFY_ID_ME}/playlists/${process.env.SPOTIFY_PLAYLIST_ID}?fields=(snapshot_id)`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        json: true,
      };

      request.get(options, (err, resp) => {
        if (err) return err;

        PlayListSnap.findOne({snapshot_id: resp.body.snapshot_id}, (error, result) => {
          if (error) return error;
          if (result === null) {
            PlayListSnap.create({
              snapshot_id: resp.body.snapshot_id,
            }, (err) => {
              if (err) return err;
            });
            getTracks();
          }
        });
      });
    } else if (response.statusCode === 429) {
      bot.sendMessage(process.env.TELEGRAM_ADMIN_ID, 'Spotify Rate Limit Triggered ! Shuting down');
      process.exit(1);
    }
  });
}, process.env.SPOTIFY_POLLING);

/**
 * Gets,sorts and sends tracks to Telegram users
 */
const getTracks = () => {
  request.post(authOptions, (error, response, body) => {
    if (!error && response.statusCode === 200) {

      const token = body.access_token;
      const options = {
        url: `https://api.spotify.com/v1/users/11172021434/playlists/2jzzDTeKB60YgehWhayJVq/tracks?fields=items(added_at,track(external_urls(spotify)),limit,next,offset,total)`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        json: true,
      };

      request.get(options, (err, resp) => {
        if (err) return err;
        let sorted = _.sortBy(resp.body.items, ['added_at']);
        let ordered = _.orderBy(sorted, ['added_at'], ['asc']);
        let track = JSON.stringify(ordered[ordered.length - 1].track.external_urls.spotify);
        User.find({}, {userId: 1, _id: 0}, (err, users) => {
          users.forEach((user) => {
            bot.sendMessage(user.userId, 'Listeye yeni parça eklendi ! \n \n' + track);
          });
        });
      });
    }
  });
};

app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false,
}));

app.use('/', index);

/**
 * Triggered from Spotify for login operations
 */
app.get('/callback', (req, res) => {
  /**
   * TODO
   * Login to the chat-app
   */
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
/* eslint no-unused-vars: 0 */
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.json(err);
});

// Handle uncaughtException
process.on('uncaughtException', (err) => {
  // Send errors to Telegram Admin then crash
  bot.sendMessage(process.env.TELEGRAM_ADMIN_ID, JSON.stringify(err));
  process.exit(1);
});

export default app;
