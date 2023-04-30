import React, {Component} from 'react';
import '../../styles/Modal.scss';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faTimes} from '@fortawesome/free-solid-svg-icons'
import {BACKEND_URL, getAuth} from "../../constants";

class NameItem extends Component<{ removeName: () => void, name: string }> {
  render() {
    return <div className='name-item'>
      <span onClick={this.props.removeName} className='icon'><FontAwesomeIcon icon={faTimes}/></span>
      <span className='name'>{this.props.name}</span>
    </div>
  }
}

interface BallotModalProps {
  show: boolean;
  hideModal: () => void;
  onSubmit: () => void;
}

interface BallotModalState {
  position: string;
  maxVotes: number;
  names: string[];
  currentName: string;
}

class BallotModal extends Component<BallotModalProps, BallotModalState> {
  constructor(props: BallotModalProps) {
    super(props);
    this.state = {
      position: '',
      maxVotes: 1,
      names: [],
      currentName: '',
    };
  }

  updatePosition = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({position: e.target.value});
  }

  updateMaxVotes = (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({maxVotes: parseInt(e.target.value)});
  }

  updateCurrentName = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({currentName: e.target.value});
  }

  removeName = (i: number) => {
    let names = this.state.names;
    names.splice(i, 1);
    this.setState({names: names});
  }

  addName = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (this.state.currentName.length === 0) return;
    if (this.state.names.includes(this.state.currentName)) return;
    let names = this.state.names;
    names.push(this.state.currentName)
    this.setState({names: names, currentName: ''});
  }

  handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let payload = {
      position: this.state.position,
      maxVotes: this.state.maxVotes,
      names: this.state.names
    }

    fetch(BACKEND_URL + '/admin/ballots', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "auth": getAuth()
      },
      body: JSON.stringify(payload)
    })

    this.setState({position: '', maxVotes: 1, names: [], currentName: ''})
    this.props.hideModal();
    this.props.onSubmit();
  }

  render() {
    if (this.props.show) {
      let names = this.state.names.map((name, i) => <NameItem key={i} name={name}
                                                              removeName={() => this.removeName(i)}/>)
      return (
        <div className="modal">
          <div className="modal-body">
            <div className="close-btn" onClick={this.props.hideModal}>
              <FontAwesomeIcon icon={faTimes}/>
            </div>

            <h1>Create Ballot</h1>

            <form onSubmit={this.handleSubmit}>
              <div className="input-group">
                <label htmlFor="">Position</label>
                <input type="text" value={this.state.position} onChange={this.updatePosition}/>
              </div>
              <div className="input-group">
                <label htmlFor="">Max Votes</label>
                <select value={this.state.maxVotes} onChange={this.updateMaxVotes}>
                  <option>1</option>
                  <option>2</option>
                </select>
              </div>
              <div className="input-group">
                <label>Names</label>
                {names}
                <div className='input-group input-group-row'>
                  <input type="text" value={this.state.currentName} onChange={this.updateCurrentName}/>
                  <button className='btn-secondary' onClick={this.addName}>Add</button>
                </div>
              </div>
              <input type="submit" value="Create Ballot"/>
            </form>

          </div>
        </div>
      );
    } else {
      return <div/>;
    }
  }
}

export default BallotModal;
