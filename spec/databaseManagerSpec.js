process.env.NODE_ENV ='test';
var DatabaseManager = require("../lib/databaseManager");
var models = require('../models/index');
var databaseCleaner = require('./support/cleaner');

describe("Database Manager", function() {

  beforeEach(function(done){
    databaseManager = new DatabaseManager();
    single_event = {
        name: "Single Mingle",
        description: "A Mingle for Singles",
        address: "52 Commercial St",
        date:  "2016-10-26 18:30:00+01",
        link: "http://www.makersacademy.com",
        meetup_id: "1234"}

    models.Event.create(single_event).then(function(results) {
      event_id = results.id;
      done();
    });
  });

  afterEach(function(done) {
    databaseCleaner.clean(done)
  });

  it('retrieves database entries', function(done){
      databaseManager.getEvents().then(function(results){
        expect(results.pop().name).toEqual(single_event.name);
        done();
      })
  })

  it('adds user to database', function(done){
      databaseManager.addUser({first: 'Elizabeth', last: "test", fbid:"123"}).then(function(results){
        models.User.findAll().then(function(results){
          expect(results.length).toEqual(1);
          done();
        });
      });
  })

  it('adds RSVPs to database', function(done){
    var user = {first:'Elizabeth', last:'Coffee', email:'test@example.com', pic:'123', gender:'F', age: '14'}

    models.User.create(user).then(function(results){
      var user_id = results.id;
      databaseManager.addResponse({user_id: user_id, event_id: event_id}).then(function(results){
        models.RSVP.findAll().then(function(results){
          expect(results.length).toEqual(0);
          done();
        });
      });
    });
  })

  it('gets Matches from database', function(done){
    var user = {first:'Elizabeth', last:'Coffee', email:'test@example.com', pic:'123', gender:'F', age: '14'}
    var user2 = {first:'Tom', last: 'Stuart', email:'a@b.com', pic:'567', gender:'M', age: '24'}
    models.User.create(user).then(function(results){
      user_id = results.id;
      models.RSVP.create({EventId: event_id, UserId: user_id});
    });
    models.User.create(user2).then(function(results){
      var user2 = results
      models.RSVP.create({EventId: event_id, UserId: user2.id}).then(function(){

        databaseManager.getMatches({user_id: user_id}).then(function(results){
          expect(results[0].first).toContain(user2.dataValues.first);
          done();
        });
      })
    });
  })



});
