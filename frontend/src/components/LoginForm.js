import React, { Component } from 'react';
import logo from '../imgs/logo.png';

class LoginForm extends Component {
    constructor() {
        super();

        this.state = {
            username: "",
            password: "",
            errorMessage: ""
        }
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleUsernameChange = this.handleUsernameChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handlePasswordChange(event) {
        this.setState({password: event.target.value});
    }

    handleUsernameChange(event) {
        this.setState({username: event.target.value});
    }

    handleSubmit(event) {
        event.preventDefault();
        fetch("/login", {
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
            if(dataJson.success) {
                this.props.login(dataJson.userType);
            } else {
                this.setState({errorMessage: "Invalid Username/Password!"});
            }
        });
    }

    render() {
        return (
            <form id='login-form' onSubmit={this.handleSubmit}>
                <img src={logo} className='logo' alt='logo' />
                <div className='input-group'>
                    <label htmlFor=''>Username</label>
                    <input type='text' value = {this.state.username} onChange = {this.handleUsernameChange}/>
                </div>
                <div className='input-group'>
                    <label htmlFor=''>Password</label>
                    <input type='password' value = {this.state.password} onChange = {this.handlePasswordChange}/>
                </div>
                <input type='submit' value='Login' />
                <p>{this.state.errorMessage}</p>
            </form>
        )
    }
}

export default LoginForm;