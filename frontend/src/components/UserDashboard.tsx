import React, { useEffect, useState} from "react";
import logo from "../imgs/logo-small.png";
import {BallotName} from "./admin/BallotsPage";

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
  selected: { [key: string]: boolean },
  updateVote: (s: string, e: any) => void
}) {
  let key = props.text;
  let inputType = "checkbox";
  if (props.text === NO_CONF_TEXT) {
    key = "No Confidence";
    inputType = "radio";
  } else if (props.text === ABSTAIN_TEXT) {
    key = "Abstain";
    inputType = "radio";
  } else if (props.maxVotes === 1) {
    inputType = "radio";
  }
  let selected = props.selected[key];
  return (
    <div className="option">
      <input
        type={inputType}
        id={props.id}
        onChange={e => props.updateVote(props.text, e)}
        checked={selected}
      />
      <label id={props.id + "-label"} htmlFor={props.id}>
        {props.text}
      </label>
    </div>
  );
}

function VotingPage(props: {
  ballot: UserBallot,
  selected: { [key: string]: boolean },
  updateVote: (s: string, e: any) => void,
  sendVote: () => void
}) {
  let options = props.ballot.names.map(name => (
    <VotingOption
      key={name.id}
      id={name.id}
      text={name.name}
      updateVote={props.updateVote}
      selected={props.selected}
      maxVotes={props.ballot.maxVotes}
    />
  ));
  options.push(
    <VotingOption
      key="no-conf"
      id="no-conf"
      text={NO_CONF_TEXT}
      updateVote={props.updateVote}
      selected={props.selected}
      maxVotes={props.ballot.maxVotes}
    />
  );
  options.push(
    <VotingOption
      key="abstain"
      id="abstain"
      text={ABSTAIN_TEXT}
      updateVote={props.updateVote}
      selected={props.selected}
      maxVotes={props.ballot.maxVotes}
    />
  );
  return (
    <div id="voting-page">
      <div id="currently-voting-for">
        Currently voting for:{" "}
        <div id="position">{props.ballot.position}</div>
      </div>
      {props.ballot.maxVotes > 1 && (
        <div>
          You can select up to <b>2</b> names.
        </div>
      )}
      {props.ballot.maxVotes === 1 && (
        <div>
          You can only select <b>1</b> name.
        </div>
      )}
      <div id="options">{options}</div>
      <button onClick={props.sendVote}>Send Vote</button>
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

const UserDashboard = (props: {clearState: () => void, setError: (s: string) => void}) => {
  const [status, setStatus] = useState(Status.Welcome);
  const [ballot, setBallot] = useState<UserBallot | null>(null);
  const [selected, setSelected] = useState<{[k: string]: boolean}>({});

  useEffect(() => {
    fetchData();
  }, [])

  // interval = null;
  //
  // constructor() {
  //   super();
  //   this.state = {
  //     status: "welcome",
  //     id: "",
  //     position: "",
  //     names: [],
  //     selected: {},
  //     maxVotes: 1
  //   };
  //
  //   this.fetchData();
  //   this.interval = setInterval(this.fetchData, 2000);
  // }
  //
  // componentWillUnmount() {
  //   clearInterval(this.interval);
  // }

  const fetchData = () => {
    fetch("/user/ballot")
      .then(data => data.json())
      .then((data: UserBallot) => {
        if (data.position !== '') {
          let newSelected: {[k: string]: boolean} = {
            "Abstain": false,
            "No Confidence": false
          };
          for (let i = 0; i < data.names.length; i++) {
            newSelected[data.names[i].id] = false;
          }

          setSelected(newSelected)
          setBallot(data);
          setStatus(Status.Voting);
        } else if (status !== Status.Welcome) {
          setStatus(Status.Waiting)
        }
      })
      .catch(error => {
        props.clearState();
      });
  };

  const updateVote = (selectValue: string, e: any) => {
    // if (e.target.checked && selectValue === NO_CONF_TEXT) {
    //   selected["No Confidence"] = true;
    //   selected["Abstain"] = false;
    //   for (let i = 0; i < names.length; i++) {
    //     selected[names[i]] = !e.target.checked;
    //   }
    // } else if (e.target.checked && selectValue === ABSTAIN_TEXT) {
    //   selected["No Confidence"] = false;
    //   selected["Abstain"] = true;
    //   for (let i = 0; i < names.length; i++) {
    //     selected[names[i]] = !e.target.checked;
    //   }
    // } else {
    //   if (e.target.checked) {
    //     selected["No Confidence"] = false;
    //     selected["Abstain"] = false;
    //     if (maxVotes === 1) {
    //       // Deselect all other votes
    //       for (let key in selected) {
    //         if (key !== selectValue) {
    //           selected[key] = false;
    //         }
    //       }
    //     }
    //   }
    //   selected[selectValue] = e.target.checked;
    // }
    // this.setState({selected: selected});
  };

  const sendVote = () => {
    if (ballot === null) return;

    // Perform fetch
    let names = [];
    for (let key in selected) {
      if (selected[key]) {
        names.push(key);
      }
    }
    if (names.length === 0) {
      props.setError("Please select an option.");
      return;
    }
    if (names.length > ballot.maxVotes) {
      props.setError("You have selected too many names.");
      return;
    }
    fetch("/user/ballot/" + ballot.id, {
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
          setStatus(Status.Waiting);
          setBallot(null);
        } else {
          props.setError(
            "There was a problem casting your vote. Please try again later. "
          );
        }
      })
      .catch(error => {
        props.clearState();
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
            selected={selected}
            updateVote={updateVote}
            sendVote={sendVote}
          />
        )}
      </div>
    );
}

export default UserDashboard;
