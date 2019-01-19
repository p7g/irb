import React from 'react';

import { loginIfNotAuthenticated, getErrorMessage } from '../utility';

import Subscription from './Subscription';
import SubscriptionForm from './SubscriptionForm';

export default class Webhook extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      id: props.webhook.id,
      name: props.webhook.name,
      subscriptions: props.webhook.subscriptions,
      error: '',
    };

    this.subscribe = this.subscribe.bind(this);
    this.unsubscribe = this.unsubscribe.bind(this);
  }

  async subscribe(webhookId, subreddit) {
    this.setState({ error: '' });
    const res = await fetch( // eslint-disable-line no-undef
      `/api/v1/webhooks/${webhookId}/subscriptions`,
      {
        method: 'POST',
        body: JSON.stringify({ subreddit }),
        headers: {
          'Content-Type': 'application/json',
        },
      },
    ).then(loginIfNotAuthenticated);

    const error = getErrorMessage(res);

    if (error) {
      this.setState({ error });
    } else {
      this.setState(({ subscriptions }) => ({
        subscriptions: [...subscriptions, res.data],
      }));
    }
  }

  async unsubscribe(webhookId, subreddit) {
    // eslint-disable-next-line no-undef
    await fetch(
      `/api/v1/webhooks/${webhookId}/subscriptions/${subreddit}`,
      {
        method: 'DELETE',
      },
    ).then(loginIfNotAuthenticated);

    this.setState(({ subscriptions }) => ({
      subscriptions: subscriptions.filter(
        ({ _id }) => _id !== subreddit,
      ),
    }));
  }

  render() {
    const {
      error,
      id,
      name,
      subscriptions,
    } = this.state;
    const { removeWebhook } = this.props;
    return (
      <li>
        <p>
          <strong>{name}</strong>
          {' '}
          <button
            type="button"
            onClick={() => removeWebhook(id)}
          >
            Delete
          </button>
        </p>
        <ul>
          {subscriptions.map(({ _id }) => (
            <Subscription
              subreddit={_id}
              webhookId={id}
              unsubscribe={this.unsubscribe}
            />
          ))}
        </ul>
        <SubscriptionForm
          error={error}
          subscribe={this.subscribe}
          webhookId={id}
        />
      </li>
    );
  }
}
