import React, {Component} from "react";
import BallotModal from "../modals/BallotModal";
import ResultsModal from "../modals/ResultsModal";
import LoadingDiv from "./LoadingDiv";

export interface BallotVote {
  id: string,
  status: string,
  votedFor: string[]
}

export class Ballot {
  constructor(public id: string, public position: string, public maxVotes: number, private created: string, private closed: string | null, private invalidated: string | null, private names: string[], private votes: BallotVote[]) {

  }

  get isOpen() {
    return this.closed === null;
  }

  get isValid() {
    return this.invalidated === null;
  }

  get percentageVotes() {
    return 1;
  }

  get numValidVoters() {
    return 1;
  }

  get numVotesInBallot() {
    return 1;
  }

  get numNonAbstainVoters() {
    return 1;
  }

  get numNoConfidence() {
    return 1;
  }

  get namesWithPercentageVotes(): BallotNamePercentage[] {
    return this.names.map(x => {
      return {name: x, percentageVotes: 0}
    });
  }

  get submittedUsers(): {[userId: string]: BallotVote} {
    return {}
  }


}

// export interface Ballot {
//   id: string
//   isOpen: boolean
//   isValid: boolean
//   position: string
//   maxVotes: number
//   percentageVotes: number
//   numValidVoters: number
//   numVotesInBallot: number
//   numNonAbstainVoters: number
//   numNoConfidence: number
//   names: BallotName[]
//   namesInBallot: { [name: string]: { count: number, voters: string[] } }
//   submittedUsers: { [id: string]: BallotVote }
// }

export interface BallotNamePercentage {
  name: string;
  percentageVotes: number;
}

export interface BallotName {
  id: string;
  name: string
}

class BallotRow extends Component<{ ballot: Ballot, fetchData: () => void }, any> {
  constructor(props: any) {
    super(props);
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
    this.setState({showModal: true});
  };

  hideResults = () => {
    this.setState({showModal: false});
  };

  render() {
    let ballot = this.props.ballot;
    let btns = [];
    let status = "";

    if (ballot.isOpen) {
      status = "Ongoing";
      btns = [
        <button key={"res"} onClick={this.showResults} className='btn-secondary'>
          Results
        </button>,
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

    let names = ballot.namesWithPercentageVotes.map((item: BallotNamePercentage, i: number) => (
      <li key={i}>
        {item.name}{" "}
        <span className="percent-voted">
                    ({item.percentageVotes.toFixed(2)}%)
                </span>
      </li>
    ));

    return (
      <tr>
        <td
          className={ballot.isValid ? "" : "invalid"}
          style={{fontWeight: "bold"}}
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
          <br/>
          <div className="percent-voted">
            {ballot.percentageVotes.toFixed(2)}% voted
            <br/>
            {ballot.numValidVoters} valid voters,{" "}
            {ballot.numVotesInBallot} votes cast, of which{" "}
            {ballot.numNonAbstainVoters} non-abstain voters
          </div>
        </td>
        <td className="tbl-btns">{btns}</td>
        {this.state.showModal && (
          <ResultsModal
            hideModal={this.hideResults}
            ballot={ballot}
          />
        )}
      </tr>
    );
  }
}

class BallotsPage extends Component<any, any> {
  interval: NodeJS.Timer | null = null;

  constructor(props: any) {
    super(props);
    this.state = {
      fetchingData: true,
      showModal: false,
      ballots: []
    };

    this.fetchData();
    this.interval = setInterval(this.fetchData, 800);
  }

  componentWillUnmount() {
    // @ts-ignore
    clearInterval(this.interval);
  }

  fetchData = () => {
    fetch("/admin/ballots")
      .then(data => data.json())
      .then((json: any[]) => {
        this.setState({ballots: json.map(x => new Ballot(x.id, x.position, x.maxVotes, x.created, x.closed, x.invalidated, x.names, x.votes)), fetchingData: false});
      })
      .catch(error => {
        this.props.clearState();
      });
  };

  showModal = () => {
    this.setState({showModal: true});
  };

  hideModal = () => {
    this.setState({showModal: false});
  };

  render() {
    let rows = this.state.ballots.map((ballot: Ballot) => (
      <BallotRow
        key={ballot.id}
        ballot={ballot}
        fetchData={this.fetchData}
      />
    ));

    return (
      <div id="ballots-page">
        <button onClick={this.showModal}>
          +&nbsp;&nbsp;Create Ballot
        </button>
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
        <LoadingDiv show={this.state.fetchingData}/>
      </div>
    );
  }
}

export default BallotsPage;
