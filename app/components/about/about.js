import React from 'react';

class About extends React.Component {
  signup(e) {
    e.preventDefault();
    $('.button-collapse', '#header').sideNav('hide');
    $('#signup-modal').openModal();
  }
  componentDidMount() {
    $(document).ready(function () {
      $('.scrollspy').scrollSpy();
    });
  }

  render() {
    return (
      <div id='about' className="row">
        <div className="col s12 m9 l10">
          <div id="introduction" className="section scrollspy">
            <h2>INTRODUCTION</h2>
            <h3>What's ChessX?</h3>
            <p>
              It's realtime chess without turns.
              Any available piece can be moved at any time.
              After a piece moves, it's unavailable for 10 seconds.
              The game ends when either king is captured or 10 minutes elapses.
              Games are meant to be fast and furious, not afternoon tea.
            </p>
            <img src="/images/gameplay.gif" />
            <h3>History</h3>
            <p>
              ChessX is an attempt to recreate <a href='https://en.wikipedia.org/wiki/Kung-Fu_Chess'>Kung-Fu Chess</a>.
              There are other versions of the game, which you can find <a href='https://en.wikipedia.org/wiki/Kung-Fu_Chess#Other_Projects'>
                here</a>. The most popular alternative that's available today is built
              on silverlight, which has limited browser support and is being phased out.
            </p>
          </div>
          <div id="getting-started" className="section scrollspy">
            <h2>GETTING STARTED</h2>
            <h3>Sign up!</h3>
            <p>
              Your account helps keep games safe from those hackers.
              An email is required in case you forget your password.
              Emails aren't toys.
              They won't be given out or used for bad things.
            </p>
            <p>
              Sign up using the menu in the header or by clicking <a href='#' onClick={this.signup}>here</a>.
            </p>
            <h3>Get in a game</h3>
            <p>
              The fastest way to play is by clicking on a game with a player already waiting.
              You can also start a game with the <code className='code-btn'>new game</code> button on the home page.
              Click <code className='code-btn'>create</code> to start a multiplayer game, or <code>single player</code> to play against the computer.
            </p>
            <img src="/images/newgame.png" />
            <h3>Spectate</h3>
            <p>
              If you're not sure what to do, try watching a game.
              You can watch any games that are in progress.
              Spectators aren't allowed to make moves.
            </p>
          </div>

          <div id="gameplay" className="section scrollspy">
            <h2>GAMEPLAY</h2>
            <h3>Starting</h3>
            <p>
              Once 2 players have joined a game, a countdown will begin.
              The game starts when the countdown ends.
              If either player leaves during the countdown, the game won't start.
              Once a game starts, it will continue until either king is captured or 10 minutes elapses.
              If you leave during a game, no one's going to wait for you.
            </p>
            <h3>Moves</h3>
            <p>
              To make a move, select a one of your own pieces that's not on cooldown.
              The positions available to that piece will be highlighted in green.
              Click on any of the available positions to perform a move.
            </p>
            <img src="/images/moves.png" />
            <p>
              Pieces can be intercepted during their move.
              If a piece takes another piece in the middle of its move, its move will end.
            </p>
            <h3>Advanced</h3>
            <p>
              Knights: They can't be intercepted.
              They are off the board for a brief period of time during their move.
            </p>
            <p>
              Pawn promotion: Pawns are automatically promoted to queens when they reach the opposite end of the board.
              You don't get to choose. Sorry.
            </p>
            <p>
              En passant: It doesn't exist in ChessX, since you can capture a pawn during its move.
            </p>
            <p>
              Castling: It occurs immediately and cannot be intercepted.
              You can castle if the king and target rook haven't moved yet, and there aren't pieces between.
              Since check doesn't exist, it's not part of the castling requirement.
            </p>
            <p>
              Draws: If 10 minutes elapses, the game is considered a draw and ends.
            </p>
          </div>

          <div id="competitive" className="section scrollspy">
            <h2>COMPETITIVE</h2>
            <p>
              Ranks and matchmaking coming soon. Stay tuned!
            </p>
          </div>

          <div id="miscellaneous" className="section scrollspy">
            <h2>MISCELLANEOUS</h2>
            <h3>Replays</h3>
            <p>
              Once a game ends, you get access to the replay feature.
              You can play back the entire game or skip to just the parts you want.
            </p>
            <img src="/images/replay.gif" />
          </div>

          <div id="contact" className="section scrollspy">
            <h2>CONTACT US</h2>
            <h3>Email</h3>
            <p>
              For any questions or concerns, or if you just want someone to talk to,
              shoot us an email at <a href="mailto:contact@chessx.io">contact@chessx.io</a>
            </p>
          </div>
        </div>

        <div className="col hide-on-small-only m3 l2">
          <ul className="section table-of-contents">
            <li><a href="#introduction">Introduction</a></li>
            <li><a href="#getting-started">Getting Started</a></li>
            <li><a href="#gameplay">Gameplay</a></li>
            <li><a href="#competitive">Competitive</a></li>
            <li><a href="#miscellaneous">Miscellaneous</a></li>
            <li><a href="#contact">Contact Us</a></li>
          </ul>
        </div>
      </div>
    );
  }
}

export default About;
