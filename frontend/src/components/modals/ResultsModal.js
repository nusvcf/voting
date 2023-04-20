import React, { Component } from "react";
import "../../styles/Modal.scss";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTimes,
    faIdCard,
    faVoteYea
} from "@fortawesome/free-solid-svg-icons";

class VoterItem extends Component {
    render() {
        console.log(this.props);
        return (
            <tr>
                <td className="id">{this.props.id}</td>
                <td
                    className={
                        "vote-status-" +
                        this.props.status.replace(" ", "-").toLowerCase()
                    }
                >
                    {this.props.status}
                </td>
                <td>{this.props.votedFor.join(", ")}</td>
            </tr>
        );
    }
}

class ViewByVoter extends Component {
    render() {
        let results = [];
        for (let id in this.props.ballot.submittedUsers) {
            results.push(
                <VoterItem
                    key={id}
                    id={id}
                    {...this.props.ballot.submittedUsers[id]}
                />
            );
        }
        return (
            <table>
                <thead>
                    <tr>
                        <th>Voter</th>
                        <th>Vote Type</th>
                        <th>Vote Name</th>
                    </tr>
                </thead>
                <tbody>{results}</tbody>
            </table>
        );
    }
}

class CandidateItem extends Component {
    render() {
        let voters = this.props.voters.map((name, i) => (
            <li key={i}>{name}</li>
        ));
        return (
            <tr>
                <td>
                    {this.props.name} ({this.props.count} voted)
                </td>
                <td>
                    <ul>{voters}</ul>
                </td>
            </tr>
        );
    }
}

class ViewByCandidate extends Component {
    render() {
        let results = [];
        for (let name in this.props.ballot.namesInBallot) {
            results.push(
                <CandidateItem
                    name={name}
                    {...this.props.ballot.namesInBallot[name]}
                />
            );
        }

        return (
            <table>
                <tbody>{results}</tbody>
            </table>
        );
    }
}

class QuickStats extends Component {
    render() {
        return (
            <table>
                <tbody>
                    <tr>
                        <th>No. of valid voters:</th>
                        <td>{this.props.numValidVoters}</td>
                    </tr>
                    <tr>
                        <th>No. who sent in a vote:</th>
                        <td>
                            {this.props.numVotesInBallot} (
                            {(
                                (this.props.numVotesInBallot /
                                    this.props.numValidVoters) *
                                100
                            ).toFixed(2)}
                            %)
                        </td>
                    </tr>
                    <tr>
                        <th>
                            No. of abstain votes (either sent or didn't send):
                        </th>
                        <td>
                            {this.props.numValidVoters -
                                this.props.numNonAbstainVoters}{" "}
                            (
                            {(
                                ((this.props.numValidVoters -
                                    this.props.numNonAbstainVoters) /
                                    this.props.numValidVoters) *
                                100
                            ).toFixed(2)}
                            %)
                        </td>
                    </tr>
                    <tr>
                        <th>No. of non-abstain votes:</th>
                        <td>
                            {this.props.numNonAbstainVoters} (
                            {(
                                (this.props.numNonAbstainVoters /
                                    this.props.numValidVoters) *
                                100
                            ).toFixed(2)}
                            %)
                        </td>
                    </tr>
                    <tr>
                        <th>No. of “no confidence” votes</th>
                        <td>
                            {this.props.numNoConfidence} (
                            {(
                                (this.props.numNoConfidence /
                                    this.props.numNonAbstainVoters) *
                                100
                            ).toFixed(2)}
                            %)
                        </td>
                    </tr>
                </tbody>
            </table>
        );
    }
}

class ResultsModal extends Component {
    constructor() {
        super();
        this.state = {
            view: "voter"
        };
    }

    switchView = view => {
        this.setState({ view: view });
    };

    render() {
        let ballot = this.props.ballot;
        let switchViewBtn, view;

        if (this.state.view === "voter") {
            switchViewBtn = (
                <button
                    className="btn-secondary"
                    onClick={() => this.switchView("candidate")}
                >
                    <FontAwesomeIcon icon={faIdCard} />
                    &nbsp;&nbsp;View by Candidate
                </button>
            );
            view = <ViewByVoter ballot={this.props.ballot} />;
        } else {
            switchViewBtn = (
                <button
                    className="btn-secondary"
                    onClick={() => this.switchView("voter")}
                >
                    <FontAwesomeIcon icon={faVoteYea} />
                    &nbsp;&nbsp;View by Voter
                </button>
            );
            view = <ViewByCandidate ballot={this.props.ballot} />;
        }

        return (
            <div className="modal">
                <div className="modal-body">
                    <div className="close-btn" onClick={this.props.hideModal}>
                        <FontAwesomeIcon icon={faTimes} />
                    </div>

                    <h1>Results for {ballot.position}</h1>

                    <QuickStats {...this.props.ballot} />
                    {switchViewBtn}
                    {view}
                </div>
            </div>
        );
    }
}

export default ResultsModal;
