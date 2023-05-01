import React from "react";
import logo from "../../imgs/logo-small.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOut } from "@fortawesome/free-solid-svg-icons";

export const HeaderBar = (props: { clearState: () => void }) => {
  return (
    <div id="header-bar">
      <img src={logo} className="logo" alt="logo" />
      <div style={{ flex: 1 }} />
      <div
        className="navbar-link"
        onClick={() => {
          document.cookie = "auth=xxx; Max-Age=-99999999";
          props.clearState();
        }}
      >
        <FontAwesomeIcon icon={faSignOut} />
        &nbsp;&nbsp;Logout
      </div>
    </div>
  );
};
