import React, { Component } from 'react';
import WebFont from "webfontloader";

import './styles/App.scss';

import LoginForm from './components/LoginForm';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';

class App extends Component {
  constructor() {
    super()

    WebFont.load({
      google: {
        families: ["Karla:400,700"]
      }
    });

    this.state = {
      loggedIn: false,
      userType: 'admin'
    }
  }

  login = (userType) => {
    this.setState({
      loggedIn: true, 
      userType: userType, 
    })
  }

  render() {
    return (
      <div className="App" >
        {!this.state.loggedIn && <LoginForm login={this.login} />}
        {this.state.loggedIn && this.state.userType === 'admin' && <AdminDashboard />}
        {this.state.loggedIn && this.state.userType === 'user' && <UserDashboard />}
      </div>
    );
  }
}

export default App;
