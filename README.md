# inconspicuousRedditBot

This is a Discord bot that monitors subreddits and posts new messages to a Discord webhook.

## Usage

To use this bot to display Reddit posts in a channel, do the following:
> Note: you need to have the permission to manage webhooks for that server

1. Open the settings for the server that has the channel
2. Click on 'Webhooks'
3. Make a new webhook with whatever name, avatar, and channel you would like
4. Copy the URL
5. Go to [the inconspicuousRedditBot website](https://patg.design) and log in with Discord
6. Paste the URL copied in step 4 into the 'Add a webhook' box and click 'Add'
7. Enter the name of the subreddit to which you would like to subscribe the channel in the 'Add a subscription' box and click 'Subscribe'

Your channel is now subscribed to any subreddits entered into the website.

## Hosting

To host this bot yourself, you will need docker and docker-compose.

1. Clone this repository
2. Make a .env file based on the .env.example file
3. Edit the docker-compose.yml file to work with your webserver (the website is bound to port 8080 of the container)
4. Start the container with `docker-compose up -d --build`