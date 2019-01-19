import React from 'react';

import { random, comma } from '../utility';

export default class SubscriptionForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      webhookId: props.webhookId,
    };
    this.rand = random();
  }

  render() {
    const { text, webhookId } = this.state;
    const { subscribe, error } = this.props;
    return (
      <fieldset>
        <legend>Add a subscription</legend>
        {error && <p><em>{error}</em></p>}
        <label htmlFor={`sub${this.rand}`}>
          Add a new subscription
          {' '}
          <input
            type="text"
            id={`sub${this.rand}`}
            placeholder="subreddit name (no /r/)"
            value={text}
            onChange={e => this.setState({ text: e.target.value })}
          />
        </label>
        {' '}
        <button
          type="button"
          onClick={() => comma(
            subscribe(webhookId, text),
            this.setState({ text: '' }),
          )}
        >
          Subscribe
        </button>
      </fieldset>
    );
  }
}
