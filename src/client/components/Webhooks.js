import React from 'react';

import { loginIfNotAuthenticated, getErrorMessage } from '../utility';
import WebhookForm from './WebhookForm';
import Webhook from './Webhook';

export default class Webhooks extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      webhooks: [],
      error: '',
    };

    this.addWebhook = this.addWebhook.bind(this);
    this.removeWebhook = this.removeWebhook.bind(this);
  }

  async componentDidMount() {
    // eslint-disable-next-line no-undef
    const res = await fetch('/api/v1/users/@me/webhooks')
      .then(loginIfNotAuthenticated);

    this.setState({
      webhooks: res.data,
    });
  }

  async addWebhook(url) {
    this.setState({ error: '' });
    // eslint-disable-next-line no-undef
    const webhook = await fetch('/api/v1/webhooks', {
      method: 'POST',
      body: JSON.stringify({ url }),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(loginIfNotAuthenticated);

    const error = getErrorMessage(webhook);

    if (error) {
      this.setState({ error });
    } else {
      this.setState(({ webhooks }) => ({
        webhooks: [...webhooks, webhook.data],
      }));
    }
  }

  async removeWebhook(id) { // eslint-disable-next-line no-undef
    const res = await fetch(`/api/v1/webhooks/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error(res.statusText);
    }
    this.setState(({ webhooks }) => ({
      webhooks: webhooks.filter(({ id: id2 }) => id2 !== id),
    }));
  }

  render() {
    const { webhooks, error } = this.state;
    return (
      <div>
        <WebhookForm error={error} addWebhook={this.addWebhook} />
        <ul>
          {webhooks.map(webhook => (
            <Webhook webhook={webhook} removeWebhook={this.removeWebhook} />
          ))}
        </ul>
      </div>
    );
  }
}
