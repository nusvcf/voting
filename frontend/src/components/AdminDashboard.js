import React, { Component } from 'react';
import VotersPage from './admin/VotersPage';
import BallotsPage from './admin/BallotsPage';
import Navbar from './admin/Navbar';


class AdminDashboard extends Component {
    constructor() {
        super()
        this.state = {
            page: 'ballots'
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