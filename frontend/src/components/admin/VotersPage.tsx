import {format} from "date-fns";
import React, {useEffect, useState} from "react";
import LoadingDiv from "./LoadingDiv";
import {BACKEND_URL, getAuth} from "../../constants";

export interface Voter {
  id: string;
  username: string;
  password: string;
  lastSeen?: string;
  invalidated?: string;
}

const INVALIDATION_MESSAGE = "Are you sure you want to invalidate this user?\n\nThey will no longer be able to cast any more votes.";
const DELETE_MESSAGE = "Are you sure you want to DELETE this user?\n\nThis will remove the user, and remove all past votes cast by them.";

function VoterRow(props: { voter: Voter, fetchData: () => void }) {
  const invalidClass = props.voter.invalidated ? "invalid hide-on-print " : ""

  const invalidateVoter = () => {
    if (window.confirm(INVALIDATION_MESSAGE)) {
      fetch(BACKEND_URL + `/admin/voters/${props.voter.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "auth": getAuth()
        }
      }).then(props.fetchData);
    }
  };

  const deleteVoter = () => {
    if (window.confirm(DELETE_MESSAGE)) {
      fetch(BACKEND_URL + `/admin/voters/${props.voter.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "auth": getAuth()
        }
      }).then(props.fetchData);
    }
  };

  let timestampText: string;
  if (props.voter.invalidated) {
    timestampText = 'Invalidated on ' + format(new Date(props.voter.invalidated), "d MMM y, HH:mm")
  } else if (props.voter.lastSeen) {
    timestampText = 'Last seen on ' + format(new Date(props.voter.lastSeen), "d MMM y, HH:mm")
  } else {
    timestampText = 'Not yet logged in'
  }

  return <tr className={invalidClass}>
    <td className='to-strikethrough'>
      {props.voter.username}
    </td>
    <td className='to-strikethrough'>
      <span className="code">{props.voter.password}</span>
    </td>
    <td>
      <span
        className="invalidated-on hide-on-print">{timestampText}</span>
    </td>
    <td>
      <div className="tbl-btns hide-on-print">
        {!props.voter.invalidated && (
          <button
            className="btn-secondary"
            onClick={invalidateVoter}
          >
            Invalidate
          </button>
        )}
        <button
          className="btn-warn"
          onClick={deleteVoter}
        >
          Delete
        </button>
      </div>
    </td>
  </tr>;
}

const VotersPage = (props: { clearState: () => void }) => {
  const [fetchingData, setFetchingData] = useState(true);
  const [addStart, setAddStart] = useState(1);
  const [addEnd, setAddEnd] = useState(1);
  const [voters, setVoters] = useState<Voter[]>([]);

  const fetchData = () => {
    return fetch(BACKEND_URL + "/admin/voters", {
      headers: {
        "auth": getAuth()
      }
    })
      .then(data => data.json())
      .then((receivedVoters: Voter[]) => {
        setFetchingData(false)
        setVoters(receivedVoters)
        return receivedVoters
      })
      .catch(() => {
        props.clearState();
        return [];
      });
  };


  const updateAddStart = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddStart(parseInt(e.target.value))
  };

  const updateAddEnd = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddEnd(parseInt(e.target.value))
  };

  const addVoters = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // Do a fetch
    fetch(BACKEND_URL + "/admin/voters", {
      method: "POST",
      headers: {
        'auth': getAuth(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        start: addStart,
        end: addEnd
      })
    }).then(fetchData).then(updateStartEndIDs);

  };

  const updateStartEndIDs = (receivedVoters: Voter[]) => {
    if (receivedVoters.length > 0) {
      const nextRange = parseInt(receivedVoters[receivedVoters.length - 1].username) + 1;
      setAddStart(nextRange);
      setAddEnd(nextRange);
    }
  }

  useEffect(() => {
    fetchData().then(updateStartEndIDs);
    const interval = setInterval(fetchData, 1000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (fetchingData) return <LoadingDiv show={true}/>;

  return (
    <div id="voters-page">
      <div className="input-group input-group-row hide-on-print">
        <input
          type="number"
          value={addStart}
          onChange={updateAddStart}
        />
        <input
          type="number"
          value={addEnd}
          onChange={updateAddEnd}
        />
        <button onClick={addVoters}>
          +&nbsp;&nbsp;Add Voters
        </button>
      </div>
      <table id='voters-table'>
        <thead>
        <tr>
          <th>Username</th>
          <th>Password</th>
          <th><span className='hide-on-print'>Last Seen</span></th>
          <th>&nbsp;</th>
        </tr>
        </thead>
        <tbody>{voters.map((voter: Voter) =>
          <VoterRow key={voter.id} voter={voter} fetchData={fetchData}/>)}</tbody>
      </table>
    </div>
  )
}

export default VotersPage;
