import React, { Component } from "react";
import logo from "../imgs/logo-small.png";

const WelcomeText = () => (
    <div className="waiting-text">
        <h1>Welcome to VCF AGM 2019!</h1>
        This page will automatically update when voting starts.
    </div>
);

const WaitingText = () => (
    <div className="waiting-text">
        <h1>Your vote has been received.</h1>
        This page will automatically update when the next round of voting
        starts.
    </div>
);

const no_conf_text = "I have no confidence in any of these candidates.";
const abstain_text = "I wish to abstain from this round of voting.";

class VotingOption extends Component {
    render() {
        let key = this.props.text;
        let inputType = "checkbox";
        if (this.props.text === no_conf_text) {
            key = "No Confidence";
            inputType = "radio";
        } else if (this.props.text === abstain_text) {
            key = "Abstain";
            inputType = "radio";
        } else if (this.props.maxVotes == 1) {
            inputType = "radio";
        }
        let selected = this.props.selected[key];
        return (
            <div className="option">
                <input
                    type={inputType}
                    id={this.props.id}
                    onChange={e => this.props.updateVote(this.props.text, e)}
                    checked={selected}
                />
                <label id={this.props.id + "-label"} htmlFor={this.props.id}>
                    {this.props.text}
                </label>
            </div>
        );
    }
}

class VotingPage extends Component {
    render() {
        let options = this.props.names.map(name => (
            <VotingOption
                key={name}
                id={name.replace(" ", "-")}
                text={name}
                updateVote={this.props.updateVote}
                selected={this.props.selected}
                maxVotes={this.props.maxVotes}
            />
        ));
        options.push(
            <VotingOption
                key="no-conf"
                id="no-conf"
                text={no_conf_text}
                updateVote={this.props.updateVote}
                selected={this.props.selected}
                maxVotes={this.props.maxVotes}
            />
        );
        options.push(
            <VotingOption
                key="abstain"
                id="abstain"
                text={abstain_text}
                updateVote={this.props.updateVote}
                selected={this.props.selected}
                maxVotes={this.props.maxVotes}
            />
        );
        return (
            <div id="voting-page">
                <div id="currently-voting-for">
                    Currently voting for:{" "}
                    <div id="position">{this.props.position}</div>
                </div>
                {this.props.maxVotes > 1 && (
                    <div>
                        You can select up to <b>2</b> names.
                    </div>
                )}
                {this.props.maxVotes == 1 && (
                    <div>
                        You can only select <b>1</b> name.
                    </div>
                )}
                <div id="options">{options}</div>
                <button onClick={this.props.sendVote}>Send Vote</button>
            </div>
        );
    }
}

class UserDashboard extends Component {
    interval = null;
    constructor() {
        super();
        this.state = {
            status: "welcome",
            id: "",
            position: "",
            names: [],
            selected: {},
            maxVotes: 1
        };

        this.fetchData();
        this.interval = setInterval(this.fetchData, 2000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    fetchData = () => {
        fetch("/user/ballot")
            .then(data => data.json())
            .then(json => {
                if (json.id !== "") {
                    let selected = {
                        Abstain: false,
                        "No Confidence": false
                    };
                    for (let i = 0; i < json.names.length; i++) {
                        selected[json.names[i]] = false;
                    }
                    this.setState({
                        status: "voting",
                        id: json.id,
                        position: json.position,
                        names: json.names,
                        maxVotes: json.maxVotes
                    });
                } else {
                    if (this.state.status != "welcome") {
                        this.setState({
                            status: "waiting",
                            id: "",
                            position: "",
                            names: []
                        });
                    }
                }
            })
            .catch(error => {
                this.props.clearState();
            });
    };

    updateVote = (name, e) => {
        let selected = this.state.selected;
        if (e.target.checked && name === no_conf_text) {
            selected["No Confidence"] = true;
            selected["Abstain"] = false;
            for (let i = 0; i < this.state.names.length; i++) {
                selected[this.state.names[i]] = !e.target.checked;
            }
        } else if (e.target.checked && name === abstain_text) {
            selected["No Confidence"] = false;
            selected["Abstain"] = true;
            for (let i = 0; i < this.state.names.length; i++) {
                selected[this.state.names[i]] = !e.target.checked;
            }
        } else {
            if (e.target.checked) {
                selected["No Confidence"] = false;
                selected["Abstain"] = false;
                if (this.state.maxVotes == 1) {
                    // Deselect all other votes
                    for (let key in selected) {
                        if (key !== name) {
                            selected[key] = false;
                        }
                    }
                }
            }
            selected[name] = e.target.checked;
        }
        this.setState({ selected: selected });
    };

    sendVote = () => {
        // Perform fetch
        let names = [];
        for (let key in this.state.selected) {
            if (this.state.selected[key]) {
                names.push(key);
            }
        }
        if (names.length == 0) {
            this.props.setError("Please select an option.");
            return;
        }
        if (names.length > this.state.maxVotes) {
            this.props.setError("You have selected too many names.");
            return;
        }
        fetch("/user/ballot/" + this.state.id, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                names: names
            })
        })
            .then(data => data.json())
            .then(json => {
                if (json.success) {
                    this.setState({
                        status: "waiting",
                        names: [],
                        selected: {},
                        position: ""
                    });
                } else {
                    this.props.setError(
                        "There was a problem casting your vote. Please try again later. "
                    );
                }
            })
            .catch(error => {
                this.props.clearState();
            });
    };

    render() {
        return (
            <div id="user">
                <img src={logo} className="logo" alt="logo" />
                {this.state.status === "welcome" && <WelcomeText />}
                {this.state.status === "waiting" && <WaitingText />}
                {this.state.status === "voting" && (
                    <VotingPage
                        position={this.state.position}
                        names={this.state.names}
                        maxVotes={this.state.maxVotes}
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
