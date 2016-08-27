/* global Materialize */
import React from 'react';
import {browserHistory} from 'react-router';
import UserApi from '../../api/user_api';

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.logout = this.logout.bind(this);
    this.desktopLinks = this.desktopLinks.bind(this);
    this.mobileLinks = this.mobileLinks.bind(this);
    this.links = this.links.bind(this);

    this.state = {currentUser: this.props.currentUser};
  }

  componentDidMount() {
    $(".button-collapse").sideNav();
  }

  componentWillReceiveProps(props) {
    this.setState({currentUser: props.currentUser});
  }

  logout(e) {
    e.preventDefault();
    this.home();
    UserApi.logout(function(){
      Materialize.toast('Logged out', 2000, 'error-text');
    });
  }

	home() {
    browserHistory.push('/');
	}

  openLogin() {
		$('#login-modal').openModal();
	}

	openSignup() {
		$('#signup-modal').openModal();
	}

  desktopLinks() {
    return this.links("right hide-on-med-and-down");
  }

  mobileLinks(className, id) {
    return this.links('side-nav', 'nav-mobile');
  }

  links(className, id) {
    if (this.state.currentUser) {
			return (
        <ul id={id} className={className}>
          <li><a id='logout' onClick={this.logout}>Log Out</a></li>
        </ul>
      );
		} else {
      return (
        <ul id={id} className={className}>
  				<li><a onClick={this.openSignup} className="modal-trigger">
  					Sign Up
  				</a></li>
          <li><a onClick={this.openLogin} className="modal-trigger">
  					Log In
  				</a></li>
        </ul>
      );
    }
  }

  render() {
    return (
      <nav>
        <div className='nav-wrapper' id='header'>
          <a onClick={this.home} className='brand-logo center' id='logo'>
            Chess X
          </a>

          <a href="#" data-activates="nav-mobile" className="button-collapse">
            <i className="material-icons">menu</i>
          </a>

          {this.desktopLinks()}
          {this.mobileLinks()}
        </div>
      </nav>
    );
  }

};

export default Header;
