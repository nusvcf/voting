import React, { Component } from 'react';
import logo from '../../imgs/logo-small.png';

class NavbarItem extends Component {
    render() {
        let className = 'navbar-link';
        if (this.props.page === this.props.pageName) {
            className += ' navbar-link-active';
        }
        return <div className={className} onClick={() => this.props.changePage(this.props.pageName)}>{this.props.children}</div>
    }
}

class Navbar extends Component {
    render() {
        return <div id='navbar'>
            <img src={logo} className='logo' alt='logo' />
            <NavbarItem pageName='voters' page={this.props.page} changePage={this.props.changePage}>Voters</NavbarItem>
            <NavbarItem pageName='ballots' page={this.props.page} changePage={this.props.changePage}>Ballots</NavbarItem>
        </div>
    }
}

export default Navbar