# nodewolf
A slack bot for moderating werewolf games, written in node, ported to the browser

Semi-ported from the original [php version](https://github.com/chrisgillis/slackwolf), check it out!

## running locally

`npm i && npm start` will browserify scripts & run a static http server on :8080.

Rip open www/build.js, look for the browserify process shim and add the following:

```
process.env = {
  SLACK_CHANNEL: 'your_slack_channel',
  SLACKKBOT_ID: 'the_id_of_your_slackbot',
  SLACK_TOKEN: 'the_test_token_generated_from_slack'
}
```