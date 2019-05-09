import React, { Component } from 'react';
import logo from '../imgs/logo.png';

class LoginForm extends Component {
    constructor() {
        super();

        this.state = {
            username: "",
            password: ""
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

    //incomplete
    handleSubmit(event) {
        console.log("Sending");
        fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: this.state.username,
                password: this.state.password
            }),
            credentials: "same-origin"
        })
        .then(data => {return data.json()})
        .then(dataJson => console.log(dataJson));
    }

    render() {
        return (
            <div id='login-form'>
                <img src={logo} className='logo' alt='logo' />
                <div className='input-group'>
                    <label for=''>Username</label>
                    <input type='text' value = {this.state.username} onChange = {this.handleUsernameChange}/>
                </div>
                <div className='input-group'>
                    <label for=''>Password</label>
                    <input type='password' value = {this.state.password} onChange = {this.handlePasswordChange}/>
                </div>
                <input type='submit' value='Login' onClick = {this.handleSubmit} />
            </div>
        )
    }
}

export default LoginForm;