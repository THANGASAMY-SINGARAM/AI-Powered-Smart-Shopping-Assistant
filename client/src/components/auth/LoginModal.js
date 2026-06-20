import React from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Form,
  FormGroup,
  Label,
  Input,
  NavLink,
  Alert
} from "reactstrap";
import { connect } from "react-redux";
import propTypes from "prop-types";
import { login } from "../../actions/authActions";
import { clearErrors } from "../../actions/errorActions";

class LoginModal extends React.Component {
  state = {
    modal: false,
    email: "",
    password: "",
    Msg: null
  };


  static propTypes = {
    isAuthenticated: propTypes.bool,
    error: propTypes.object.isRequired,
    login: propTypes.func.isRequired,
    clearErrors: propTypes.func.isRequired
  };

  componentDidUpdate(prevProps) {
    const { error, isAuthenticated } = this.props;
    if (error !== prevProps.error) {
      // Check for register error
      if (error.id === "LOGIN_FAIL") {
        const errorMessage =
          error.msg && typeof error.msg === "object"
            ? error.msg.msg || JSON.stringify(error.msg)
            : error.msg;
        this.setState({ Msg: errorMessage });
      } else {
        this.setState({ Msg: null });
      }
    }

    if (this.state.modal) {
      if (isAuthenticated) {
        this.toggle();
      }
    }
  }

  toggle = () => {
    this.props.clearErrors();
    this.setState({
      modal: !this.state.modal,
    });
  };

  onChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  onSubmit = (e) => {
    e.preventDefault();
    const { email, password } = this.state;

    const user = {
        email,
        password
    }

    this.props.login(user);
  }
  render() {
    return (
      <div>
        <NavLink onClick={this.toggle} href="#">
          Login
        </NavLink>
        <Modal isOpen={this.state.modal} toggle={this.toggle}>
          <ModalHeader toggle={this.toggle}>Login</ModalHeader>
          <ModalBody>
          {this.state.Msg ? (
            <Alert color="danger">{this.state.Msg}</Alert>
          ) : null}
            <Form onSubmit={this.onSubmit}>
              <FormGroup>

                <Label for="email">Email</Label>
                <Input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Email"
                  className="mb-3"
                  onChange={this.onChange}
                />

                <Label for="password">Password</Label>
                <Input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="Password"
                  className="mb-3"
                  onChange={this.onChange}
                />

                <Button
                  color="dark"
                  style={{ marginTop: "2rem" }}
                  block
                >
                  Login
                </Button>
              </FormGroup>
            </Form>
          </ModalBody>
        </Modal>
      </div>
    );
  }
}
const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
  error: state.error,
});

export default connect(mapStateToProps, { login, clearErrors })(LoginModal);