const mongoose = require('../../config/mongoose');
const teamup = require('../../services/teamup');
const Teamup = require('../../services/teamup/Teamup');
const sinon = require('sinon');

describe('teamup', function () {
  afterEach(done => mongoose.connection.db.dropDatabase(done));

  describe('service', function () {
    describe('list', function () {
      it('should return "no active teamups" message', async function () {
        const result = await teamup({ text: 'list' });
        expect(result.text).toEqual('No active teamups.');
      });

      it('should return list of teamups', async function () {
        sinon.stub(Teamup, 'find').returns(Promise.resolve([
          new Teamup({ name: 'Dummy1', code: 'd1' }),
          new Teamup({ name: 'Dummy2', code: 'd2' }),
        ]))
        const result = await teamup({ text: 'list' });
        expect(result.text).toEqual('`d1` Dummy1\n`d2` Dummy2');
        Teamup.find.restore();
      });
    });

    describe('create', function () {
      it('should return confirmation text', async function () {
        const before = await Teamup.find();
        const result = await teamup({ text: 'create Stand up su' });
        const after = await Teamup.find();
        expect(result.text).toEqual('Teamup "Stand up" (`su`) created.');
        expect(after.length - before.length).toEqual(1);
      });
    });

    describe('schedule', function () {
      teamup({ text: 'schedule stand_up * * * * * *' });
    });

    describe('delete', function () {
      teamup({ text: 'delete #1' });
    });
  });
});
