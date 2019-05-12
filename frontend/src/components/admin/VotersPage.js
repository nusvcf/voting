import React, { Component } from 'react';

class VotersPage extends Component {
	constructor() {
		super();
		this.state = {
			addVotersNum: 0,
			voters: [ { id: '0043', password: '473bjh384' }, { id: '0044', password: 'b9348373' } ]
		};
	}

	updateAddVotersNum = (e) => {
		this.setState({ addVotersNum: parseInt(e.target.value) });
    };
    
    addVoters = (e) => {
        e.preventDefault();
        // Do a fetch
        this.setState({addVotersNum: 0})
    }

	render() {
		let rows = this.state.voters.map((voter, i) => (
			<tr key={i}>
				<td>{voter.id}</td>
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
					<input type="number" value={this.state.addVotersNum} onChange={this.updateAddVotersNum} />
					<button onClick={this.addVoters}>+&nbsp;&nbsp;Add Voters</button>
				</div>
				<table>
					<thead>
						<tr>
							<th>ID</th>
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
