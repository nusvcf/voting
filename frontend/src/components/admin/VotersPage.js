import React, { Component } from "react";
import LoadingDiv from "./LoadingDiv";

class VotersPage extends Component {
    constructor() {
        super();
        this.state = {
            fetchingData: true,
            addStart: 0,
            addEnd: 0,
            voters: []
        };

        this.fetchData();
    }

    fetchData = () => {
        fetch("/admin/voters")
            .then(data => {
                return data.json();
            })
            .then(json => {
                this.setState({ voters: json, fetchingData: false });
            })
            .catch(error => {
                console.error(error);
            });
    };

    updateAddStart = e => {
        this.setState({ addStart: parseInt(e.target.value) });
    };
    updateAddEnd = e => {
        this.setState({ addEnd: parseInt(e.target.value) });
    };

    addVoters = e => {
        e.preventDefault();
        // Do a fetch
        fetch("/admin/voters", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                start: this.state.addStart,
                end: this.state.addEnd
            })
        }).then(() => {
            this.fetchData();
        });
        this.setState({
            addStart: this.state.addEnd + 1,
            addEnd: this.state.addEnd + 1
        });
    };

    invalidateVoter = id => {
        if (
            window.confirm(
                "Are you sure you want to invalidate this user?\n\nThey will no longer be able to cast any more votes."
            )
        ) {
            fetch("/admin/voters/" + id, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(() => {
                this.fetchData();
            });
        }
    };

    deleteVoter = id => {
        if (
            window.confirm(
                "Are you sure you want to DELETE this user?\n\nThis will remove the user, and remove all past votes cast by them."
            )
        ) {
            fetch("/admin/voters/" + id, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(() => {
                this.fetchData();
            });
        }
    };

    render() {
        let rows = this.state.voters.map((voter, i) => (
            <tr key={i}>
                <td className={"id " + (voter.isValid ? "" : "invalid")}>
                    {voter.id}
                </td>
                <td className={voter.isValid ? "" : "invalid"}>
                    {voter.username}
                </td>
                <td className={voter.isValid ? "" : "invalid"}>
                    {voter.password}
                </td>
                <td className="tbl-btns">
                    {voter.isValid && (
                        <button
                            className="btn-secondary"
                            onClick={() => this.invalidateVoter(voter.id)}
                        >
                            Invalidate
                        </button>
                    )}
                    <button
                        className="btn-warn"
                        onClick={() => this.deleteVoter(voter.id)}
                    >
                        Delete
                    </button>
                </td>
            </tr>
        ));

        return (
            <div id="voters-page">
                <div className="input-group input-group-row">
                    <input
                        type="number"
                        value={this.state.addStart}
                        onChange={this.updateAddStart}
                    />
                    <input
                        type="number"
                        value={this.state.addEnd}
                        onChange={this.updateAddEnd}
                    />
                    <button onClick={this.addVoters}>
                        +&nbsp;&nbsp;Add Voters
                    </button>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Password</th>
                            <th>&nbsp;</th>
                        </tr>
                    </thead>
                    <tbody>{rows}</tbody>
                </table>
				<LoadingDiv show={this.state.fetchingData} />
            </div>
        );
    }
}

export default VotersPage;
