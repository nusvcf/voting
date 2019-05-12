import React, {Component} from 'react';
import '../styles/Alert.scss';

class Alert extends Component {
    render() {
        return <div className={'alert alert-'+this.props.alertType + (this.props.visible ? ' alert-show': ' alert-hide')}>
            {this.props.children}
        </div>
    }
}

export default Alert;