/*

- models:
  subreddit
    name
    subscriptions
  webhook
    url
    token
    name
    subscriptions

- actions:
  external
    add webhook
    remove webhook
    add subscription
    remove subscription
  internal
    add subreddit
    remove subreddit
    new post

- in db:
  subreddits
    webhooks listening
  webhooks

- on startup:
  get all subreddits
  start listening to all

- when adding webhook:
  insert into webhook db

- when removing webhook:
  remove from webhook db
  remove all subscriptions

- when adding subscription:
  add subreddit if not exists
  add webhook to subreddit webhook list
  add subreddit to webhook subscription list

- when removing subscription:
  remove webhook from subreddit list
  remove subreddit from webhook subscription list
  remove subreddit if no more subscriptions

- when adding subreddit:
  insert into db with empty webhook list
  start listening for new posts

- when removing subreddit:
  stop listening for new posts
  remove from db

- on new post:
  get all subscribed webhooks from db
  make an embed for the post
  send the embed to each subscribed webhook

*/
