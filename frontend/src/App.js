import React, { Component } from "react";
import WebFont from "webfontloader";

import "./styles/App.scss";

import LoginForm from "./components/LoginForm";
import Alert from "./components/Alert";
import AdminDashboard from "./components/AdminDashboard";
import UserDashboard from "./components/UserDashboard";
import { BootstrapForm } from "./components/BootstrapForm";
import { BACKEND_URL, getAuth } from "./constants";

class App extends Component {
  constructor() {
    super();

    WebFont.load({
      google: {
        families: ["Karla:400,700"],
      },
    });

    this.state = {
      loading: true,
      bootstrapped: false,
      loggedIn: false,
      userType: "user",
      error: "",
      errorVisible: false,
      errorTimeout: null,
    };

    fetch(BACKEND_URL + "/bootstrap", {
      method: "GET",
    })
      .then((data) => data.json())
      .then((data) => {
        this.setState({ loading: false, bootstrapped: data.is_bootstrapped });
      });

    fetch(BACKEND_URL + "/login", {
      method: "GET",
      headers: { auth: getAuth() },
    })
      .then((data) => data.json())
      .then((data) => {
        if (data.success) {
          this.login(data.userType);
        }
      });
  }

  login = (userType) => {
    this.setState({
      loggedIn: true,
      userType: userType,
    });
  };

  clearState = () => {
    this.setState({
      loggedIn: false,
    });
    this.setError("You have been logged out. Please log in again to continue.");
  };

  setError = (message) => {
    this.setState({
      error: message,
      errorVisible: true,
      errorTimeout: setTimeout(() => {
        this.setState({ errorVisible: false });
        setTimeout(() => {
          this.setState({ error: "" });
        }, 500);
      }, 2000),
    });
  };

  render() {
    if (this.state.loading) {
      return <></>;
    }

    if (!this.state.bootstrapped) {
      return (
        <div className="App">
          <BootstrapForm />
        </div>
      );
    }

    return (
      <div className="App">
        {this.state.error.length > 0 && (
          <Alert visible={this.state.errorVisible} alertType="warning">
            {this.state.error}
          </Alert>
        )}
        {!this.state.loggedIn && (
          <LoginForm login={this.login} setError={this.setError} />
        )}
        {this.state.loggedIn && this.state.userType === "admin" && (
          <AdminDashboard clearState={this.clearState} />
        )}
        {this.state.loggedIn && this.state.userType === "user" && (
          <UserDashboard
            clearState={this.clearState}
            setError={this.setError}
          />
        )}
      </div>
    );
  }
}

export default App;
