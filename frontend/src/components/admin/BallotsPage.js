import React, { Component } from 'react';
import BallotModal from '../modals/BallotModal';

class BallotRow extends Component {
	closeBallot = () => {
		fetch('/admin/ballots/' + this.props.ballot.id, {
			method: 'POST'
		})
	}

	render() {
		let ballot = this.props.ballot;
		let btns = [];
		let status = '';

		if (ballot.isOpen) {
			status = 'Ongoing'
			btns = [ <button key={'close'} onClick={this.closeBallot}>Close Ballot</button> ];
		} else {
			status = 'Completed';
			// Closed
			btns = [
				<button key={'res'}>Results</button>,
				<button key={'inv'} className="btn-secondary">
					Invalidate
				</button>
			];
		}

		let names = ballot.names.map((item, i) => (
			<li key={i}>
				{item.name} <span className="percent-voted">({item.percentageVotes.toFixed(2)}%)</span>
			</li>
		));

		return (
			<tr>
				<td>{ballot.id}</td>
				<td style={{ fontWeight: 'bold' }}>{ballot.position}</td>
				<td>
					<ul>{names}</ul>
				</td>
				<td>{ballot.maxVotes}</td>
				<td>
					<span className={'status-' + status.toLowerCase()}>{status}</span>
					<br />
					<span className="percent-voted">{ballot.percentageVotes.toFixed(2)}% voted</span>
				</td>
				<td className="tbl-btns">{btns}</td>
			</tr>
		);
	}
}

class BallotsPage extends Component {
	constructor() {
		super();
		this.state = {
			showModal: false,
			ballots: []
		};

		this.fetchData();
		setInterval(this.fetchData, 800);
	}

	fetchData = () => {
		fetch('/admin/ballots').then((data) => data.json()).then((json) => {
			this.setState({ ballots: json });
		});
	};

	showModal = () => {
		this.setState({ showModal: true });
	};

	hideModal = () => {
		this.setState({ showModal: false });
	};

	render() {
		let rows = this.state.ballots.map((ballot, i) => <BallotRow key={i} ballot={ballot} fetchData={this.fetchData} />);

		return (
			<div id="ballots-page">
				<button onClick={this.showModal}>+&nbsp;&nbsp;Create Ballot</button>
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
					<tbody>{rows}</tbody>
				</table>
				<BallotModal show={this.state.showModal} hideModal={this.hideModal} onSubmit={this.fetchData} />
			</div>
		);
	}
}

export default BallotsPage;
