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

class BallotRow extends Component {
    render() {
        let ballot = this.props.ballot;
        let btns = [];

        switch (ballot.status) {
            case "Completed":
                btns = [
                    <button>Results</button>,
                    <button className='btn-secondary'>Invalidate</button>]
                break;
            case "Ongoing":
                btns = [
                    <button>Close Ballot</button>,
                ];
                break;
        }

        let names = ballot.names.map((item) => <li>{item[0]} <span className='percent-voted'>({item[1].toFixed(2)}%)</span></li>);

        return <tr>
            <td>{ballot.id}</td>
            <td style={{ fontWeight: 'bold' }}>{ballot.position}</td>
            <td><ul>{names}</ul></td>
            <td>{ballot.max_votes}</td>
            <td>
                <span className={'status-' + ballot.status.replace(' ', '-').toLowerCase()}>{ballot.status}</span><br />
                <span className='percent-voted'>{ballot.percent_vote.toFixed(2)}% voted</span>
            </td>
            <td className='tbl-btns'>
                {btns}
            </td>
        </tr>
    }
}

class BallotsPage extends Component {
    constructor() {
        super();
        this.state = {
            ballots: [
                { id: '001', position: 'President', names: [["Joshua Xie", 89.737]], max_votes: 1, status: 'Completed', percent_vote: 76.47 },
                { id: '002', position: 'Outreach Coordinator', names: [["Winfred Tan", 64.489], ["Bertram Tan", 64.859]], max_votes: 2, status: 'Completed', percent_vote: 92.7328 },
                { id: '003', position: 'Secretary', names: [["Ang Seng Peng", 84.847]], max_votes: 1, status: 'Ongoing', percent_vote: 6.473 }]
        }
    }

    render() {
        let rows = this.state.ballots.map((ballot) => <BallotRow ballot={ballot} />)

        return <div id='ballots-page'>
            <button>+&nbsp;&nbsp;Create Ballot</button>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Position</th>
                        <th>Names</th>
                        <th>Max Votes</th>
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
            {this.state.page === 'ballots' && <BallotsPage />}
        </div>
    }
}

export default AdminDashboard