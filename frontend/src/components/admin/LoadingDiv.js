import React, { Component } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from "@fortawesome/free-solid-svg-icons";

class LoadingDiv extends Component {
    render() {
        if (this.props.show) {
            return (
                <div className="loading">
                    <FontAwesomeIcon icon={faCog} spin />
                </div>
            );
        } else {
            return <div />
        }
    }
}

export default LoadingDiv;
