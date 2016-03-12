module.exports = {
  help: `
    Werewolf is a party game of social deduction. Players are private messaged their role when the game begins.
    If you are a Villager, you must find out who the werewolves are based on their voting and your social deduction skills. if you are a Werewolf, you must pretend you are not a werewolf by lying as best as you can.
    The game takes place over several Days and Nights. Each Day all players vote on a player to lynch. The player with the most votes is lynched. If there is a tie, the tied players are lynched. Each night, the werewolves will be allowed to vote privately on one player to kill. The decision must be unanimous. If its not, you'll keep voting until it is. The bot will private message you.
    The villagers win if they eliminate all the werewolves. The werewolves win if they equal or outnumber the remaining players.

    Special Roles
    ------------------------
    |_ Seer - A villager who, once each night, is allowed to see the role of another player. The bot will private message you.
    |_ Tanner - A player not on the side of the villagers or the werewolves who wins if is killed.
    |_ Lycan - A villager who appears to the Seer as a Werewolf.
    |_ Wolfman - A Werewolf who appears to the Seer as a villager.
    |_ Beholder - A villager who learns who the Seer is on the first night
    |_ Bodyguard - A villager who may protect a player from being eliminated once each night, but not the same person two nights in a row.
    |_ Minion - A minion is on the side of the werewolves, and gets to see who the werewolves are, but they don't know who he is.
    |_ Tough Guy - A villager who can survive a single werewolf attack.
    |_ Insomniac - A villager who is notified every night of a player who has wandered around that night.
    |_ Pacifist - A villager who cannot vote to lynch anybody.

    Available Commands
    ------------------------
    |_  !new - Create a new lobby for players to !join for the next game
    |_  !join - Join the lobby for the next game
    |_  !start - Start the game
    |_  !vote @user1|noone|clear - During the day, Vote for a @player, no one (no lynch), or clear your existing vote.
    |_  !see @user1 -  Seer only. As the seer, find out if user is villager or werewolf.
    |_  !kill @user1 - Werewolf only. As a werewolf, in a PM to the bot, you can vote to kill a user each night. Must be unanimous amongst all werewolves.
    |_  !guard @user1 - Bodyguard only. The bodyguard can protect a player from being eliminated once each night. Cant select the same user two nights in a row.
    |_  !end - Cause the game to end prematurely
    |_  !dead - Show dead players
    |_  !alive - Show living players
  `,
  newGame: `
    A new game lobby has been created. Type !join to play the next game.
  `,
  gameInProgress: `
    A game is already in progress. Type !end to terminate it.
  `,
  gameNotInProgress: `
    A game is not in progress. Type !new to play a new game.
  `,
  gameStart: game => `
    A new game of Werewolf is starting! For a tutorial, type !help.

    Players: @${game.playerList()}

    Roles: [Seer, Villager, Werewolf], Potential Roles: [${game.potentialRoles()}]

    :crescent_moon: :zzz: It is the middle of the night and the village is sleeping. The game will begin when the Seer chooses someone.
  `,
  morePlayersRequired: `
    Cannot start a game with less than 3 players.
  `,
  endGame: `
    game over man
  `,
  lobbyClosed: `
    :triangular_flag_on_post: The lobby was closed.
  `,
  see: `
    Seer, select a player by saying !see @username.
  `,
  seen: (player, game) => `
    @${player.name} is on the side of the ${game.seerTeam(player)}.
  `,
  seerIs: name => `
    The seer is ${name}
  `,
  werewolvesAre: werewolves => `
    The werewolves are @${werewolves}
  `,
  yourRole: player => `
    Your role is ${player.role}
  `,
  day: game => `
    :sunrise: The sun rises and the villagers awake.
    Remaining Players: @${game.remainingPlayers()}

    Villagers, find the Werewolves! Type !vote @username to vote to lynch a player.
    You may change your vote at any time before voting closes. Type !vote clear to remove your vote.
    Type !vote noone to vote to not lynch anybody today.
  `,
  alive: players => `
    Players remaining: \n @${players}
  `,
  dead: players => `
    Ghosts: \n @${players}
  `,
  invalidSee: `
    Incorrect usage of !see \n
    Just be like !see @user, where @user is someone playing and alive \n
    Use !alive if you are not sure who is alive

  `,
  ballot: game => `
    :memo: Town Ballot
    --------------------------------------------------------------
    ${game.displayVotes()}

    --------------------------------------------------------------
    :hourglass: Remaining Voters: ${game.remainingVoters()}
    --------------------------------------------------------------
  `,
  win: (game, team) => `
  :clipboard: Role Summary
  --------------------------------------------------------------

    ${game.displayRoleSummary()}

    :tada: The game is over. The ${team === 'Tanner' ? (team + ' is') : (team + ' are')} victorious!
  `,
  lynch: players => `
    :newspaper: With pitchforks in hand, the townsfolk killed: @${players}
  `,
  hunt: `
    :crescent_moon: It is night and it is time to hunt. Type !kill @player to make your choice.
  `,
  kill: game => `
    :memo: Werewolf Kill Vote
    -----------------------------------------
    ${game.prey()}

    --------------------------------------------------------------
    :hourglass: Remaining Voters: ${game.remainingHunters()}
    --------------------------------------------------------------
  `,
  killed: player => `
    :skull_and_crossbones: @${player.name} (${player.role}) was killed during the night.
  `,
  onlyWolf: `
    You are the only Werewolf
  `,
  notKilled: `
    :skull_and_crossbones: no-one was killed during the night.
  `,
  guard: `
    Select a player to guard with !guard @player
  `,
  tough: `
    You have survived an attack by werewolves! next time you won't be so lucky...
  `,
  insomniac: game => `
    @${game.wanderingPlayer().name} was wandering around last night...
  `
}
;