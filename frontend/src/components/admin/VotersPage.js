import React, { Component } from 'react';

class VotersPage extends Component {
	constructor() {
		super();
		this.state = {
			addStart: 0,
			addEnd: 0,
			voters: []
		};

		this.fetchData();
	}

	fetchData = () => {
		fetch('/admin/voters')
			.then((data) => {
				return data.json()
			})
			.then((json) => {
				this.setState({ voters: json });
			})
			.catch((error) => {
				console.error(error);
			});
	};

	updateAddStart = (e) => {
		this.setState({ addStart: parseInt(e.target.value) });
	};
	updateAddEnd = (e) => {
		this.setState({ addEnd: parseInt(e.target.value) });
	};

	addVoters = (e) => {
		e.preventDefault();
		// Do a fetch
		fetch('/admin/voters', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				start: this.state.addStart,
				end: this.state.addEnd
			})
		}).then(() => {
			this.fetchData();
		});
		this.setState({ addStart: this.state.addEnd + 1, addEnd: this.state.addEnd + 1 });
	};

	render() {
		let rows = this.state.voters.map((voter, i) => (
			<tr key={i}>
				<td>{voter.id}</td>
				<td>{voter.username}</td>
				<td>{voter.password}</td>
				<td className="tbl-btns">
					<button className="btn-secondary">Invalidate</button>
					<button className="btn-warn">Delete</button>
				</td>
			</tr>
		));

		return (
			<div id="voters-page">
				<div className="input-group input-group-row">
					<input type="number" value={this.state.addStart} onChange={this.updateAddStart} />
					<input type="number" value={this.state.addEnd} onChange={this.updateAddEnd} />
					<button onClick={this.addVoters}>+&nbsp;&nbsp;Add Voters</button>
				</div>
				<table>
					<thead>
						<tr>
							<th>ID</th>
							<th>Username</th>
							<th>Password</th>
							<th>&nbsp;</th>
						</tr>
					</thead>
					<tbody>{rows}</tbody>
				</table>
			</div>
		);
	}
}

export default VotersPage;
