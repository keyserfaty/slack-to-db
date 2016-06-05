## slack to db

Save every URL shared on Slack on a db hosted by you.

## Getting started
**slack to db** saves every URL that is shared on a specific Slack channel in your team to a Mongo db that you host. To do this it runs a cron task using [webtask](https://webtask.io) every five minutes and searches for links on the messages shared on the channel.

To get started you will need to install `webtask` and setup your username:

    npm install wt-cli -g
    wt init username

To start the cron task run:

    wt cron schedule \
        -n slack-to-db \
        -s MONGO_URL=mongodb://username:pass@ds1234.mlab.com:21943 \
        -s SLACK_TOKEN=xxx-xxxx-xxxx-xxxx \
        -s SLACK_CHANNEL=ABC123 \
         "*/5 * * * *" \
         app.js
         --watch

You will need to specify a mongo URL, a Slack token and a Slack channel to run the cron task. You can get a Slack token for testing [here](https://api.slack.com/docs/oauth-test-tokens). Remember you will need to add the ID of the channel you would like to keep track of, not the channel's name. You can find out the ID of every channel in your team [here](https://api.slack.com/methods/channels.list/test).

webtask will provide you with an URL. Access the URL to test the task and start it :)

## License

Released under The MIT License.