import React from "react";
import axios from "axios";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Form,
  FormGroup,
  Label,
  Input,
  Badge,
  Alert,
} from "reactstrap";
import { connect } from "react-redux";
import { addItem } from "../actions/itemActions";
import PropTypes from 'prop-types';

const createId = () =>
  window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;

class ItemModal extends React.Component {
  state = {
    modal: false,
    name: "",
    aiPreview: null,
    addedByVoice: false,
    listening: false,
    speechError: "",
  };

  static propTypes = {
    isAuthenticated: PropTypes.bool
  }

  toggle = () => {
    this.setState({
      modal: !this.state.modal,
    });
  };

  onChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  analyzeItem = (name) => {
    if (!name.trim()) {
      this.setState({ aiPreview: null });
      return;
    }

    axios.post('/api/items/ai/analyze', { name })
      .then(res => this.setState({ aiPreview: res.data }))
      .catch(() => this.setState({ aiPreview: null }));
  };

  onNameBlur = () => {
    this.analyzeItem(this.state.name);
  };

  startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      this.setState({ speechError: "Voice input is not supported in this browser." });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => this.setState({ listening: true, speechError: "" });
    recognition.onerror = () => this.setState({ listening: false, speechError: "Could not capture voice input. Please try again." });
    recognition.onend = () => this.setState({ listening: false });
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      this.setState({ name: transcript, addedByVoice: true });
      this.analyzeItem(transcript);
    };

    recognition.start();
  };

  onSubmit = (e) => {
    e.preventDefault();
    if (!this.state.name.trim()) {
      return;
    }

    const newItem = {
      id: createId(),
      name: this.state.name,
      category: this.state.aiPreview?.category,
      addedByVoice: this.state.addedByVoice,
    };
    this.props.addItem(newItem);
    this.setState({
      modal: false,
      name: "",
      aiPreview: null,
      addedByVoice: false,
      listening: false,
      speechError: "",
    });
  };

  render() {
    return (
      <div>
        { this.props.isAuthenticated ? <Button color="dark" onClick={this.toggle}>
          Add Item
        </Button> : <h4 className="mb-3 ml-4">please log in to manage items</h4> }

        <Modal isOpen={this.state.modal} toggle={this.toggle}>
          <ModalHeader toggle={this.toggle}>Add Shopping Item</ModalHeader>
          <ModalBody>
            <Form onSubmit={this.onSubmit}>
              <FormGroup>
                <Label for="item">Item</Label>
                <Input
                  type="text"
                  name="name"
                  id="item"
                  placeholder="Add shopping item"
                  value={this.state.name}
                  onChange={this.onChange}
                  onBlur={this.onNameBlur}
                />
                <div className="smart-input-row">
                  <Button
                    type="button"
                    color={this.state.listening ? "danger" : "secondary"}
                    outline={!this.state.listening}
                    onClick={this.startVoiceInput}
                  >
                    {this.state.listening ? "Listening..." : "Add by Voice"}
                  </Button>
                  {this.state.aiPreview ? (
                    <Badge color="info" pill>
                      {this.state.aiPreview.category} - {Math.round((this.state.aiPreview.confidence || 0) * 100)}%
                    </Badge>
                  ) : null}
                </div>
                {this.state.speechError ? <Alert color="warning" className="mt-3">{this.state.speechError}</Alert> : null}
                <Button
                  color="dark"
                  style={{ marginTop: "2rem" }}
                  block
                >
                  Add Item
                </Button>
              </FormGroup>
            </Form>
          </ModalBody>
        </Modal>
      </div>
    );
  }
}
const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated
});

export default connect(mapStateToProps, { addItem })(ItemModal);
