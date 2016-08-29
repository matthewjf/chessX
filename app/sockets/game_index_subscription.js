import SocketManager from './socket_manager';
import GameIndexActions from '../actions/game_index_actions';

var GameIndexSubscription = {
  join() {
    SocketManager.join("index");

    socket.on('init', (data) => {
      console.log("all games: ", data);
      GameIndexActions.receiveGames(data.games);
    });

    socket.on('message', (data) => {
      console.log('message: ', data);
      GameIndexActions.receiveGame(data.game);
    });
  },

  leave() {
    SocketManager.leave();
    socket.off("init");
    socket.off("message");
  }
};

export default GameIndexSubscription;
