import GameConfig from '../../../config/game';
import Board from '../../../helpers/board';
import Piece from '../../../helpers/piece';
import PieceStore from '../../stores/piece_store';
import SoloManager from './manager';
import value from './values';

class Computer {
  constructor(color) {
    this.speed = 2000;
    this.color = color;
    this.state = {};
  }
  // PUBLIC

  start() {
    this.state = PieceStore.get();
    PieceStore.addChangeListener(this.getState.bind(this));
    this.moveInterval = setInterval(function () {
      this.setMoves();
      this.protectKing();
      this.makeMove();
    }.bind(this), this.speed);
  }

  end() {
    PieceStore.removeChangeListener(this.getState);
    if (this.moveInterval) clearInterval(this.moveInterval);
  }

  getState() {
    this.state = PieceStore.get();
  }

  // PRIVATE

  // helpers
  pieces() {
    if (this.state) return this.state.pieces;
  }

  grid() {
    if (this.state) return this.state.grid;
  }

  isOwnPiece(id) {
    return (this.color === 'white' && id < 16) || (this.color === 'black' && id > 15);
  }

  setMoves() {
    this.moves = {}; this.targets = [];
    for (var i = 0; i < 8; i++) {
      var col = [];
      for (var j = 0; j < 8; j++) col.push(new Array());
      this.targets.push(col);
    };

    var pieces = this.pieces();
    for (var pieceId in pieces) {
      this.moves[pieceId] = Board.getMoves(pieceId, this.state);

      Piece.getMoves(pieceId, this.state, true).forEach(function (move) {
        this.targets[move[0]][move[1]].push(pieceId);
      }.bind(this));
    }
  }

  isSafe(pos) {
    var pieceIds = this.targets[pos[0]][pos[1]];
    return pieceIds.length === 0 || pieceIds.every(function (id) {
      return this.isOwnPiece(id);
    }.bind(this));
  }

  isProtected(pos) {
    var pieceIds = this.targets[pos[0]][pos[1]];
    return pieceIds.length === 0 || pieceIds.some(function (id) {
      return this.isOwnPiece(id);
    }.bind(this));
  }

  piecesCanTake(pos) {
    return this.targets[pos[0]][pos[1]].filter(function (id) {
      let attacking = this.pieces()[id];
      return this.isOwnPiece(id) && attacking && attacking.status == 0;
    }.bind(this));
  }

  // piece logic
  makeMove() {
    var move = this.findMove();
    if (move) this.performMove(move);
  }

  findMove() {
    var move;
    var maxValue = 0;
    var moves = this.moves;
    for (var pieceId in moves) {
      if (this.isOwnPiece(pieceId) && pieceId != this.getKing().id) {
        var pieceMoves = moves[pieceId];
        for (var i = 0; i < pieceMoves.length; i++) {
          var target = pieceMoves[i];
          if (target) {
            var moveValue = this.moveValue(pieceId, target);
            if (moveValue > maxValue) {
              move = { id: pieceId, target: target };
              maxValue = moveValue;
            }
          }
        }
      }
    }
    return move;
  }

  moveValue(pieceId, target) {
    var net = 0;
    var piece = this.pieces()[pieceId];
    var pieceVal = value(piece);

    var currIsSafe = this.isSafe(piece.pos);
    var tarIsSafe = this.isSafe(target);

    var currIsProtected = this.isProtected(piece.pos);
    var tarIsProtected = this.isProtected(target);

    var tarId = this.grid()[target[0]][target[1]];

    // CURRENT POSITION
    if (!currIsSafe) {
      if (tarIsSafe) net += pieceVal; // MOVE OUT OF DANGER
      if (currIsProtected && !tarIsProtected && !tarIsSafe) net -= 1; // DONT MOVE AWAY FROM PROTECTION
    }

    // TARGET POSITION
    if (tarId) net += value(this.pieces()[tarId]); // TAKE HIGH VALUE PIECES
    if (!tarIsSafe) net -= pieceVal; // MAKE GOOD TRADES
    if (tarIsProtected) net += 1.1; // INCENTIVE TO TAKE PIECES

    // MOVE RISK: -0.5 MAX
    let [currRow, currCol] = this.pieces()[pieceId].pos;
    let [tarRow, tarCol] = target;
    let dist = Math.max(Math.abs(currRow - tarRow), Math.abs(currCol, tarCol));
    net += (1 - dist) / 14;

    // POSITIONAL VALUE
    if (Math.random() < 0.25)
      net += (3.5 - Math.abs(3.5 - target[1])) / 15; // COL VALUE: 0.2 MAX
    if (Math.random() < 0.25)
      net += this.color === 'white' ? ((7 - target[0]) / 35) : (target[0] / 35); // ROW VAL: 0.2 MAX

    return net;
  }

  // king logic
  protectKing() {
    var king = this.getKing();
    var threats = this.kingThreats();
    var safePos = this.kingSafePos();

    if (threats && threats.length > 0) {
      var protectingMoves = this.takeKingThreats(threats);
      if (protectingMoves && protectingMoves.length > 0)
        this.performMoves(protectingMoves);
      else if (king.status === 0 && safePos) {
        this.performMove({ id: king.id, target: safePos });
      }
    }
  }

  getKing() {
    return this.isOwnPiece(4) ? this.pieces()[4] : this.pieces()[28];
  }

  kingThreats() {
    var kingPos = this.getKing().pos;
    return this.targets[kingPos[0]][kingPos[1]].filter(function (id) {
      return !this.isOwnPiece(id);
    }.bind(this));
  }

  kingSafePos() {
    var kingMoves = this.moves[this.getKing().id];
    if (kingMoves)
      for (var i = 0; i < kingMoves.length; i++) {
        if (this.isSafe(kingMoves[i])) return kingMoves[i];
      }
  }

  takeKingThreats(threats) {
    var takingIds = new Set();
    var moves = [];
    for (var i = 0; i < threats.length; i++) {
      var threat = this.pieces()[threats[i]];
      var takingPieces = this.piecesCanTake(threat.pos);
      if (takingPieces && takingPieces.length > 0) {
        for (var j = 0; j < takingPieces.length; j++) {
          if (j == this.getKing().id) continue;
          if (takingIds.has(takingPieces[j])) continue;
          takingIds.add(takingPieces[j]);
          moves.push({ id: takingPieces[j], target: threat.pos });
          break;
        }
      };
    }
    return moves;
  }

  // moves
  performMove(move) {
    SoloManager.movePiece(move.id, move.target);
  }

  performMoves(moves) {
    for (var id in moves) this.performMove(moves[id]);
  }
}

export default Computer;
