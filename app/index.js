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
  if (!isNaN(req.query.duration)) {
    res.send("invalid duration argument");

    return;
  }

  client.hSet(req.query.name, req.query.location, req.query.type);
  client.expire(req.query.name, req.query.duration);
  res.send({result: `event ${req.query.name} created`, duration: req.query.duration, location: req.query.location, type: req.query.type});
});

app.get('/event', async (req, res) => {
  data = await client.hGetAll(req.query.eventName);
  timeLeft = await client.ttl(req.query.eventName);

if (data != null && timeLeft != -2){
  res.send({data, timeLeft});

  return;
}

res.send(JSON.stringify("No event corresponding"));

});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});