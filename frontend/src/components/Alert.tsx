import React from "react";
import "../styles/Alert.scss";

function Alert(props: { alertType: string; visible: boolean; children: any }) {
  return (
    <div
      className={
        "alert alert-" +
        props.alertType +
        (props.visible ? " alert-show" : " alert-hide")
      }
    >
      {props.children}
    </div>
  );
}

export default Alert;
