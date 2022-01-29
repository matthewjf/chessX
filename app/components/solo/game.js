import React from 'react';
import GameActions from '../../actions/game_actions';
import GameStore from '../../stores/game_store';
import Board from '../game/board';
import SoloPieces from './pieces';
import Overlay from '../game/overlay';
import Player from '../game/player';

import SoloManager from '../../utils/solo/manager';
import Game from '../game/game';

class Solo extends Game {
  constructor(props) {
    super(props);
    let color = this.props.location.query.c;
    this.color = (color && color === 'b' ? 'black' : 'white');
  }

  componentDidMount() {
    GameStore.addChangeListener(this.getGame);
    SoloManager.join(this.color);
  }

  componentWillUnmount() {
    GameStore.removeChangeListener(this.getGame);
    GameActions.removeGame();
    SoloManager.leave();
  }

  playerStatus() {
    return this.color;
  }

  playAgain() {
    SoloManager.join(this.color);
  }

  render() {
    var game = this.state.game;

    return (
      <div id='game-wrapper'>
        <section id='game' className='no-select'>
          <Player data={this.topCard()} />
          <div id='board-wrapper'>
            <Overlay status={this.status()} winner={this.winner()} />
            <SoloPieces status={this.status()} playerStatus={this.playerStatus()} />
            <Board />
          </div>
          <Player data={this.botCard()} />
        </section>
      </div>
    );
  }
};

export default Solo;
