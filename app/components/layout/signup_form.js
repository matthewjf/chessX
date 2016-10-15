/* global Materialize */
import React from 'react';
import UserApi from '../../api/user_api';

class SignupForm extends React.Component {
  constructor() {
    super();
    this.setUsername = this.setUsername.bind(this);
    this.setEmail = this.setEmail.bind(this);
    this.setPassword = this.setPassword.bind(this);
    this.resetState = this.resetState.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.success = this.success.bind(this);
    this.error = this.error.bind(this);

    this.defaultState = {username: '', password: '', email: ''};

    this.state = this.defaultState;
  }

  setUsername(e) {
    this.setState({username: e.currentTarget.value});
  }

  setPassword(e) {
    this.setState({password: e.currentTarget.value});
  }

  setEmail(e) {
    this.setState({email: e.currentTarget.value});
  }

  resetState() {
    this.setState(this.defaultState);
  }

  handleSubmit(e) {
    e.preventDefault();
    UserApi.signup(this.state, this.success, this.error);
  }

  success(data) {
    this.resetState();
    $('#signup-modal').closeModal();
    Materialize.toast('Email verification sent!', 10000, 'success-text');
  }

  error(res) {
    var json = res.responseJSON;
    if (json.errors) this.setState({errors: json.errors});
    // TODO: better error handling
    else this.setState({errors: {err: 'unknown error'}});
  }

  renderErrors(errors) {
    if (errors) {
      return Object.keys(errors).map(key =>{
        return (
          <span className='error-text' key={key} >
            {errors[key]}
          </span>
        );
      });
    } else {
      return null;
    }
  }

  render() {
    if (this.state.currentUser) {
      return null;
    } else {
      return (
        <div id="signup-modal" className="modal">
          <div className='row'>
            <form onSubmit={this.handleSubmit}>

              <div className="modal-content">
                {this.renderErrors(this.state.errors)}
                <div className='row'>
                  <div className='input-field'>
                    <input id="signup[username]"
                           type="text"
                           value={this.state.username}
                           onChange={this.setUsername} />
                    <label htmlFor="signup[username]">Username</label>
                  </div>
                </div>

                <div className='row'>
                  <div className='input-field'>
                    <input id="signup[email]"
                           type="email"
                           value={this.state.email}
                           onChange={this.setEmail} />
                    <label htmlFor="signup[email]">Email</label>
                  </div>
                </div>

                <div className='row'>
                  <div className='input-field'>
                    <input id="signup[password]"
                           type="password"
                           value={this.state.password}
                           onChange={this.setPassword} />
                    <label htmlFor="signup[password]">Password</label>
                  </div>
                </div>

              </div>
              <input type="submit" className='hidden-submit' />
              <div className='modal-footer'>
                <a onClick={this.handleSubmit} className="waves-effect waves-light btn">
                  Sign Up
                </a>
              </div>

            </form>
          </div>
        </div>
      );
    }
  }
};

export default SignupForm;
