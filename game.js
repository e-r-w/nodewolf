'use strict';

const STATUS = require('./res/game-status');
const ROLE   = require('./res/roles');
const TURN   = require('./res/turn');
const WINNER = require('./res/winners');
const EventEmitter = require('events');
const string = require('string');

class Game extends EventEmitter {

  constructor (){
    super();
    this.status = STATUS.IDLE;
    this.players = [];
    this.votes = [];
    this.targets = [];
  }

  _assignRoles() {
    this._assignRole(ROLE.STANDARD.SEER);
    this._assignRole(ROLE.STANDARD.WEREWOLF);

    if(this.players.length === 5) {
      const role = getRandomInt(2) === 1 ? ROLE.COMPLEX_VILLAGER.LYCAN : ROLE.STANDARD.WEREWOLF; // maybe a lycan, maybe a werewolf, mwahahaha.
      this._assignRole(role);
    }
    else if(this.players.length > 5) {

      // complex fill
      let werewolfCount = Math.floor(this.players.length / 3) - 1; // 1/3rd players are werewolves?? seems OP
      const complexWolves = Object.keys(ROLE.COMPLEX_WOLVES);
      while(complexWolves.length < werewolfCount) {
        complexWolves.push(ROLE.STANDARD.WEREWOLF);
      }
      while(werewolfCount > 1){
        const role = complexWolves[getRandomInt(complexWolves.length)];
        complexWolves.splice(complexWolves.indexOf(role));
        this._assignRole(role);
        werewolfCount--;
      }

      let complexCount  = Math.floor(this.players.length / 3); // 1/3rd are villager/tanner roles
      const complexVillagers = Object.keys(ROLE.COMPLEX_VILLAGER);
      while(complexCount > 1){
        const role = complexVillagers[getRandomInt(complexVillagers.length)];
        complexVillagers.splice(complexVillagers.indexOf(role));
        this._assignRole(role);
        complexCount--;
      }
    }

    this._playersWithoutRole().forEach( player => {
      player.role = ROLE.STANDARD.VILLAGER;
    });

    return this;
  }

  _start() {
    this.status = STATUS.IN_PROGRESS;
    this.turn = TURN.SEER;
    this.firstRun = true;
    this.emit('start');
    this.emit('phase:seer:start', this._seer());
    const beholder = this._beholder();
    if(beholder){
      this.emit('beholder', beholder, this._seer());
    }
    const minion = this._minion();
    if(minion){
      this.emit('minion', minion, this._votingWolves());
    }
    const count = this._count();
    if(count){
      this.emit('count', count, this._votingWolves().length);
    }
    return this;
  }

  start() {
    this._assignRoles();
    return this._start();
  }

  end() {
    this.status = STATUS.IDLE;
    this.players = [];
    this.votes = [];
    this.targets = [];
  }

  guardPlayer(target) {
    if(this.guarded){
      this.guarded.protected = false;
    }
    this.guarded = target;
    target.protected = true;
  }

  see(id) {
    const seer = this._seer();
    if(!seer || seer.dead){
      return;
    }
    const target = this.players.filter( player => player.id === id)[0];
    if(!target || target.dead){
      return;
    }
    const side = this.seerTeam(target);
    this.emit('phase:seer:end', seer, target, side);
    if(this.firstRun){
      this.firstRun = false;
      this.turn = TURN.WEREWOLF;
    }
    this.next();
  }

  next() {
    if(this.turn === TURN.DAY){
      this.turn = TURN.SEER;
      const seer = this._seer();
      if(!seer.dead){
        this.emit('phase:seer:start');
      }
    }
    if(this.turn === TURN.SEER){
      this.turn = TURN.WEREWOLF;
      this.emit('phase:werewolf:start');
      return;
    }
    if(this.turn === TURN.WEREWOLF){
      this.turn = TURN.DAY;
      const insomniac = this._insomniac();
      if(insomniac){
        this.emit('insomniac', insomniac, this.wanderingPlayer());
      }
      this.emit('phase:day:start');
    }
  }

  wanderingPlayer(){
    const wanderers = this.players
      .filter( player => !player.dead && [ // TODO should this include people killed in the night phase???
        ROLE.STANDARD.SEER,
        ROLE.STANDARD.WEREWOLF,
        ROLE.COMPLEX_VILLAGER.BODYGUARD,
        ROLE.COMPLEX_WOLVES.WOLFMAN
      ].some( role => player.role === role));
    const index = getRandomInt(wanderers.length);
    return wanderers[index];
  }

  addPlayer (player){
    if(!this.players.some(usr => usr.id === player.id)){
      this.players = this.players.concat(
        [{ id: player.id, name: player.name }] // clones the object?
      );
      this.emit('add:player', { id: player.id, name: player.name });
    }
    return this;
  }

  potentialRoles() {
    if(this.players.length > 5){
      return Object.keys(ROLE.COMPLEX_VILLAGER).concat(Object.keys(ROLE.COMPLEX_WOLVES)).join(', ');
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
        ROLE.COMPLEX_VILLAGER.LYCAN
      ].indexOf(player.role) >= 0 ? 'Werewolves' : 'Villagers';
  }

  getPlayer(msg){
    return this.players.filter( player => player.id === msg.user )[0];
  }

