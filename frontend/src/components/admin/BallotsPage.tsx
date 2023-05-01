import React, { Component } from "react";
import BallotModal from "../modals/BallotModal";
import ResultsModal from "../modals/ResultsModal";
import LoadingDiv from "./LoadingDiv";
import { BACKEND_URL, getAuth } from "../../constants";
import { Voter } from "./VotersPage";

export interface BallotVote {
  id: string;
  voterId: string;
  abstain: boolean;
  noConfidence: boolean;
  votedFor?: string[];
}

export class Ballot {
  constructor(
    public id: string,
    public position: string,
    public maxVotes: number,
    public numValidVoters: number,
    private created: string,
    private closed: string | null,
    private invalidated: string | null,
    public names: BallotName[],
    public votes: BallotVote[]
  ) {}

  get isOpen() {
    return this.closed === null;
  }

  get isValid() {
    return this.invalidated === null;
  }

  get percentageVotes() {
    return (100 * this.votes.length) / this.numValidVoters;
  }

  get numVotesInBallot() {
    return this.votes.length;
  }

  get numDidNotVote() {
    return this.numValidVoters - this.numVotesInBallot;
  }

  get numAbstain() {
    return this.votes.filter((x) => x.abstain).length;
  }

  get numNoConfidence() {
    return this.votes.filter((x) => x.noConfidence).length;
  }

  get numNonAbstainVoters() {
    return this.numVotesInBallot - this.numAbstain;
  }

  get candidateResults(): CandidateResult[] {
    return this.names.map((x) => {
      const voters = this.votes
        .filter((v) => v.votedFor?.includes(x.id))
        .map((x) => x.voterId);
      const numVotes = voters.length;
      const denom = this.numNonAbstainVoters;
      const percentageVotes = denom === 0 ? 0 : (100 * numVotes) / denom;
      return { name: x.name, voters, percentageVotes };
    });
  }
}

export interface CandidateResult {
  name: string;
  voters: string[];
  percentageVotes: number;
}

export interface BallotName {
  id: string;
  name: string;
}

class BallotRow extends Component<
  {
    firstOngoing: boolean;
    ballot: Ballot;
    fetchData: () => void;
    voters: Voter[];
  },
  { showModal: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = {
      showModal: false,
    };
  }

  closeBallot = () => {
    if (window.confirm("Are you sure you want to close the ballot?")) {
      fetch(BACKEND_URL + "/admin/ballots/" + this.props.ballot.id, {
        method: "POST",
        headers: { auth: getAuth() },
      }).then(this.props.fetchData);
    }
  };

  invalidateBallot = () => {
    if (window.confirm("Are you sure you want to invalidate the ballot?")) {
      fetch(BACKEND_URL + "/admin/ballots/" + this.props.ballot.id, {
        method: "PUT",
        headers: { auth: getAuth() },
      }).then(this.props.fetchData);
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
    let btns: any[];
    let status: string;

    if (ballot.isOpen) {
      status = this.props.firstOngoing ? "Ongoing" : "Pending";
      btns = [
        <button
          key={"res"}
          onClick={this.showResults}
          className="btn-secondary"
        >
          Results
        </button>,
        <button key={"close"} onClick={this.closeBallot}>
          Close Ballot
        </button>,
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
          </button>,
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
          </button>,
        ];
      }
    }

    let names = ballot.candidateResults.map(
      (item: CandidateResult, i: number) => (
        <li key={i}>
          {item.name}{" "}
          <span className="percent-voted">
            ({item.percentageVotes.toFixed(2)}%)
          </span>
        </li>
      )
    );

    return (
      <tr>
        <td
          className={ballot.isValid ? "" : "invalid"}
          style={{ fontWeight: "bold" }}
        >
          {ballot.position}
        </td>
        <td className={ballot.isValid ? "" : "invalid"}>
          <ul>{names}</ul>
        </td>
        <td className={ballot.isValid ? "" : "invalid"}>{ballot.maxVotes}</td>
        <td>
          <span className={"status-" + status.toLowerCase()}>{status}</span>
          <br />
          <div className="percent-voted">
            {ballot.percentageVotes.toFixed(2)}% voted
            <br />
            {ballot.numValidVoters} valid voters, {ballot.numVotesInBallot}{" "}
            votes cast, of which {ballot.numNonAbstainVoters} non-abstain voters
          </div>
        </td>
        <td>
          <div className="tbl-btns">{btns}</div>
        </td>
        {this.state.showModal && (
          <ResultsModal
            hideModal={this.hideResults}
            ballot={ballot}
            voters={this.props.voters}
          />
        )}
      </tr>
    );
  }
}

class BallotsPage extends Component<
  { clearState: () => void },
  {
    showModal: boolean;
    ballots: Ballot[] | null;
    voters: Voter[] | null;
  }
> {
  interval: NodeJS.Timer | null = null;

  constructor(props: any) {
    super(props);
    this.state = {
      showModal: false,
      ballots: null,
      voters: null,
    };

    this.fetchData();
    this.interval = setInterval(this.fetchData, 500);

    fetch(BACKEND_URL + "/admin/voters", {
      headers: {
        auth: getAuth(),
      },
    })
      .then((data) => data.json())
      .then((receivedVoters: Voter[]) => {
        this.setState({ voters: receivedVoters });
      });
  }

  componentWillUnmount() {
    // @ts-ignore
    clearInterval(this.interval);
  }

  fetchData = () => {
    fetch(BACKEND_URL + "/admin/ballots", {
      headers: { auth: getAuth() },
    })
      .then((data) => data.json())
      .then((json: any[]) => {
        this.setState({
          ballots: json.map(
            (x) =>
              new Ballot(
                x.id,
                x.position,
                x.maxVotes,
                x.numValidVoters,
                x.created,
                x.closed,
                x.invalidated,
                x.names,
                x.votes
              )
          ),
        });
      })
      .catch(() => {
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
    if (this.state.voters === null || this.state.ballots === null) {
      return <LoadingDiv show={true} />;
    }

    let firstOngoingIdx = this.state.ballots.find((x) => x.isOpen)?.id;

    let rows = this.state.ballots.map((ballot: Ballot) => {
      return (
        <BallotRow
          key={ballot.id}
          voters={this.state.voters || []}
          ballot={ballot}
          fetchData={this.fetchData}
          firstOngoing={ballot.id === firstOngoingIdx}
        />
      );
    });

    return (
      <div id="ballots-page">
        <button onClick={this.showModal}>+&nbsp;&nbsp;Create Ballot</button>
        <table>
          <thead>
            <tr>
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
