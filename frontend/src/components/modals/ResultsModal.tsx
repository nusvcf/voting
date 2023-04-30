import React, {Component} from "react";
import "../../styles/Modal.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faIdCard, faTimes, faVoteYea} from "@fortawesome/free-solid-svg-icons";
import {Ballot, BallotVote} from "../admin/BallotsPage";
import {Voter} from "../admin/VotersPage";

const VoterItem = (props: { ballot: Ballot, vote: BallotVote, name: string }) => {
  let status = 'Normal';
  if (props.vote.abstain) {
    status = 'Abstain'
  } else if (props.vote.noConfidence) {
    status = 'No Confidence'
  }

  return (
    <tr>
      <td className="id">{props.name}</td>
      <td>
        <div
          className={
            "vote-status-" + status.replace(" ", "-").toLowerCase()
          }
        >
          {status}
        </div>
      </td>
      <td>{props.vote.votedFor?.map(x => props.ballot.names.find(y => y.id === x)?.name).join(", ")}</td>
    </tr>
  );
}

function ViewByVoter(props: { ballot: Ballot, lookup: (s: string) => string }) {
  return (
    <table>
      <thead>
      <tr>
        <th>Voter</th>
        <th>Vote Type</th>
        <th>Voted For</th>
      </tr>
      </thead>
      <tbody>{props.ballot.votes.map(x => <VoterItem
        key={x.id}
        name={props.lookup(x.voterId)}
        ballot={props.ballot}
        vote={x}
      />)}</tbody>
    </table>
  );
}

function CandidateItem(props: { name: string, voters: string[] }) {
  return (
    <tr>
      <td>
        {props.name} ({props.voters.length} voted)
      </td>
      <td>
        <ul>{props.voters.map((name) => (
          <li key={name} className='id'>{name}</li>
        ))}</ul>
      </td>
    </tr>
  );
}

function ViewByCandidate(props: { ballot: Ballot, lookup: (s: string) => string }) {
  return (
    <table>
      <tbody>{props.ballot.candidateResults.map(x => <CandidateItem key={x.name} name={(x.name)}
                                                                    voters={x.voters.map(x => props.lookup(x))}/>)}</tbody>
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
          No. of abstain:<br/>
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

interface ResultsModalProps {
  ballot: Ballot;
  hideModal: () => void;
  voters: Voter[]
}

class ResultsModal extends Component<ResultsModalProps, { view: string }> {
  constructor(props: ResultsModalProps) {
    super(props);
    this.state = {
      view: "candidate"
    };
  }

  lookup = (id: string) => {
    return this.props.voters.find(x => x.id === id)?.username || id;
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
      view = <ViewByVoter ballot={this.props.ballot} lookup={this.lookup}/>;
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
      view = <ViewByCandidate ballot={this.props.ballot} lookup={this.lookup}/>;
    }

    return (
      <div className="modal">
        <div className="modal-body">
          <div className="close-btn" onClick={this.props.hideModal}>
            <FontAwesomeIcon icon={faTimes}/>
          </div>

          <h1>Results for {ballot.position}</h1>

          <QuickStats ballot={this.props.ballot}/>
          {switchViewBtn}
          {view}
        </div>
      </div>
    );
  }
}

export default ResultsModal;
