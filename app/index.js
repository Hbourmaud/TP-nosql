const express = require('express');
const axios = require('axios');
const redis = require('redis');
const port = 3000;

const app = express();
const client = redis.createClient(6379);
require('./users.js')(app, client);

// (async () => {
//   client.on('error', (err) => {
  //     console.log('Redis Client Error', err);
//   });
//   client.on('ready', () => console.log('Redis is ready'));

//   await client.connect();

//   await client.ping();
// })();

const MongoClient = require('mongoose');

const url = "mongodb://localhost:27017/McServ";

MongoClient.connect(url).then(() => {
     console.log("Connection success");
   })
     .catch((err) => {
       console.log("connection failed:" + err);
     }
   );

var db = MongoClient;
var ObjId_s = db.Schema.Types.ObjectId;

var players_s = new MongoClient.Schema({
  _id: { 
    type: ObjId_s,
    required: true,
    auto: true
  },
  pseudo: String,
  playerPos: [
    {
      x: Number,
      y: Number,
      z: Number
    }
  ],
  playerRot: Number
});

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

var players_m = new MongoClient.model('players', players_s);

var objects_s = new MongoClient.Schema({
  _id: { 
    type: ObjId_s,
    required: true,
    auto: true
  },
  name: String
});

var objects_m = new MongoClient.model('objects', objects_s);

var freeItems_s = new MongoClient.Schema({
  _id: {
    type: ObjId_s,
    required: true,
    auto: true
  },
  obj: {type: ObjId_s, ref: 'objects'},
  itemPos: [
    {
      x: Number,
      y: Number,
      z: Number
    }
  ],
  itemRot: {
    type: Number,
    min: 0,
    max: 360
  }
});

var freeItems_m = new MongoClient.model('freeItems', freeItems_s);

var inventoryObjs_s = new MongoClient.Schema({
  _id: { 
    type: ObjId_s,
    required: true,
    auto: true
  },
  player: {type: ObjId_s, ref: 'players'},
  obj: {type: ObjId_s, ref: 'objects'},
  nb_items: {
    type: Number,
    min: 0,
    max: 360
  }
});

var inventoryObj_m = new MongoClient.model('invObj', inventoryObjs_s);

var player1 = new players_m({ pseudo: "XValentino", playerPos: [{x: 20, y: 160,z: 76}], playerRot: 80});
player1.save().then(() => {
  console.log("player 1 added: " + player1._id);
})
  .catch((err) => {
    console.log(err);
  }
);

var player2 = new players_m({ pseudo: "MissClacla", playerPos: [{x: 45, y: 600, z: 20}], playerRot: 243});
player2.save().then(() => {
  console.log("player 2 added");
})
  .catch((err) => {
    console.log(err);
  }
);

var object1 = new objects_m({name: 'wood'});
object1.save().then(() => {
  console.log("object " + object1.name + " added");
})
  .catch((err) => {
    console.log(err);
  }
);

var object2 = new objects_m({name: 'apple'});
object2.save().then(() => {
  console.log("object " + object2.name + " added");
})
  .catch((err) => {
    console.log(err);
  }
);
var object3 = new objects_m({name: 'sword'});
object3.save().then(() => {
  console.log("object " + object3.name + " added");
})
  .catch((err) => {
    console.log(err);
  }
);

var inv1 = new inventoryObj_m({player: player1._id, obj: object1._id, nb_items: 5});
inv1.save().then(() => {
  console.log("object inventory 1 added");
})
  .catch((err) => {
    console.log(err);
  }
);
var inv2 = new inventoryObj_m({player: player1._id, obj: object3._id, nb_items: 1});
inv2.save().then(() => {
  console.log("object inventory 2 added");
})
  .catch((err) => {
    console.log(err);
  }
);
var inv3 = new inventoryObj_m({player: player2._id, obj: object2._id, nb_items: 3});
inv3.save().then(() => {
  console.log("object inventory 3 added");
})
  .catch((err) => {
    console.log(err);
  }
);
var inv4 = new inventoryObj_m({player: player2._id, obj: object3._id, nb_items: 1});
inv4.save().then(() => {
  console.log("object inventory 4 added");
})
  .catch((err) => {
    console.log(err);
  }
);

var freeItem1 = new freeItems_m({obj: object2._id, itemPos: [{x: 56,y: 134,z: 0}], ItemRot: 60});
freeItem1.save().then(() => {
  console.log("Free item 1 added");
})
  .catch((err) => {
    console.log(err);
  }
);

// let output;
// (async () => {
//   output = await player1.save();
// })
// console.log(output);

// app.get('/createEvent', async (req, res) => {
//   if (isNaN(req.query.duration)) {
//     res.send("invalid duration argument");

//     return;
//   }

//   client.hSet(req.query.name, req.query.location, req.query.type);
//   client.expire(req.query.name, req.query.duration);
//   res.send({result: `event ${req.query.name} created`, duration: req.query.duration, location: req.query.location, type: req.query.type});
// });

// app.get('/event', async (req, res) => {
//   if(!req.query.eventName){
//     keys = await client.keys('*');
//   } else {
//     keys = [req.query.eventName];
//   }

//   eventsRes = [];

//   eventsRes = Promise.all(keys.map(async key => {
//     data = await client.hGetAll(key);
//     timeLeft = await client.ttl(key);
//     if (data != null && timeLeft != -2){
//       return ({'name': key, data, timeLeft});
//     }
//   }));

//   res.send(await eventsRes);
// });

// app.listen(3000, () => {
//   console.log('Server is running on port 3000');
// });
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