import React from 'react';

class Board extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  renderSquares() {
    let squares = [];
    for (var row = 0; row < 8; row++) {
      for (var col = 0; col < 8; col++) {
        let color = ((row + col) % 2 === 0 ? 'white-square' : 'black-square');
        squares.push(<div className={'square ' + color} key={row * 10 + col} />);
      }
    };
    return squares;
  }

  render() {
    return <div id='board' className={'card-panel'}>
      {this.renderSquares()}
    </div>;
  }
}

export default Board;
