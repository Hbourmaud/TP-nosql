
app.get('/users', async (req, res) => {

    const cacheKey = 'users';
    const data = await client.get(cacheKey);
    console.log(req.query.pUserId);
    console.log(req.query.pUserId);
    console.log(req.query.pUserId);
    console.log(req.query.pUserId);
    console.log(req.query.pUserId);

    if(data != null){

    } 
    else {
        client.hSet('user:1', {
            name: pName,
            userId: pUserId,
            age: pAge
    //       lastPos:
        })
      res.send
}
});