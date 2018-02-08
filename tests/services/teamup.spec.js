const mongoose = require('../../config/mongoose');
const teamup = require('../../services/teamup');
const Teamup = require('../../services/teamup/Teamup');
const sinon = require('sinon');

const defaultParams = {
  'channel_id': 'ABCDEFG',
};

describe('teamup', function () {
  afterEach((done) => {
    try {
      mongoose.connection.db.dropDatabase(done)
    } catch(e) {
      done();
    }
  });

  describe('service', function () {
    // describe('list', function () {
    //   it('should return "no active teamups" message', async function () {
    //     const result = await teamup({ text: 'list' });
    //     expect(result.text).toEqual('No active teamups.');
    //   });

    //   it('should return list of teamups', async function () {
    //     sinon.stub(Teamup, 'find').returns(Promise.resolve([
    //       new Teamup({ name: 'Dummy1', code: 'd1' }),
    //       new Teamup({ name: 'Dummy2', code: 'd2' }),
    //     ]))
    //     const result = await teamup({ text: 'list' });
    //     expect(result.text).toEqual('`d1` Dummy1\n`d2` Dummy2');
    //     Teamup.find.restore();
    //   });
    // });

    describe('create', function () {
      it('should return confirmation text', async function () {
        const { model, text } = await teamup({ ...defaultParams, text: 'create Stand up scheduled * * * * *' });

        expect(model).toBeDefined();
        expect(model.cron).toEqual('* * * * *');
        expect(text).toEqual('Teamup "Stand up" created.');
      });

      it('should execute with trigger', async function () {
        const { model } = await teamup({
          ...defaultParams,
          text: 'create Stand up scheduled 0 10 * * * with message Let\'s talk project! and image <http://images.com/poop.png>'
        });

        expect(model.name).toEqual('Stand up');
        expect(model.cron).toEqual('0 10 * * *');
        expect(model.message).toEqual('Let\'s talk project!');
        expect(model.imageUrl).toEqual('<http://images.com/poop.png>');
      });

      it('should use delimiter in context', async function () {
        const { model } = await teamup({
          ...defaultParams,
          text: 'create Stand up scheduled 0 10 * * * with message Let\'s talk project and stuff! and image <http://images.com/poop.png>'
        });

        expect(model.name).toEqual('Stand up');
        expect(model.cron).toEqual('0 10 * * *');
        expect(model.message).toEqual('Let\'s talk project and stuff!');
        expect(model.imageUrl).toEqual('<http://images.com/poop.png>');

      });
    });
  });
});
