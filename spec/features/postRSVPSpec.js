process.env.NODE_ENV ='test';
var models = require('../../models/index');
var request = require('request');
var server = require('../../index.js');
var databaseCleaner = require('../support/cleaner');

describe('postRSVP', function() {
  beforeEach(function(done) {
    server.listen(3000);
    var user = {first:'Elizabeth', last:'Coffee', email:'test@example.com', pic:'123', gender:'F', age: '14'}
    var event = {
        name: "Single Mingle",
        description: "A Mingle for Singles",
        address: "52 Commercial St",
        date:  "2016-10-26 18:30:00+01",
        link: "http://www.makersacademy.com",
        meetup_id: "1234"}

    models.User.create(user).then(function(results){
      user_id = results.id;
      models.Event.create(event).then(function(results) {
        event_id = results.id;
        done();
      });
    });
  });

  afterEach(function(done) {
    server.close();
    databaseCleaner.clean(done)
  });


  it('adds a RSVP to DB',function(done){
    var options = {url: 'http://localhost:3000/response/new',
                   method: "POST",
                   body: "user_id="+user_id+"&event_id="+event_id}

    request(options, function(error, response, body) {
      models.RSVP.findAll().then(function(results){
        expect(results.length).toEqual(1);
        done();
      })
    });
  });

  it('deletes an RSVP on second request',function(done){
    var options = {url: 'http://localhost:3000/response/new',
                   method: "POST",
                   body: "user_id="+user_id+"&event_id="+event_id}

    request(options, function(error, response, body) {
      request(options, function(error, response, body) {
      models.RSVP.findAll().then(function(results){
        expect(results.length).toEqual(0);
        done();
      })
      })
    });
  });


});
