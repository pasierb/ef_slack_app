const sinon = require('sinon');
const challenge = require('../../services/challenge');
const Challenge = require('../../services/challenge/Challenge');

describe('challenge', function () {
  describe('model', function () {
    let challenge;

    beforeEach(() => {
      challenge = new Challenge({
        name: 'Plank'
      });
    });

    describe('#addParticipant', function () {
      it('should add participant add set score to 0', async function () {
        const res = await challenge.addParticipant('John');
        expect(challenge.scores()['John']).toEqual(0);
      });
    });
  });

  describe('service', function () {
    describe('#parseText', function() {
      it('should parse command', async function () {
        const result = await challenge({ text: 'list' });
        expect(result.action).toEqual('list')
      });

      it('should parse data text', async function () {
        const result = await challenge({ text: 'dummy name="Plank challenge" smth=Else val=1' });

        expect(result.action).toEqual('dummy');
        expect(result.attributes).toHaveProperty('name', 'Plank challenge');
        expect(result.attributes).toHaveProperty('smth', 'Else');
        expect(result.attributes).toHaveProperty('val', 1);
      });
    });

    describe('#create', function () {
      it('should store challenge', async function () {
        const before = await Challenge.list();
        const result = await challenge({ text: 'create name=Plank'});
        const after = await Challenge.list();

        expect(after.length - before.length).toEqual(1);
      });
    });

    describe('#list', function () {
      it('should display "no challenges" message', async function () {
        sinon.stub(Challenge, 'list').returns(Promise.resolve([]));
        const result = await challenge({ text: 'list' });

        expect(result.response.text).toEqual("No active challenges");
        Challenge.list.restore();
      });

      it('should list challenges', async function () {
        sinon.stub(Challenge, 'list').returns(Promise.resolve([
          { name: 'Plank Challenge' }
        ]));
        const result = await challenge({ text: 'list' });

        expect(result.response.text).toEqual("Plank Challenge\n");
        Challenge.list.restore();
      });
    });

    it('should return respond to unrecognized action', async function () {
      const result = await challenge({ text: 'dummyAction' });

      expect(result.response).toEqual('Action "dummyAction" does not exists.');
    });
  });
});
