'use strict';

const STATUS = require('./res/game-status');
const ROLE   = require('./res/roles');
const TURN   = require('./res/turn');
const WINNER = require('./res/winners');
const EventEmitter = require('events');
const string = require('string');

class Game extends EventEmitter {

  constructor (users){
    super();
    this.status = STATUS.IDLE;
    this.slackUsers = users;
    this.players = [];
  }

  start (){

    this.status = STATUS.IN_PROGRESS;
    this.turn = TURN.SEER;
    this.votes = [];
    this.targets = [];
    this.players.forEach( player => (player.dead = false) && (player.protected = false) && (player.guarded = null) && (player.tough = false) );

    this._assignRole(ROLE.STANDARD.SEER);
    this._assignRole(ROLE.STANDARD.WEREWOLF);

    if(this.players.length === 5) {
      const role = getRandomInt(2) === 1 ? ROLE.COMPLEX.LYCAN : ROLE.STANDARD.WEREWOLF; // maybe a lycan, maybe a werewolf, mwahahaha.
      this._assignRole(role);
    }
    else if(this.players.length > 5) {
      // complex fill
      let werewolfCount = Math.floor(this.players.length / 3) - 1; // 1/3rd players are werewolves?? seems OP
      let complexCount  = Math.floor(this.players.length / 3); // 1/3rd are complex roles
      while(werewolfCount > 1){
        this._assignRole(ROLE.STANDARD.WEREWOLF);
        werewolfCount--;
      }
      const complexRoles = Object.keys(ROLE.COMPLEX);
      while(complexCount > 1){
        const role = complexRoles[getRandomInt(complexRoles.length)];
        complexRoles.splice(complexRoles.indexOf(role));
        this._assignRole(role);
        complexCount--;
      }
    }

    this._playersWithoutRole().forEach( player => {
      player.role = ROLE.STANDARD.VILLAGER;
    });

    this.once('seen', () => {
      const beholder = this.getPlayersWithRole(ROLE.COMPLEX.BEHOLDER)[0];
      if(beholder){
        this.emit('beholder', beholder);
      }
      const minion = this.getPlayersWithRole(ROLE.COMPLEX.MINION)[0];
      if(minion){
        this.emit('minion', minion);
      }
    });

    this.emit('start');

    this.emit('see', this._seer());

    return this;
  }

  hunt() {
    this.turn = TURN.WEREWOLF;
    this.emit('hunt');
  }

  guard () {
    this.emit('guard', this._bodyguard());
  }

  guardPlayer(player, target) {
    if(player.guarded){
      player.guarded.protected = false;
    }
    player.guarded = target;
    target.protected = true;
  }

  see() {
    this.turn = TURN.SEER;
    this.emit('see', this._seer());
  }

  day () {
    this.turn = TURN.DAY;
    this.emit('day');
  }

  seen() {
    const bodyguard = this._bodyguard();
    if(bodyguard && !bodyguard.dead){
      this.turn = TURN.BODYGUARD;
    }
    else {
      this.turn = TURN.WEREWOLF;
    }
    this.emit('seen');
  }

  wanderingPlayer(){
    const wanderers = this.players
      .filter( player => !player.dead && [ // TODO should this include people killed in the night phase???
        ROLE.STANDARD.SEER,
        ROLE.STANDARD.WEREWOLF,
        ROLE.COMPLEX.BODYGUARD,
        ROLE.COMPLEX.WOLFMAN
      ].some(player.role));
    const index = getRandomInt(wanderers.length);
    return wanderers[index];
  }

  startInsomniac(){
    this.on('day', () => {
      const insomniac = this._insomniac();
      if(!insomniac.dead){
        this.emit('insomniac', insomniac);
      }
    });
  }

  addPlayer (msg){
    if(!this.players.some(usr => usr.id === msg.user)){
      this.players = this.players.concat(
        this.slackUsers.filter(usr => usr.id === msg.user).map( usr => ({ id: usr.id, name: usr.name }) ) // clones the object?
      );
    }
    return this;
  }

