import React, { useEffect, useState} from "react";
import logo from "../imgs/logo-small.png";
import {BallotName} from "./admin/BallotsPage";
import {BACKEND_URL} from "../constants";

const WelcomeText = () => (
  <div className="waiting-text">
    <h1>Welcome to VCF AGM 2023!</h1>
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

const NO_CONF_TEXT = "I have no confidence in any of these candidates.";
const ABSTAIN_TEXT = "I wish to abstain from this round of voting.";

function VotingOption(props: {
  id: string,
  text: string,
  maxVotes: number,
  selected: boolean,
  updateVote: () => void
}) {
  let inputType = "checkbox";
  if (props.text === NO_CONF_TEXT || props.text === ABSTAIN_TEXT || props.maxVotes === 1) {
    inputType = "radio";
  }

  return (
    <div className="option">
      <input
        type={inputType}
        id={props.id}
        onChange={ props.updateVote}
        checked={props.selected}
      />
      <label id={props.id + "-label"} htmlFor={props.id}>
        {props.text}
      </label>
    </div>
  );
}

function VotingPage(props: {
  ballot: UserBallot,
  setError: (s: string) => void,
  fetchData: () => void,
  clearState: () => void,
  sendVote: (s: VoteCast) => void
}) {
  const [selected, setSelected] = useState<VoteCast>({abstain: false, noConfidence: false, votedFor: []});

  const selectAbstain = () => {
    setSelected({
      abstain: true,
      noConfidence: false,
      votedFor: []
    })
  }

  const selectNoConfidence = () => {
    setSelected({
      abstain: false,
      noConfidence: true,
      votedFor: []
    })
  }

  const selectName = (nameId: string) => {
    let nameIds: string[] = [] // TODO

    // 1. maxVotes == 1, and nameId is in list: do nothing
    // 2. maxVotes == 2, and nameId is not in list: set to this name id
    // 3. maxVotes > 1, and nameId is in list: remove
    // 4. maxVotes > 1, and nameId is not in list: ???

    if (props.ballot.maxVotes === 1) {
      nameIds = [nameId];
    } else {
      if (selected.votedFor.includes(nameId)) {
        nameIds = [...selected.votedFor]
        nameIds.splice(nameIds.indexOf(nameId), 1)
      } else {
        nameIds = [...selected.votedFor, nameId]
      }
    }

    setSelected({
      abstain: false,
      noConfidence: false,
      votedFor: nameIds
    })
  }

  let options = props.ballot.names.map(name => (
    <VotingOption
      key={name.id}
      id={name.id}
      text={name.name}
      updateVote={() => selectName(name.id)}
      selected={selected.votedFor.includes(name.id)}
      maxVotes={props.ballot.maxVotes}
    />
  ));
  return (
    <div id="voting-page">
      <div id="currently-voting-for">
        Currently voting for: <div id="position">{props.ballot.position}</div>
      </div>
      {props.ballot.maxVotes > 1 && (
        <div>
          You can select up to <b>{props.ballot.maxVotes}</b> names.
        </div>
      )}
      {props.ballot.maxVotes === 1 && (
        <div>
          You can only select <b>1</b> name.
        </div>
      )}
      <div id="options">
        {options}
        <VotingOption
            key="no-conf"
            id="no-conf"
            text={NO_CONF_TEXT}
            updateVote={selectNoConfidence}
            selected={selected.noConfidence}
            maxVotes={props.ballot.maxVotes}
        />
        <VotingOption
            key="abstain"
            id="abstain"
            text={ABSTAIN_TEXT}
            updateVote={selectAbstain}
            selected={selected.abstain}
            maxVotes={props.ballot.maxVotes}
        />
      </div>
      <button onClick={() => props.sendVote(selected)} disabled={selected.votedFor.length > props.ballot.maxVotes}>Send Vote</button>
    </div>
  );
}

enum Status {
  Welcome,
  Voting,
  Waiting
}

interface UserBallot {
  id :string
  position: string
  maxVotes: number
  names: BallotName[]
}

interface VoteCast {
  abstain: boolean;
  noConfidence: boolean;
  votedFor: string[];
}

const UserDashboard = (props: {clearState: () => void, setError: (s: string) => void}) => {
  const [status, setStatus] = useState(Status.Welcome);
  const [ballot, setBallot] = useState<UserBallot | null>(null);

  useEffect(() => {
    fetchData();
  }, [])

  const fetchData = () => {
    fetch(BACKEND_URL + "/user/ballot")
      .then(data => data.json())
      .then((data: UserBallot) => {
        if (data.position !== '') {
          setBallot(data);
          setStatus(Status.Voting);
        } else if (status !== Status.Welcome) {
          setStatus(Status.Waiting)
        }

        setTimeout(fetchData, 1000)
      })
      .catch(error => {
        console.log(error)
        props.clearState();
      });
  };

  const sendVote = (selected: VoteCast) => {
    if (ballot === null) return;
    if (!selected.abstain && !selected.noConfidence && selected.votedFor.length === 0) {
      props.setError("Please select an option.");
      return;
    }

    if (selected.votedFor.length > ballot.maxVotes) {
      props.setError("You have selected too many names.");
      return;
    }

    fetch(BACKEND_URL + "/user/ballot/" + ballot.id, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(selected)
    })
        .then(() => {
            setStatus(Status.Waiting);
            setBallot(null);
        })
        .catch(error => {
          props.clearState();
          props.setError(
              "There was a problem casting your vote. Please log in and try again. "
          );
        });
  };

    return (
      <div id="user">
        <img src={logo} className="logo" alt="logo"/>
        {status === Status.Welcome && <WelcomeText/>}
        {status === Status.Waiting && <WaitingText/>}
        {status === Status.Voting && ballot !== null && (
          <VotingPage
            ballot={ballot}
            fetchData={fetchData}
            clearState={props.clearState}
            sendVote={sendVote}
            setError={props.setError}
          />
        )}
      </div>
    );
}

export default UserDashboard;
