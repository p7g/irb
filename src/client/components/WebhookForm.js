import React from 'react';

import { comma, random } from '../utility';

export default class WebhookForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
    };
    this.rand = random();
  }

  render() {
    const { addWebhook, error } = this.props;
    const { text } = this.state;
    return (
      <fieldset>
        <legend>Add a webhook</legend>
        {error && <p><em>{error}</em></p>}
        <label htmlFor={`url${this.rand}`}>
          Webhook URL:
          {' '}
          <input
            type="url"
            id={`url${this.rand}`}
            placeholder="Discord webhook URL"
            value={text}
            onChange={e => this.setState({ text: e.target.value })}
          />
        </label>
        {' '}
        <button
          type="button"
          onClick={() => comma(
            addWebhook(text),
            this.setState({ text: '' }),
          )}
        >
          Add
        </button>
      </fieldset>
    );
  }
}
