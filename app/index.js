const express = require('express');
const axios = require('axios');
const redis = require('redis');
const port = 3000;

const app = express();
const client = redis.createClient(6379);
require('./users.js')(app, client);

(async () => {
  client.on('error', (err) => {
    console.log('Redis Client Error', err);
  });
  client.on('ready', () => console.log('Redis is ready'));

  await client.connect();

  await client.ping();
})();

app.get('/createEvent', async (req, res) => {
  if (isNaN(req.query.duration)) {
    res.send("invalid duration argument");

    return;
  }

  client.hSet(req.query.name, req.query.location, req.query.type);
  client.expire(req.query.name, req.query.duration);
  res.send({result: `event ${req.query.name} created`, duration: req.query.duration, location: req.query.location, type: req.query.type});
});

app.get('/event', async (req, res) => {
  if(!req.query.eventName){
    keys = await client.keys('event*');
  } else {
    keys = [req.query.eventName];
  }

  eventsRes = [];

  eventsRes = Promise.all(keys.map(async key => {
    data = await client.hGetAll(key);
    timeLeft = await client.ttl(key);
    if (data != null && timeLeft != -2){
      return ({'name': key, data, timeLeft});
    }
  }));

  res.send(await eventsRes);
});

app.get('/errors', (req, res) =>
{
  userId = CleanParameter(req.query);
  getErrors(userId, res)
  
});

function CleanParameter(_userId)
{
  _userId = _userId.userId || '';
  if (typeof _userId === 'string') 
  {
    _userId = _userId.replace(/\D/g, ''); // Supprime tout ce qui n'est pas un chiffre
  }
  return _userId;
}

function getErrors(userId, res)
{
  console.log(userId);
  client.hGet("userErrors:" + userId, "error").then(function(result){
    const parsedResult = JSON.parse(result);
    const formatedResult = "date: " + parsedResult.date + " | message: " + parsedResult.message;
    console.log(parsedResult);
    res.send(formatedResult);
  }).catch(function(err) {
    res.send(err.message);
  });
}

app.listen(port, () => {
  console.log('Server is running on port ' + port);
});