import React, { Component } from 'react';
import logo from '../imgs/logo-small.png';

const WelcomeText = () => (
	<div className="waiting-text">
		<h1>Welcome to VCF AGM 2019!</h1>
		This page will automatically update when voting starts.
	</div>
);

const WaitingText = () => (
	<div className="waiting-text">
		<h1>Your vote has been received.</h1>
		This page will automatically update when the next round of voting starts.
	</div>
);

const no_conf_text = 'I have no confidence in any of these candidates.';
const abstain_text = 'I wish to abstain from this round of voting.';

class VotingOption extends Component {
	render() {
		let key = this.props.text;
		let inputType = 'checkbox';
		if (this.props.text === no_conf_text) {
			key = 'No Confidence';
			inputType = 'radio';
		} else if (this.props.text === abstain_text) {
			key = 'Abstain';
			inputType = 'radio';
		}
		let selected = this.props.selected[key];
		return (
			<div className="option">
				<input
					type={inputType}
					id={this.props.id}
					onChange={(e) => this.props.updateVote(this.props.text, e)}
					checked={selected}
				/>
				<label id={this.props.id + '-label'} htmlFor={this.props.id}>
					{this.props.text}
				</label>
			</div>
		);
	}
}

class VotingPage extends Component {
	render() {
		let options = this.props.names.map((name) => (
			<VotingOption
				key={name}
				id={name.replace(' ', '-')}
				text={name}
				updateVote={this.props.updateVote}
				selected={this.props.selected}
			/>
		));
		options.push(
			<VotingOption
				key="no-conf"
				id="no-conf"
				text={no_conf_text}
				updateVote={this.props.updateVote}
				selected={this.props.selected}
			/>
		);
		options.push(
			<VotingOption
				key="abstain"
				id="abstain"
				text={abstain_text}
				updateVote={this.props.updateVote}
				selected={this.props.selected}
			/>
		);
		return (
			<div id="voting-page">
				<div id="currently-voting-for">
					Currently voting for: <div id="position">{this.props.position}</div>
				</div>
				<div>
					You can select up to <b>2</b> names.
				</div>
				<div id="options">{options}</div>
				<button onClick={this.props.sendVote}>Send Vote</button>
			</div>
		);
	}
}

class UserDashboard extends Component {
	constructor() {
		super();
		this.state = {
			status: 'voting',
			position: 'Outreach Coordinator',
			names: [ 'Winfred Tan', 'Bertram Tan' ],
			selected: { 'Winfred Tan': false, 'Bertram Tan': false, 'No Confidence': false },
			max_allowed: 1
		};
	}

	updateVote = (name, e) => {
		let selected = this.state.selected;
		if (e.target.checked && name === no_conf_text) {
			selected['No Confidence'] = true;
			selected['Abstain'] = false;
			for (let i = 0; i < this.state.names.length; i++) {
				selected[this.state.names[i]] = !e.target.checked;
			}
		} else if (e.target.checked && name === abstain_text) {
            selected['No Confidence'] = false;
			selected['Abstain'] = true;
			for (let i = 0; i < this.state.names.length; i++) {
				selected[this.state.names[i]] = !e.target.checked;
			}
		} else {
			selected[name] = e.target.checked;
			if (e.target.checked) {
				selected['No Confidence'] = false;
				selected['Abstain'] = false;
			}
		}
		this.setState({ selected: selected });
    };
    
    sendVote = () => {
        // Perform fetch
        this.setState({
            status: 'waiting', 
            names: [], 
            selected: {}, 
            position: ''
        })
    }

	render() {
		return (
			<div id="user">
				<img src={logo} className="logo" alt="logo" />
				{this.state.status === 'welcome' && <WelcomeText />}
				{this.state.status === 'waiting' && <WaitingText />}
				{this.state.status === 'voting' && (
					<VotingPage
						position={this.state.position}
						names={this.state.names}
						selected={this.state.selected}
                        updateVote={this.updateVote}
                        sendVote={this.sendVote}
					/>
				)}
			</div>
		);
	}
}

export default UserDashboard;
