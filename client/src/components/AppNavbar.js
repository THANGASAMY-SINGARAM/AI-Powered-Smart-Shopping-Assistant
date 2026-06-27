import React, { Component, Fragment } from "react";
import {
  Navbar,
  NavbarBrand,
  Nav,
  NavItem,
  NavbarText,
  Container,
  NavbarToggler,
  Collapse
} from "reactstrap";
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import RegisterModal from "./auth/RegisterModal";
import LoginModal from "./auth/LoginModal";
import Logout from "./auth/Logout";

class AppNavbar extends Component {
  state ={
    isOpen: false
  };
  static propTypes = {
    auth: PropTypes.object.isRequired
  }

  toggle =() =>{
    this.setState({
      isOpen: !this.state.isOpen
    });
  };
  render() {
    const { isAuthenticated, user } = this.props.auth;

    const authLinks = (
      <Fragment>
        <NavbarText className="me-3 text-white">
          <strong>{ user ? `Welcome ${user.name || user.email}` : ''}</strong>
        </NavbarText>
        <NavItem>
          <Logout />
        </NavItem>
      </Fragment>
    );

    const guestLinks = (
      <Fragment>
              <NavItem>
                <RegisterModal />
              </NavItem>
               <NavItem>
                <LoginModal />
              </NavItem>
      </Fragment>
    );

    return (
      <div>
        <Navbar color="dark" dark expand="sm" className="mb-5">
          <Container className="d-flex align-items-center">
            <NavbarBrand href="/">CommerceHub</NavbarBrand>
            <NavbarToggler onClick={this.toggle} />
            <Collapse isOpen={this.state.isOpen} navbar>
              <Nav className="ms-auto" navbar>
                { isAuthenticated ? authLinks : guestLinks}
              </Nav>
            </Collapse>
          </Container>
        </Navbar>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth
})

export default connect(mapStateToProps, null)(AppNavbar);
