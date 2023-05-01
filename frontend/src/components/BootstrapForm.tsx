import logo from "../imgs/logo.png";
import React, { useState } from "react";
import { BACKEND_URL } from "../constants";

export const BootstrapForm = () => {
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = () => {
    setSaving(true);
    fetch(BACKEND_URL + "/bootstrap", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ admin_password: password }),
    }).then(() => window.location.reload());
  };

  return (
    <form id="login-form" onSubmit={handleSubmit}>
      <img src={logo} className="logo" alt="logo" />
      <div className="input-group">
        <label htmlFor="">Admin Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {saving && <div className="alert alert-info">Saving...</div>}
      {!saving && <input type="submit" value="Save" />}
    </form>
  );
};
