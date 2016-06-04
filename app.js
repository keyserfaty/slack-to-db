"use latest";
var MongoClient = require('mongodb').MongoClient;
var request = require('request');
var waterfall   = require('async').waterfall;

/* Tools */
const fail = (err) => (
  console.log(err)
);

const existy = (input) => (
  input != null
);

module.exports = (ctx, cb) => {
  const MONGO_URL = ctx.data.MONGO_URL;
  if (!MONGO_URL) return cb(new Error('MONGO_URL secret is missing'));

  /* Parse a string to check if it has 'http' or 'https' in it */
  const hasHttp = (str) => (
    /(https?:\/\/)/.test(str)
  );

  /* Search for messages that contain links and return them */
  const getUrlsFromObject = (obj) => {
    if (!obj.hasOwnProperty('messages')) {
      return fail('This object does not have a messages prop');
    }

    if (obj['messages'].length === 0) {
      return fail('No new messages in the last 5 minutes');
    }

    if (obj.hasOwnProperty('messages')) {
      return obj['messages'].filter(msg => (
        hasHttp(msg.text)
      ))
    }
  };

  const hasUrls = (obj) => {
    if (obj.length === 0) {
      return fail('This channel does not have any URL');
    }
    return obj;
  };

  /* Connect to db */
  const mongoConnection = (cb) => {
    MongoClient.connect(MONGO_URL, function (err, db) {
      if (err) return cb(err);
      cb(null, db);
    })
  };

  /* Make a request to Slack for messages in history of the last five minutes */
  const slackRequest = (db, cb) => {
    const token = 'xoxp-42985522996-42947300979-48170093921-fabe403e22';
    const channel = 'C1E3ERWKD';
    const oldest = (Date.now() - 5 * 60 * 1000) / 1000;

    request.get(`https://slack.com/api/channels.history?token=${token}&channel=${channel}&oldest=${oldest}&pretty=1`, (err, res, body) => {
      if (err) return cb(err);
      cb(null, db, getUrlsFromObject(JSON.parse(body)));
    });
  };

  /* Save the result to Mongo */
  const saveToMongo = (db, obj, cb) => {
    if (!existy(obj)) {
      return fail('No new object');
    }

    if (!hasUrls(obj)) {
      return fail('Nothing to save');
    }

    db
      .collection('links')
      .insertOne(obj, function (err, result) {
        if(err) return cb(err);
        cb(null, result);
      });
  };

  /* Save result to db */
  waterfall([
    mongoConnection,
    slackRequest,
    saveToMongo
  ], (err, res) => {
    if (err) return console.log(err);
    console.log('Mongo saved correctly entries', res)
  }, cb);
}