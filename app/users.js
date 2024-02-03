module.exports = function(app, client){

app.get('/users', async (req, res) => {
    userId = cleanParametersUsers(req.query);
    getUsers(userId, res)
  });
  
  function getUsers(userid, res)
  {
    client.hGet("userId:" + userId, "info").
    then(function(result)
    {
      const parsedResult = JSON.parse(result);
      if(parsedResult != null)
      {
        const formatedResult = "nom: " + parsedResult.Nom + " | " + "age : " + parsedResult.Age;
        res.send(formatedResult)
      }
      else 
      {
        client.hSet("userId:" + userId, "info", '{"Nom": "defaultUsr", "Age": "NaN"}')
        getUsers(userid, res)
      }
  
    }).catch(function(err){ res.send(err.message);});
  }
  
  function cleanParametersUsers(_userId)
  {
    _userId = _userId.userId || '';
    if (typeof _userId === 'string')
    {
      _userId = _userId.replace(/\D/g, '')
    }
    return _userId;
  }
}