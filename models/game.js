import io from '../config/socketio';
import mongoose from 'mongoose';
import GameManager from '../state/manager';
import GameConfig from '../config/game';

var Schema = mongoose.Schema;

var GameSchema = new Schema({
  name:     {
    type: String,
    required: [true, 'Name is required'],
    minlength: [4, 'Name min length 4 characters'],
    maxlength: [50, 'Name max length 50 characters'],
    index: true
  },
  private:  { type: Boolean,                 default: false                 },
  password: { type: String                                                  },
  white:    { type: Schema.Types.ObjectId, ref: 'User' },
  black:    { type: Schema.Types.ObjectId, ref: 'User' },
  status:   { type: String,  required: true, default: 'waiting', enum: ['waiting', 'starting', 'active', 'archived'] },
  winner:   { type: String, enum: ['white', 'black', 'draw']}
}, {timestamps: true});

// SERIALIZE WITHOUT PASSWORD
GameSchema.set('toJSON', {
  transform: function(doc, ret, options) {
    delete ret.password;
    ret.white = ret.white || null;
    ret.black = ret.black || null;
    return ret;
  }
});

// INSTANCE METHODS
GameSchema.methods.isEmpty = function() {
  return !(this.white || this.black);
};

GameSchema.methods.isFull = function() {
  return (this.white && this.black);
};

GameSchema.methods.isInGame = function(user) {
  return user.equals(this.white) || user.equals(this.black);
};

GameSchema.methods.isActive = function() {
  return this.status === 'active';
};

GameSchema.methods.isArchived = function() {
  return this.status === 'archived';
};

GameSchema.methods.join = function(user, color, callback) {
  if (this.isInGame(user) || this.isFull()) return callback(null, this);

  if (!this.white) this.white = user._id;
  else this.black = user._id;

  this.save(callback);
};

GameSchema.methods.leave = function(user, callback) {
  if (this.status === 'active') {
    callback({errors: "can't leave game"}, this);
  } else if (this.status === 'archived') {
    this.save(callback);
  } else {
    if (user.equals(this.white))
      this.white = undefined;
    if (user.equals(this.black))
      this.black = undefined;
    this.save(callback);
  }
};

GameSchema.methods.isRemovable = function() {
  return (this.isEmpty() && (this.status === 'waiting' || this.status === 'starting'));
};

GameSchema.methods.isStartable = function() {
  return (this.isFull() && (this.status === 'waiting'));
};

GameSchema.methods.isActivatable = function() {
  return (this.isFull() && (this.status === 'starting'));
};

GameSchema.methods.shouldWait = function() {
  return (!this.isFull() && (this.status === 'starting'));
};

GameSchema.methods.activate = function() {
  if (this.isActivatable()) {
    this.status = 'active';
    GameManager.init(this); // TODO: handle exception
    return this.save();
  } else {
    return false;
  }
};

GameSchema.methods.players = function() {
  return [this.white, this.black];
};

var timeouts = {};

// TRANSACTION CALLBACKS
var clearTimeouts = function(id) {
  clearTimeout(timeouts[id]);
};

var delayedRemove = function(id) {
  clearTimeouts(id);
  timeouts[id] = setTimeout(() => {
    Game.findById(id, (_, game) => {
      if (game && game.isRemovable()) {
        game.remove().then((game) => {
        });
      }
    });
  }, GameConfig.removeDelay);
};

var delayedActivate = (id) => {
  clearTimeouts(id);
  timeouts[id] = setTimeout(() => {
    Game.findById(id)
        .populate('white')
        .populate('black')
        .exec((_, game) => {
      if (game && game.isActivatable()) {
        game.activate();
      }
    });
  }, GameConfig.startDelay);
};

GameSchema.pre('save', function(next) {
  if (this.isStartable()) {
    this.status = 'starting';
    delayedActivate(this._id);
  }
  if (this.isRemovable()) {
    delayedRemove(this._id);
  }
  if (this.shouldWait()) {
    this.status = 'waiting';
  }
  next();
});

GameSchema.post('save', (game, next) => {
  game.populate('white black', function(err, g) {
    io.to('index').emit('game', g);
    io.to(g._id).emit('game', g);
    next();
  });
});

GameSchema.post('remove', (game, next) => {
  io.to('index').emit('remove', game);
});

var Game = mongoose.model('Game', GameSchema);

export default Game;
