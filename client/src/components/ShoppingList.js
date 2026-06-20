import React, { Component, createRef } from 'react';
import { Container, ListGroup, ListGroupItem, Button, Badge } from 'reactstrap';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { connect } from 'react-redux';
import { getItems, deleteItem, addItem, getAiInsights } from '../actions/itemActions';
import PropTypes from 'prop-types';

class ShoppingList extends Component {
  static propTypes = {
    getItems: PropTypes.func.isRequired,
    getAiInsights: PropTypes.func.isRequired,
    addItem: PropTypes.func.isRequired,
    item: PropTypes.object.isRequired,
    isAuthenticated: PropTypes.bool
  };

  componentDidMount() {
    this.props.getItems();
    this.props.getAiInsights();
  }

  onDeleteClick = id => {
    this.props.deleteItem(id);
  }

  onSuggestionClick = suggestion => {
    this.props.addItem({
      name: suggestion.name,
      category: suggestion.category
    });
  }

  render() {
    const items = (this.props.item && Array.isArray(this.props.item.items)) ? this.props.item.items : [];
    const suggestions = (this.props.item && Array.isArray(this.props.item.suggestions)) ? this.props.item.suggestions : [];

    return (
      <Container className="smart-list-shell">
        <div className="assistant-panel">
          <div>
            <p className="assistant-label">AI shopping assistant</p>
            <h5>Predicted next items</h5>
          </div>
          <div className="suggestion-grid">
            {suggestions.length ? suggestions.map(suggestion => (
              <Button
                key={`${suggestion.name}-${suggestion.category}`}
                color="light"
                className="suggestion-chip"
                disabled={!this.props.isAuthenticated}
                onClick={this.onSuggestionClick.bind(this, suggestion)}
              >
                <span>{suggestion.name}</span>
                <Badge color="secondary" pill>{suggestion.category}</Badge>
              </Button>
            )) : <span className="empty-suggestions">Add a few items to unlock predictions.</span>}
          </div>
        </div>

        <ListGroup>
          <TransitionGroup className="shopping-list">
            {items.map(({ _id, name, category, aiConfidence, addedByVoice }) => {
              const nodeRef = createRef();
              return (
                <CSSTransition
                  key={_id}
                  timeout={500}
                  classNames="fade"
                  nodeRef={nodeRef}
                >
                  <ListGroupItem ref={nodeRef}>
                    {this.props.isAuthenticated ? <Button
                      className="remove-btn"
                      color="danger"
                      size="sm"
                      style={{ float: 'right' }}
                      onClick={this.onDeleteClick.bind(this, _id)}
                    >
                      &times;
                    </Button> : null}
                    <div className="item-content">
                      <span className="item-name">{name}</span>
                      <span className="item-meta">
                        <Badge color="info" pill>{category || 'Other'}</Badge>
                        {aiConfidence ? <small>{Math.round(aiConfidence * 100)}% AI match</small> : null}
                        {addedByVoice ? <small>Voice</small> : null}
                      </span>
                    </div>
                  </ListGroupItem>
                </CSSTransition>
              );
            })}
          </TransitionGroup>
        </ListGroup>
      </Container>
    );
  }
}

const mapStateToProps = state => ({
  item: state.item,
  isAuthenticated: state.auth.isAuthenticated
});

export default connect(mapStateToProps, { getItems, deleteItem, addItem, getAiInsights })(ShoppingList);
