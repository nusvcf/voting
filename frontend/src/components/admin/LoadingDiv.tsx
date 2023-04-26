import React from "react";

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCog} from "@fortawesome/free-solid-svg-icons";

function LoadingDiv(props: {show: boolean}) {
    if (props.show) {
        return (
          <div className="loading">
              <FontAwesomeIcon icon={faCog} spin/>
          </div>
        );
    } else {
        return <div/>
    }
}

export default LoadingDiv;