  getPlayersWithRole(role) {
    return this.players.filter( player => player.role === role );
  }

  playerById(id) {
    return this.players.filter( player => player.id === id)[0];
  }

  getPlayerByName(name) {
    return this.players.filter( player => player.name === name )[0];
  }

  vote(player, target) {
    this.removeVote(player);
    const vote = this.votes.filter( vote => vote.target === target )[0];
    if(vote){
      vote.voters.push(player);
    }
    else {
      this.votes.push({
        target: target,
        voters: [player]
      });
    }
    this.emit('vote:cast', this.playerById(player), this.playerById(target), this.votes);

    if(this.voteComplete()){
      const voted = this.getVoted();
      voted.forEach( targetId => {
        if(targetId !== 'noone'){
          this.playerById(targetId).dead = true;
        }
      });
      this.emit('vote:end', voted );
      this.emit('phase:day:end');
      const winners = this.isOver();
      if(winners){
        this.emit('end', winners);
      }
      else {
        this.next();
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
      .map ( vote => vote.target );

  }

  removeVote(player) {
    this.votes = this.votes
      .filter( vote => {
        // filter out ones that only have one vote
        return vote.voters.length !== 1 || vote.voters[0] !== player;
      })
      .map( vote => {
        const index = vote.voters.indexOf(player);
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
      .map( player => player.id )
      .filter( id => voted.indexOf(id) < 0 );
    return remaining.length > 0 ?
      `@${remaining.map( id => this.players.filter(player => player.id === id)[0].name ).join(', @')}` :
      'None';
  }

  // TODO abstract into a vote manager???
  kill(playerId, targetId) {
    this.removeKill(playerId);
    const vote = this.targets.filter( vote => vote.target === targetId )[0];
    if(vote){
      vote.voters.push(playerId);
    }
    else {
      this.targets.push({
        target: targetId,
        voters: [playerId]
      });
    }
    this.emit('kill:cast');
    if(this.killComplete()){
      const target = this.playerById(this.targets[0].target);
      if(target.protected || target.tough){
        if(target.tough){
          this.emit('tough', target);
          target.tough = false;
        }
        this.emit('kill:end');
      }
      else {
        target.dead = true;
        this.emit('kill:end', target );
        const winners = this.isOver();
        if(winners){
          this.emit('end', winners);
        }
        else {
          this.next();
        }
      }
      this.targets = [];
    }
  }

  removeKill(playerId) {
    this.targets = this.targets
      .filter( vote => {
        return vote.voters.length !== 1 || vote.voters[0] !== playerId;
      })
      .map( vote => {
        const index = vote.voters.indexOf(playerId);
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
      .map( player => player.id )
      .filter( name => voted.indexOf(name) < 0 );
    return remaining.length > 0 ?
      `@${remaining.map( id => this.players.filter(player => player.id === id)[0].name ).join(', @')}` :
      'None';
  }

  displayVotes() {
    return this.votes.map( vote => `:knife: Kill @${string(this.playerById(vote.target).name).padRight(20).s} | (${vote.voters.length}) | @${vote.voters.join(', @')}`).join('\n    ');
  }

  displayRoleSummary() {
    return this.players.map( player => `@${player.name} - ${player.dead ? ':x:' : ':white_check_mark:'}`).join('\n    ');
  }

  isOver() {
    const tanner = this.players.filter( player => player.role === ROLE.COMPLEX_VILLAGER.TANNER )[0];
    if(tanner && tanner.dead){
      return WINNER.TANNER;
    }
    const wolfRoles = [
      ROLE.STANDARD.WEREWOLF,
      ROLE.COMPLEX_WOLVES.WOLFMAN,
      ROLE.COMPLEX_WOLVES.MINION
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
    return this.targets.map( vote => `:knife: Kill @${string(this.playerById(vote.target).name).padRight(20).s} | (${vote.voters.length}) | @${vote.voters.map(id => this.playerById(id).name).join(', @')}`).join('\n    ');
  }

  _votingWolves() {
    const votingWolves = [
      ROLE.STANDARD.WEREWOLF,
      ROLE.COMPLEX_WOLVES.WOLFMAN
    ];
    return this.players.filter( player => votingWolves.indexOf(player.role) >= 0 );
  }

  _seer() {
    return this.players.filter( player => player.role === ROLE.STANDARD.SEER )[0];
  }

  _beholder() {
    return this.players.filter( player => player.role === ROLE.COMPLEX_VILLAGER.BEHOLDER )[0];
  }

  _minion() {
    return this.players.filter( player => player.role === ROLE.COMPLEX_WOLVES.MINION )[0];
  }

  _insomniac() {
    return this.players.filter( player => player.role === ROLE.COMPLEX_VILLAGER.INSOMNIAC )[0];
  }

  _bodyguard() {
    return this.players.filter( player => player.role === ROLE.COMPLEX_VILLAGER.BODYGUARD )[0];
  }

  _count() {
    return this.players.filter( player => player.role === ROLE.COMPLEX_VILLAGER.COUNT )[0];
  }

  _playersWithoutRole() {
    return this.players.filter(player => !player.role);
  }

  _assignRole(role) {
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
    if(role === ROLE.COMPLEX_VILLAGER.TOUGH_GUY){
      player.tough = true;
    }
  }

}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

module.exports = Game;