import React from 'react';
import { browserHistory } from 'react-router';
import ErrorUtil from '../../utils/error_util';
import GameSubscription from '../../sockets/game_subscription';
import GameActions from '../../actions/game_actions';
import GameStore from '../../stores/game_store';
import Board from './board';
import Pieces from './pieces';
import Overlay from './overlay';
import Player from './player';
import Replay from './replay';
import Chat from './chat';

class Game extends React.Component {
  constructor(props) {
    super(props);

    this.getGame = this.getGame.bind(this);
    this.rejected = this.rejected.bind(this);
    this.status = this.status.bind(this);
    this.winner = this.winner.bind(this);
    this.whiteOnBottom = this.whiteOnBottom.bind(this);
    this.playerStatus = this.playerStatus.bind(this);
    this.topCard = this.topCard.bind(this);
    this.botCard = this.botCard.bind(this);
    this.card = this.card.bind(this);
    this.renderReplay = this.renderReplay.bind(this);

    this.state = {
      gameId: this.props.params.id,
      game: GameStore.get(),
      error: null,
      currentUser: this.props.currentUser
    };
  }

  componentWillReceiveProps(props) {
    this.setState({ currentUser: props.currentUser });
  }

  componentDidMount() {
    GameStore.addChangeListener(this.getGame);
    GameSubscription.join(this.state.gameId, this.rejected);
  }

  getGame() {
    this.setState({ game: GameStore.get() });
  }

  componentWillUnmount() {
    GameStore.removeChangeListener(this.getGame);
    GameActions.removeGame();
    GameSubscription.leave();
  }

  rejected(data) {
    browserHistory.push('/');
    if (this.state.currentUser)
      ErrorUtil.gameRejected(data);
    else
      ErrorUtil.loginRequired(data);
  }

  playerStatus() {
    var game = this.state.game, user = this.state.currentUser;
    if (game && user) {
      if (game.white && game.white._id === this.state.currentUser._id)
        return 'white';
      else if (game.black && game.black._id === this.state.currentUser._id)
        return 'black';
    }

    return 'spectator';
  }

  whiteOnBottom() {
    return this.playerStatus() !== 'black';
  }

  topCard() {
    if (!this.state.game) return {};
    return this.whiteOnBottom() ? this.card('black') : this.card('white');
  }

  botCard() {
    if (!this.state.game) return {};
    return this.whiteOnBottom() ? this.card('white') : this.card('black');
  }

  card(color) {
    return {
      color: color,
      player: this.state.game[color],
      spectator: this.playerStatus() === 'spectator',
      gameId: this.state.gameId
    };
  }

  status() {
    if (this.state.game) return this.state.game.status;
  }

  winner() {
    if (this.state.game) return this.state.game.winner;
  }

  renderReplay() {
    if (this.status() === 'archived') return <Replay />;
  }

  render() {
    var game = this.state.game;

    return (
      <div id='game-wrapper'>
        <section id='game' className='no-select'>
          {this.renderReplay()}
          <Player data={this.topCard()} />
          <div id='board-wrapper'>
            <Overlay status={this.status()} winner={this.winner()} />
            <Pieces status={this.status()} playerStatus={this.playerStatus()} />
            <Board />
          </div>
          <Player data={this.botCard()} />
        </section>
        <Chat white={game.white} black={game.black} gameId={this.state.gameId} />
      </div>
    );
  }
};

export default Game;
