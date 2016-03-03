'use strict';

require('../core')
  .run()
  .then(
    () => console.log('Game running!'),
    err => console.log(`bot failed to start:\n${JSON.stringify(err)}`)
  );
