import { format } from "date-fns";
import React, { Component } from "react";
import LoadingDiv from "./LoadingDiv";

interface Voter {
    id: string;
    username: string;
    password: string;
    last_seen?: string;
    invalidated?: string;
}

class VotersPage extends Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            fetchingData: true,
            addStart: 1,
            addEnd: 1,
            voters: []
        };

        this.fetchData();
    }

    fetchData = () => {
        fetch("/admin/voters")
            .then(data => data.json())
            .then((json: Voter[]) => {
                this.setState({ voters: json, fetchingData: false });
                const nextRange = parseInt(json[json.length-1].username) + 1;
                this.setState({
                    addStart: nextRange,
                    addEnd: nextRange,
                })
            })
            .catch(error => {
                console.error(error);
            });
    };

    updateAddStart = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ addStart: parseInt(e.target.value) });
    };
    updateAddEnd = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ addEnd: parseInt(e.target.value) });
    };

    addVoters = (e: React.MouseEvent<HTMLButtonElement>) => {
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

    invalidateVoter = (id: string) => {
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

    deleteVoter = (id: string) => {
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
        if (this.state.fetchingData) {
            return <LoadingDiv show={true} />
        }

        let rows = this.state.voters.map((voter: Voter, i: number) => {
            const invalidClass = voter.invalidated ? "invalid" : ""

            return (
              <tr key={i}>
                  <td className={invalidClass}>
                      {voter.username}
                  </td>
                  <td className={invalidClass}>
                      <span className="code">{voter.password}</span>
                  </td>
                  <td>
                      <div className="tbl-btns">
                      {!voter.invalidated && (
                        <button
                          className="btn-secondary"
                          onClick={() => this.invalidateVoter(voter.id)}
                        >
                            Invalidate
                        </button>
                      )}
                      {voter.invalidated && <span className='invalidated-on'>Invalidated on {format(new Date(voter.invalidated), 'd MMM y, HH:mm')}</span>}
                      <button
                        className="btn-warn"
                        onClick={() => this.deleteVoter(voter.id)}
                      >
                          Delete
                      </button>
                      </div>
                  </td>
              </tr>
            );
        });

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
                            <th>Username</th>
                            <th>Password</th>
                            <th>&nbsp;</th>
                        </tr>
                    </thead>
                    <tbody>{rows}</tbody>
                </table>
            </div>
        );
    }
}

export default VotersPage;
