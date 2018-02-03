const STORE = [];

class Challenge {
  constructor(attributes) {
    this.attributes = attributes;

    this._scores = {};
  }

  save() {
    STORE.push(this.attributes);

    return Promise.resolve(this);
  }

  addParticipant(name) {
    this._scores[name] = 0;
  }

  scores() {
    return this._scores;
  }
}

Challenge.list = function() {
  return Promise.resolve([].concat(STORE));
}

module.exports = Challenge;
