import React, {Component} from 'react';

class VotersPage extends Component {

    constructor() {
        super();
        this.state = {
            voters: [{ 'id': '0043', 'password': '473bjh384' },
            { 'id': '0044', 'password': 'b9348373' }]
        }
    }

    render() {
        let rows = this.state.voters.map((voter, i) => <tr key={i}>
            <td>{voter.id}</td>
            <td>{voter.password}</td>
            <td className='tbl-btns'>
                <button className='btn-secondary'>Invalidate</button>
                <button className='btn-warn'>Delete</button>
            </td>
        </tr>)

        return <div id='voters-page'>
            <button>+&nbsp;&nbsp;Add Voters</button>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Password</th>
                        <th>&nbsp;</th>
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </table>
        </div>
    }
}

export default VotersPage;