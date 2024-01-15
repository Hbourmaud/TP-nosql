const express = require('express');
const axios = require('axios');
const redis = require('redis');

const app = express();
const client = redis.createClient(6379);

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
    keys = await client.keys('*');
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

app.get('/transform', (req, res) =>
{
  userId = CleanParameter(req.query);
  getErrors(userId, res)
  
});

function CleanParameter(_userId)
{
  console.log(_userId.userId);
  _userId = _userId.userId || '';
  if (typeof _userId === 'string') 
  {
    _userId = _userId.replace(/\D/g, ''); // Supprime tout ce qui n'est pas un chiffre
  }

  return _userId;
}

function getErrors(userId, res)
{
  client.hGet("usersErrors:" + userId, "error").then(function(result){
    res.send(JSON.parse(result))
  }).catch(function(err) {
    res.send(err.message);
  });

}

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});