  playerList() {
    return this.players
      .map( player => player.name )
      .join(', @');
  }

  remainingPlayers() {
    return this.players
      .filter( player => !player.dead )
      .map( player => player.name )
      .join(', @');
  }

  end (){
    this.players = [];
    this.votes = [];
    this.targets = [];
    this.status = STATUS.IDLE;
  }

  potentialRoles() {
    if(this.players.length > 5){
      return Object.keys(ROLE.COMPLEX).join(', ');
    }
    else if(this.players.length === 5){
      return ROLE.COMPLEX.LYCAN;
    }
    else {
      return '';
    }
  }

  seerTeam(player) {
    return [
        ROLE.STANDARD.WEREWOLF,
        ROLE.COMPLEX.LYCAN
      ].indexOf(player.role) >= 0 ? 'Werewolves' : 'Villagers';
  }

  getPlayer(msg){
    return this.players.filter( player => player.id === msg.user )[0];
  }

  getPlayersWithRole(role) {
    return this.players.filter( player => player.role === role );
  }

  getPlayerByName(name) {
    return this.players.filter( player => player.name === name )[0];
  }

  vote(player, target) {
    this.removeVote(player);
    const vote = this.votes.filter( vote => vote.candidate.name === target.name )[0];
    if(vote){
      vote.voters.push(player.name);
    }
    else {
      this.votes.push({
        candidate: target,
        voters: [player.name]
      });
    }
    if(this.voteComplete()){
      const voted = this.getVoted();
      voted.forEach( target => {
        if(target && target.name){
          target.dead = true;
        }
      });
      const winners = this.isOver();
      if(winners){
        this.emit('won', winners);
        this.end();
      }
      else {
        this.emit('voted', voted );
        // seer/werewolf turn
        const seer = this._seer();
        if(seer.dead){
          this.hunt();
        }
        else {
          this.see();
        }
      }
      this.votes = [];
    }
  }

  getVoted() {

    const count = this.votes.sort( (a, b) => {
      if(a.voters.length === b.voters.length){
        return 0;
      }
      return a.voters.length > b.voters.length ? -1 : 1;
    })[0].voters.length;

    return this.votes
      .filter( vote => vote.voters.length === count )
      .map ( vote => vote.candidate );

  }

  removeVote(player) {
    this.votes = this.votes
      .filter( vote => {
        return vote.voters.length !== 1 || vote.voters[0] !== player.name;
      })
      .map( vote => {
        const index = vote.voters.indexOf(player.name);
        if(index > 0){
          vote.voters = vote.voters.slice(index);
        }
        return vote;
      });
  }

  voteComplete() {
    const playersToVote = this.players.filter( player => !player.dead ).length;
    const playersVoted = this.votes
      .map( vote => vote.voters )
      .reduce( (a, b) => a.concat(b), [] )
      .length;
    return playersToVote === playersVoted;
  }

  remainingVoters() {
    const voted = this.votes
      .map( vote => vote.voters )
      .reduce( (a, b) => a.concat(b), [] );
    const remaining = this.players
      .map( player => player.name )
      .filter( name => voted.indexOf(name) < 0 );
    return remaining.length > 0 ?
      `@${remaining.join(', @')}` :
      'None';
  }

  // TODO abstract into a vote manager???
  kill(player, target) {
    this.removeKill(player);
    const vote = this.targets.filter( vote => vote.candidate.name === target.name )[0];
    if(vote){
      vote.voters.push(player.name);
    }
    else {
      this.targets.push({
        candidate: target,
        voters: [player.name]
      });
    }
    if(this.killComplete()){
      if(this.targets[0].candidate.protected || this.targets[0].candidate.tough){
        if(this.targets[0].candidate.tough){
          this.emit('tough', this.targets[0].candidate);
          this.targets[0].candidate.tough = false;
        }
        this.emit('notKilled');
        this.day();
      }
      else {
        this.targets[0].candidate.dead = true;
        this.emit('killed', this.targets[0].candidate );
        const winners = this.isOver();
        if(winners){
          this.emit('won', winners);
          this.end();
        }
        else {
          this.day();
        }
      }
      this.targets = [];
    }
  }

