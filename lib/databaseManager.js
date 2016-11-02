var models = require('../models/index');

function DatabaseManager (){}

DatabaseManager.prototype =  {
  getEvents: function() {
    return models.Event.findAll().then(function(results){
      return results.map(function(element){
        return element.dataValues;
      });
    })
  },

  addUser: function(user){
    var options = {defaults: user, where: {fbid: user.fbid} }
    return models.User.findOrCreate(options).spread(function(results){
      return results.id;
    });
  },

  addResponse: function(params){
    var record = {UserId: params.user_id, EventId: params.event_id}
    return models.RSVP.findAll({
      where: {UserId: record.UserId,
              EventId: record.EventId}}).then(function(results){
              if (results.length > 0) {
                models.RSVP.destroy({
                  where: {UserId: record.UserId,
                          EventId: record.EventId}})}
                else {models.RSVP.create(record).then(function(results){
                  return results
                })}
    })
  },
  getMatches: function(params){
      var UserId = parseInt(params.user_id);
      var query = 'SELECT * FROM (SELECT * FROM (SELECT * FROM "Users" WHERE id in (SELECT "UserId" FROM "RSVPs" WHERE "UserId" <> '
      +UserId
      +' AND "EventId" in (SELECT "EventId" FROM "RSVPs" WHERE "UserId" ='
      +UserId
      +'))) as a LEFT JOIN (SELECT "EventId" as eventid,"UserId"as userid FROM "RSVPs" WHERE "UserId" <> '
      +UserId
      +' AND "EventId" in (SELECT "EventId" FROM "RSVPs" WHERE "UserId" ='
      +UserId
      +')) as b ON a.id = b.UserId) as a RIGHT JOIN "Events" as b on a.eventid = b.id'

      return models.sequelize.query(query, { type: models.sequelize.QueryTypes.SELECT})
        .then(function(results){
          var flags = {};
          return results.filter(function(entry) {
            if (flags[entry.fbid]) {
              return false;
            }
            flags[entry.fbid] = true;
            return true;
          });
        })
      }
};

module.exports = DatabaseManager;
