import React, { Component } from 'react';
import logo from '../imgs/logo.png';

class LoginForm extends Component {
    render() {
        return (
            <div id='login-form'>
                <img src={logo} className='logo' alt='logo' />
                <div className='input-group'>
                    <label for=''>Username</label>
                    <input type='text' />
                </div>
                <div className='input-group'>
                    <label for=''>Password</label>
                    <input type='password' />
                </div>
                <input type='submit' value='Login' />
            </div>
        )
    }
}

export default LoginForm;