import Game from '../models/game';
import History from '../models/history';
import User from '../models/user';
import GameManager from '../state/manager';
import io from '../config/socketio';

const gameData = (data, user) => {
  if (data.black)
    data.game.black = user._id;
  else
    data.game.white = user._id;

  return data.game;
};

export default (client, joined) => {
  var userId = (client.handshake.session.passport || {}).user;

  const validateUser = (id, successCB) => {
    User.findById(id, (_, user) => {
      if (user)
        successCB(user);
      else
        client.emit('errors', {login: "login required"});
    });
  };

  client.on("create-game", data => {
    validateUser(userId, user => {
      Game.create(gameData(data, user),
        (err, game) => {
          if (err)
            client.emit('errors', err.errors);
          else
            client.emit('created-game', game);
        }
      );
    });
  });

  // TODO: make prettier
  client.on("join-game", data => {
    validateUser(userId, user => {
      Game.findById(data.id)
        .populate('white')
        .populate('black')
        .exec((err, game) => {
          if (err) {
            client.emit('errors', err.errors);
          } else if (game) {
            client.emit('joined-game', game);
            if (game.status === 'archived') {
              History.findOne({game: game}, (err, history) => {
                if (err) {
                  client.emit('errors', err.errors);
                } else {
                  joined({room: game._id});
                  client.join(game._id);
                  client.emit('game-history', history);
                  let msg = {user: user, type: 'join', time: new Date()};
                  io.to(game._id).emit('game-chat', msg);
                }
              });
            } else {
              game.join(user, null, (err, game) => {
                if (err) {
                  client.emit('errors', err.errors);
                } else {
                  joined({room: game._id});
                  client.join(game._id);
                  client.emit('game-state', GameManager.getState(game._id));
                  let msg = {user: user, type: 'join', time: new Date()};
                  io.to(game._id).emit('game-chat', msg);
                  client.emit('game', game);
                }
              });
            }
          } else {
            client.emit('errors', 'Game not found');
          }
        });
    });
  });

  client.on("game-state", gameId => {
    client.emit('game-state', GameManager.getState(gameId));
  });

  client.on("game-move", data => {
    GameManager.movePiece(data.gameId, userId, data.pieceId, data.pos);
  });

  client.on("game-chat", data => {
    if (data && data.gameId && data.message)
      validateUser(userId, user => {
        let chat = {type: 'message', user: user, message: data.message, time: new Date()};
        io.to(data.gameId).emit('game-chat', chat);
      });
  });
};
