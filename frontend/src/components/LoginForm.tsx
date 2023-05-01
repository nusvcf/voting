import React, { useState } from "react";
import logo from "../imgs/logo.png";
import { BACKEND_URL } from "../constants";

const LoginForm = (props: {
  login: (s: string) => void;
  setError: (s: string) => void;
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    fetch(BACKEND_URL + "/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    })
      .then((data) => {
        return data.json();
      })
      .then((dataJson) => {
        if (dataJson.success) {
          props.login(dataJson.userType);
          document.cookie = `auth=${dataJson.token};max-age=18000`;
        } else {
          // Show error message
          setLoggingIn(false);
          props.setError(
            "Could not log you in. Please double-check your username/password and try again."
          );
        }
      });
  };

  return (
    <form id="login-form" onSubmit={handleSubmit}>
      <img src={logo} className="logo" alt="logo" />
      <div className="input-group">
        <label htmlFor="username">Username</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={handleUsernameChange}
        />
      </div>
      <div className="input-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={handlePasswordChange}
        />
      </div>
      {loggingIn && <div className="alert alert-info">Logging you in...</div>}
      {!loggingIn && <input type="submit" value="Login" />}
    </form>
  );
};

export default LoginForm;
