import React, { Component } from 'react';
import VotersPage from './admin/VotersPage';
import BallotsPage from './admin/BallotsPage';
import Navbar from './admin/Navbar';


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
            {this.state.page === 'voters' && <VotersPage clearState={this.props.clearState} />}
            {this.state.page === 'ballots' && <BallotsPage clearState={this.props.clearState} />}
        </div>
    }
}

export default AdminDashboard