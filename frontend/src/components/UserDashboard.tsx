import React, {Component, useEffect, useState} from "react";
import logo from "../imgs/logo-small.png";

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

const NO_CONF_TEST = "I have no confidence in any of these candidates.";
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
  if (props.text === NO_CONF_TEST) {
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
  position: string,
  names: string[],
  maxVotes: number,
  selected: { [key: string]: boolean },
  updateVote: (s: string, e: any) => void,
  sendVote: () => void
}) {
  let options = props.names.map(name => (
    <VotingOption
      key={name}
      id={name.replace(" ", "-")}
      text={name}
      updateVote={props.updateVote}
      selected={props.selected}
      maxVotes={props.maxVotes}
    />
  ));
  options.push(
    <VotingOption
      key="no-conf"
      id="no-conf"
      text={NO_CONF_TEST}
      updateVote={props.updateVote}
      selected={props.selected}
      maxVotes={props.maxVotes}
    />
  );
  options.push(
    <VotingOption
      key="abstain"
      id="abstain"
      text={ABSTAIN_TEXT}
      updateVote={props.updateVote}
      selected={props.selected}
      maxVotes={props.maxVotes}
    />
  );
  return (
    <div id="voting-page">
      <div id="currently-voting-for">
        Currently voting for:{" "}
        <div id="position">{props.position}</div>
      </div>
      {props.maxVotes > 1 && (
        <div>
          You can select up to <b>2</b> names.
        </div>
      )}
      {props.maxVotes === 1 && (
        <div>
          You can only select <b>1</b> name.
        </div>
      )}
      <div id="options">{options}</div>
      <button onClick={props.sendVote}>Send Vote</button>
    </div>
  );
}

const UserDashboard = (props: {}) => {
  const [status, setStatus] = useState('welcome');
  const [id, setId] = useState('');
  const [position, setPosition] = useState('');
  const [names, setNames] = useState<string[]>([]);
  const [maxVotes, setMaxVotes] = useState(1);

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
      .then(data => {
        if (data.id !== "") {
          let selected: {[k: string]: boolean} = {
            "Abstain": false,
            "No Confidence": false
          };
          for (let i = 0; i < data.names.length; i++) {
            selected[data.names[i]] = false;
          }

          setStatus('voting')
          setId(data.id)
          setPosition(data.position);
          setNames(data.names);
          setMaxVotes(data.maxVotes);

          this.setState({
            status: "voting",
            id: data.id,
            position: data.position,
            names: data.names,
            maxVotes: data.maxVotes
          });
        } else {
          if (status !== "welcome") {
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
    let selected = selected;
    if (e.target.checked && name === NO_CONF_TEST) {
      selected["No Confidence"] = true;
      selected["Abstain"] = false;
      for (let i = 0; i < names.length; i++) {
        selected[names[i]] = !e.target.checked;
      }
    } else if (e.target.checked && name === ABSTAIN_TEXT) {
      selected["No Confidence"] = false;
      selected["Abstain"] = true;
      for (let i = 0; i < names.length; i++) {
        selected[names[i]] = !e.target.checked;
      }
    } else {
      if (e.target.checked) {
        selected["No Confidence"] = false;
        selected["Abstain"] = false;
        if (maxVotes === 1) {
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
    this.setState({selected: selected});
  };

  sendVote = () => {
    // Perform fetch
    let names = [];
    for (let key in selected) {
      if (selected[key]) {
        names.push(key);
      }
    }
    if (names.length === 0) {
      this.props.setError("Please select an option.");
      return;
    }
    if (names.length > maxVotes) {
      this.props.setError("You have selected too many names.");
      return;
    }
    fetch("/user/ballot/" + id, {
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

    return (
      <div id="user">
        <img src={logo} className="logo" alt="logo"/>
        {status === "welcome" && <WelcomeText/>}
        {status === "waiting" && <WaitingText/>}
        {status === "voting" && (
          <VotingPage
            position={position}
            names={names}
            maxVotes={maxVotes}
            selected={selected}
            updateVote={this.updateVote}
            sendVote={this.sendVote}
          />
        )}
      </div>
    );
}

export default UserDashboard;
