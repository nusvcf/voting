import React, { Component } from "react";
import BallotModal from "../modals/BallotModal";
import ResultsModal from "../modals/ResultsModal";

class BallotRow extends Component {
    constructor() {
		super();
        this.state = {
            showModal: false
        };
    }

    closeBallot = () => {
        if (window.confirm("Are you sure you want to close the ballot?")) {
            fetch("/admin/ballots/" + this.props.ballot.id, {
                method: "POST"
            });
        }
    };

    invalidateBallot = () => {
        if (window.confirm("Are you sure you want to invalidate the ballot?")) {
            fetch("/admin/ballots/" + this.props.ballot.id, {
                method: "PUT"
            });
        }
    };

    showResults = () => {
        this.setState({ showModal: true });
    };

    hideResults = () => {
        this.setState({ showModal: false });
    };

    render() {
        let ballot = this.props.ballot;
        let btns = [];
        let status = "";

        if (ballot.isOpen) {
            status = "Ongoing";
            btns = [
                <button key={"close"} onClick={this.closeBallot}>
                    Close Ballot
                </button>
            ];
        } else {
            if (ballot.isValid) {
                status = "Completed";
                // Closed
                btns = [
                    <button key={"res"} onClick={this.showResults}>
                        Results
                    </button>,
                    <button
                        key={"inv"}
                        className="btn-secondary"
                        onClick={this.invalidateBallot}
                    >
                        Invalidate
                    </button>
                ];
            } else {
                status = "Invalidated";
                btns = [
                    <button
                        key={"res"}
                        className="btn-secondary"
                        onClick={this.showResults}
                    >
                        Results
                    </button>
                ];
            }
        }

        let names = ballot.names.map((item, i) => (
            <li key={i}>
                {item.name}{" "}
                <span className="percent-voted">
                    ({item.percentageVotes.toFixed(2)}%)
                </span>
            </li>
        ));

        return (
            <tr>
                <td className={"id " + (ballot.isValid ? "" : "invalid")}>
                    {ballot.id}
                </td>
                <td
                    className={ballot.isValid ? "" : "invalid"}
                    style={{ fontWeight: "bold" }}
                >
                    {ballot.position}
                </td>
                <td className={ballot.isValid ? "" : "invalid"}>
                    <ul>{names}</ul>
                </td>
                <td className={ballot.isValid ? "" : "invalid"}>
                    {ballot.maxVotes}
                </td>
                <td>
                    <span className={"status-" + status.toLowerCase()}>
                        {status}
                    </span>
                    <br />
                    <div className="percent-voted">
						{ballot.percentageVotes.toFixed(2)}% voted<br />
						{ballot.numValidVoters} valid voters, {ballot.numVotesInBallot} votes cast, of which {ballot.numNonAbstainVoters} non-abstain voters
                    </div>
                </td>
                <td className="tbl-btns">{btns}</td>
                {this.state.showModal && <ResultsModal hideModal={this.hideResults} ballot={ballot} />}
            </tr>
        );
    }
}

class BallotsPage extends Component {
    interval = null;
    constructor() {
        super();
        this.state = {
            showModal: false,
            ballots: []
        };

        this.fetchData();
        this.interval = setInterval(this.fetchData, 800);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    fetchData = () => {
        fetch("/admin/ballots")
            .then(data => data.json())
            .then(json => {
                this.setState({ ballots: json });
            })
            .catch(error => {
                this.props.clearState();
            });
    };

    showModal = () => {
        this.setState({ showModal: true });
    };

    hideModal = () => {
        this.setState({ showModal: false });
    };

    render() {
        let rows = this.state.ballots.map((ballot, i) => (
            <BallotRow key={ballot.id} ballot={ballot} fetchData={this.fetchData} />
        ));

        return (
            <div id="ballots-page">
                <button onClick={this.showModal}>
                    +&nbsp;&nbsp;Create Ballot
                </button>
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
                <BallotModal
                    show={this.state.showModal}
                    hideModal={this.hideModal}
                    onSubmit={this.fetchData}
                />
            </div>
        );
    }
}

export default BallotsPage;
