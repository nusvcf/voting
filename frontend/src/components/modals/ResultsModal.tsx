import React, {Component} from "react";
import "../../styles/Modal.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faIdCard, faTimes, faVoteYea} from "@fortawesome/free-solid-svg-icons";
import {Ballot, BallotVote} from "../admin/BallotsPage";

const VoterItem = (props: { ballot: Ballot, vote: BallotVote }) => {
    let status = 'Normal';
    if (props.vote.abstain) {
        status = 'Abstain'
    } else if (props.vote.noConfidence) {
        status = 'No Confidence'
    }

  return (
    <tr>
      <td className="id">{props.vote.id}</td>
        <td>
      <div
        className={
          "vote-status-" +status.replace(" ", "-").toLowerCase()
        }
      >
        {status}
      </div>
        </td>
      <td>{props.vote.votedFor?.map(x => props.ballot.names.find(y => y.id === x)?.name).join(", ")}</td>
    </tr>
  );
}

function ViewByVoter(props: {ballot: Ballot}) {
  let results = [];
  for (let id in props.ballot.submittedUsers) {
    results.push(
      <VoterItem
        key={id}
        ballot={props.ballot}
        vote={props.ballot.submittedUsers[id]}
      />
    );
  }
  return (
    <table>
      <thead>
      <tr>
        <th>Voter</th>
        <th>Vote Type</th>
        <th>Voted For</th>
      </tr>
      </thead>
      <tbody>{results}</tbody>
    </table>
  );
}

function CandidateItem(props: {name: string, voters: string[]}) {
  return (
    <tr>
      <td>
        {props.name} ({props.voters.length} voted)
      </td>
      <td>
        <ul>{props.voters.map((name) => (
          <li key={name}>{name}</li>
        ))}</ul>
      </td>
    </tr>
  );
}

function ViewByCandidate(props: {ballot: Ballot}) {
  const results = props.ballot.candidateResults.map(x => <CandidateItem name={x.name} voters={x.voters} />)

  return (
    <table>
      <tbody>{results}</tbody>
    </table>
  );
}

function QuickStats(props: { ballot: Ballot }) {
  return (
    <table>
      <tbody>
      <tr>
        <th>No. of valid voters:</th>
        <td>{props.ballot.numValidVoters}</td>
      </tr>
      <tr>
        <th>No. who sent in a vote:</th>
        <td>
          {props.ballot.numVotesInBallot} (
          {(
            (props.ballot.numVotesInBallot /
              props.ballot.numValidVoters) *
            100
          ).toFixed(2)}
          %)
        </td>
      </tr>
      <tr>
        <th>
          No. of abstain:<br />
            <span style={{fontSize: '12px', letterSpacing: '0', opacity: '0.4'}}>({props.ballot.numDidNotVote} did not vote, {props.ballot.numAbstain} voted abstain)</span>
        </th>
        <td>
          {props.ballot.numValidVoters -
            props.ballot.numNonAbstainVoters}{" "}
          (
          {(
            ((props.ballot.numValidVoters -
                props.ballot.numNonAbstainVoters) /
              props.ballot.numValidVoters) *
            100
          ).toFixed(2)}
          %)
        </td>
      </tr>
      <tr>
        <th>No. of non-abstain votes:</th>
        <td>
          {props.ballot.numNonAbstainVoters} (
          {(
            (props.ballot.numNonAbstainVoters /
              props.ballot.numValidVoters) *
            100
          ).toFixed(2)}
          %)
        </td>
      </tr>
      <tr>
        <th>No. of “no confidence” votes</th>
        <td>
          {props.ballot.numNoConfidence} (
          {(
            (props.ballot.numNoConfidence /
              props.ballot.numNonAbstainVoters) *
            100
          ).toFixed(2)}
          %)
        </td>
      </tr>
      </tbody>
    </table>
  );
}

class ResultsModal extends Component<{ballot: Ballot, hideModal: () => void}, {view: string}> {
  constructor(props: {ballot: Ballot, hideModal: () => void}) {
    super(props);
    this.state = {
      view: "candidate"
    };
  }

  switchView = (view: string) => {
    this.setState({view: view});
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
          <FontAwesomeIcon icon={faIdCard}/>
          &nbsp;&nbsp;View by Candidate
        </button>
      );
      view = <ViewByVoter ballot={this.props.ballot}/>;
    } else {
      switchViewBtn = (
        <button
          className="btn-secondary"
          onClick={() => this.switchView("voter")}
        >
          <FontAwesomeIcon icon={faVoteYea}/>
          &nbsp;&nbsp;View by Voter
        </button>
      );
      view = <ViewByCandidate ballot={this.props.ballot}/>;
    }

    return (
      <div className="modal">
        <div className="modal-body">
          <div className="close-btn" onClick={this.props.hideModal}>
            <FontAwesomeIcon icon={faTimes}/>
          </div>

          <h1>Results for {ballot.position}</h1>

          <QuickStats ballot={this.props.ballot} />
          {switchViewBtn}
          {view}
        </div>
      </div>
    );
  }
}

export default ResultsModal;
