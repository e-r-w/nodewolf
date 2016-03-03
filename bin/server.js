'use strict';

require('../core')
  .run(process.env.SLACK_TOKEN, process.env.SLACK_CHANNEL, process.env.SLACKKBOT_ID)
  .then(
    () => console.log('Game running!'),
    err => console.log(`bot failed to start:\n${JSON.stringify(err)}`)
  );
