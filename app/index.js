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

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});