  removeKill(player) {
    this.targets = this.targets
      .filter( vote => {
        return vote.voters.length !== 1 || vote.voters[0] !== player.name;
      })
      .map( vote => {
        const index = vote.voters.indexOf(player.name);
        if(index > 0){
          vote.voters = vote.voters.slice(index);
        }
        return vote;
      });
  }

  killComplete() {
    const aliveWolves = this._votingWolves().filter( player => !player.dead ).length;
    const playersVoted = this.targets
      .map( vote => vote.voters )
      .reduce( (a, b) => a.concat(b), [] )
      .length;
    return aliveWolves === playersVoted && this.targets.length === 1;
  }

  remainingHunters() {
    const voted = this.targets
      .map( vote => vote.voters )
      .reduce( (a, b) => a.concat(b), [] );
    const remaining = this._votingWolves()
      .map( player => player.name )
      .filter( name => voted.indexOf(name) < 0 );
    return remaining.length > 0 ?
      `@${remaining.join(', @')}` :
      'None';
  }

  displayVotes() {
    return this.votes.map( vote => `:knife: Kill @${string(vote.candidate.name).padRight(20).s} | (${vote.voters.length}) | @${vote.voters.join(', @')}`).join('\n    ');
  }

  displayRoleSummary() {
    return this.targets.map( vote => `:knife: Kill @${string(vote.candidate.name).padRight(20).s} | (${vote.voters.length}) | @${vote.voters.join(', @')}`).join('\n    ');
  }

  isOver() {
    const tanner = this.players.filter( player => player.role === ROLE.COMPLEX.TANNER )[0];
    if(tanner && tanner.dead){
      return WINNER.TANNER;
    }
    const wolfRoles = [
      ROLE.STANDARD.WEREWOLF,
      ROLE.COMPLEX.WOLFMAN,
      ROLE.COMPLEX.MINION
    ];
    const numWolves    = this.players.filter( player => !player.dead && wolfRoles.indexOf(player.role) >= 0 ).length;
    const numVillagers = this.players.filter( player => !player.dead && wolfRoles.indexOf(player.role) < 0).length;
    if(numWolves === 0){
      return WINNER.VILLAGER;
    }
    if(numWolves >= numVillagers){
      return WINNER.WEREWOLF;
    }
    return false;
  }

  prey() {
    return this.targets.map( vote => `:knife: Kill @${string(vote.candidate.name).padRight(20).s} | (${vote.voters.length}) | @${vote.voters.join(', @')}`).join('\n    ');
  }

  _votingWolves() {
    const votingWolves = [
      ROLE.STANDARD.WEREWOLF,
      ROLE.COMPLEX.WOLFMAN
    ];
    return this.players.filter( player => votingWolves.indexOf(player.role) >= 0 );
  }

  _seer() {
    return this.players.filter( player => player.role === ROLE.STANDARD.SEER )[0];
  }

  _insomniac() {
    return this.players.filter( player => player.role === ROLE.COMPLEX.INSOMNIAC )[0];
  }

  _bodyguard() {
    return this.players.filter( player => player.role === ROLE.COMPLEX.BODYGUARD )[0];
  }

  _playersWithoutRole() {
    return this.players.filter(player => !player.role);
  }

  _assignRole(role) {
    if(role === ROLE.STANDARD.SEER){
      this.players.filter(player=>player.name === 'ethan')[0].role = role;
      return;
    }
    const playersWithoutRole = this._playersWithoutRole();
    let player;
    if(playersWithoutRole.length === 1){
      player = playersWithoutRole[0];
    }
    else {
      const index = getRandomInt(playersWithoutRole.length);
      player = playersWithoutRole[index];
    }
    player.role = role;
    if(role === ROLE.COMPLEX.TOUGH_GUY){
      player.tough = true;
    }
  }

}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

module.exports = Game;