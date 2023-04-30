import React, { Component } from 'react';
import logo from '../imgs/logo.png';
import {BACKEND_URL} from "../constants";

class LoginForm extends Component {
    constructor() {
        super();

        this.state = {
            username: "",
            password: "",
            loggingIn: false,
            errorMessage: ""
        }
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleUsernameChange = this.handleUsernameChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handlePasswordChange(event) {
        this.setState({ password: event.target.value });
    }

    handleUsernameChange(event) {
        this.setState({ username: event.target.value });
    }

    handleSubmit(event) {
        event.preventDefault();
        this.setState({ loggingIn: true })
        fetch(BACKEND_URL + "/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: this.state.username,
                password: this.state.password
            }),
        })
            .then(data => {
                return data.json();
            })
            .then(dataJson => {
                if (dataJson.success) {
                    this.props.login(dataJson.userType);
                    console.log(dataJson.token)
                    document.cookie = `auth=${dataJson.token};max-age=18000`
                } else {
                    // Show error message
                    this.setState({ loggingIn: false })
                    this.props.setError("Could not log you in. Please try again.")
                }
            });
    }

    render() {
        return (
            <form id='login-form' onSubmit={this.handleSubmit}>
                <img src={logo} className='logo' alt='logo' />
                <div className='input-group'>
                    <label htmlFor=''>Username</label>
                    <input type='text' value={this.state.username} onChange={this.handleUsernameChange} />
                </div>
                <div className='input-group'>
                    <label htmlFor=''>Password</label>
                    <input type='password' value={this.state.password} onChange={this.handlePasswordChange} />
                </div>
                {this.state.loggingIn && <div className='alert alert-info'>Logging you in...</div>}
                {!this.state.loggingIn && <input type='submit' value='Login' />}
                <p>{this.state.errorMessage}</p>
            </form>
        )
    }
}

export default LoginForm;