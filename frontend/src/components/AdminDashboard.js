import React, { Component } from 'react';
import logo from '../imgs/logo-small.png';

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


class VotersPage extends Component {

    constructor() {
        super();
        this.state = {
            voters: [{ 'id': '0043', 'password': '473bjh384' },
            { 'id': '0044', 'password': 'b9348373' }]
        }
    }

    render() {
        let rows = this.state.voters.map((voter) => <tr>
            <td>{voter.id}</td>
            <td>{voter.password}</td>
            <td className='tbl-btns'>
                <button className='btn-secondary'>Invalidate</button>
                <button className='btn-warn'>Delete</button>
            </td>
        </tr>)

        return <div id='voters-page'>
            <button>+&nbsp;&nbsp;Add Voters</button>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Password</th>
                        <th>&nbsp;</th>
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </table>
        </div>
    }
}

class BallotsPage extends Component {

    constructor() {
        super();
        this.state = {
            voters: [
                { 'id': '001', 'position': 'President', names: [], status: 'Completed' },  
                { 'id': '002', 'position': 'Secretary', names: [], status: 'Upcoming' }]
        }
    }

    render() {
        let rows = this.state.voters.map((voter) => <tr>
            <td>{voter.id}</td>
            <td>{voter.position}</td>
            <td>{voter.names}</td>
            <td>{voter.status}</td>
            <td className='tbl-btns'>
                <button className='btn-secondary'>Invalidate</button>
                <button className='btn-warn'>Delete</button>
            </td>
        </tr>)

        return <div id='ballots-page'>
            <button>+&nbsp;&nbsp;Create Ballot</button>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Position</th>
                        <th>Names</th>
                        <th>Status</th>
                        <th>&nbsp;</th>
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </table>
        </div>
    }
}

class AdminDashboard extends Component {
    constructor() {
        super()
        this.state = {
            page: 'voters'
        }
    }

    changePage = (pageName) => {
        this.setState({ page: pageName })
    }

    render() {
        return <div id='admin'>
            <Navbar page={this.state.page} changePage={this.changePage} />
            {this.state.page === 'voters' && <VotersPage />}
            {this.state.page == 'ballots' && <BallotsPage />}
        </div>
    }
}

export default AdminDashboard