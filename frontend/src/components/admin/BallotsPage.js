import React, { Component } from 'react';
import BallotModal from '../modals/BallotModal';

class BallotRow extends Component {
	render() {
		let ballot = this.props.ballot;
		let btns = [];

		switch (ballot.status) {
			case 'Completed':
				btns = [
					<button key={'res'}>Results</button>,
					<button key={'inv'} className="btn-secondary">
						Invalidate
					</button>
				];
				break;
			case 'Ongoing':
				btns = [ <button key={'close'}>Close Ballot</button> ];
				break;
		}

		let names = ballot.names.map((item, i) => (
			<li key={i}>
				{item[0]} <span className="percent-voted">({item[1].toFixed(2)}%)</span>
			</li>
		));

		return (
			<tr>
				<td>{ballot.id}</td>
				<td style={{ fontWeight: 'bold' }}>{ballot.position}</td>
				<td>
					<ul>{names}</ul>
				</td>
				<td>{ballot.max_votes}</td>
				<td>
					<span className={'status-' + ballot.status.replace(' ', '-').toLowerCase()}>{ballot.status}</span>
					<br />
					<span className="percent-voted">{ballot.percent_vote.toFixed(2)}% voted</span>
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
			ballots: [
				{
					id: '001',
					position: 'President',
					names: [ [ 'Joshua Xie', 89.737 ] ],
					max_votes: 1,
					status: 'Completed',
					percent_vote: 76.47
				},
				{
					id: '002',
					position: 'Outreach Coordinator',
					names: [ [ 'Winfred Tan', 64.489 ], [ 'Bertram Tan', 64.859 ] ],
					max_votes: 2,
					status: 'Completed',
					percent_vote: 92.7328
				},
				{
					id: '003',
					position: 'Secretary',
					names: [ [ 'Ang Seng Peng', 84.847 ] ],
					max_votes: 1,
					status: 'Ongoing',
					percent_vote: 6.473
				}
			]
		};
	}

	showModal = () => {
		this.setState({ showModal: true });
	};

	hideModal = () => {
		this.setState({ showModal: false });
	};

	render() {
		let rows = this.state.ballots.map((ballot, i) => <BallotRow key={i} ballot={ballot} />);

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
				<BallotModal show={this.state.showModal} hideModal={this.hideModal} />
			</div>
		);
	}
}

export default BallotsPage;
