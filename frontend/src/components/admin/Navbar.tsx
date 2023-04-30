import React from 'react';
import logo from '../../imgs/logo-small.png';
import {Page} from "../AdminDashboard";

const NavbarItem = (props: { currentPage: Page, pageName: Page, setPage: (p: Page) => void, children: string }) => {
  let className = 'navbar-link';
  if (props.currentPage === props.pageName) {
    className += ' navbar-link-active';
  }
  return <div className={className} onClick={() => props.setPage(props.pageName)}>{props.children}</div>
};

const Navbar = (props: { currentPage: Page, setPage: (p: Page) => void, clearState: () => void }) => <div id='navbar' className='hide-on-print'>
  <img src={logo} className='logo' alt='logo'/>
  <NavbarItem pageName={Page.Voters} currentPage={props.currentPage} setPage={props.setPage}>Voters</NavbarItem>
  <NavbarItem pageName={Page.Ballots} currentPage={props.currentPage} setPage={props.setPage}>Ballots</NavbarItem>
  <div style={{flex: 1}} />
  <div className='navbar-link' onClick={() => {
    document.cookie = 'auth=xxx; Max-Age=-99999999';
    props.clearState()
  }}>Logout</div>
</div>;

export default Navbar