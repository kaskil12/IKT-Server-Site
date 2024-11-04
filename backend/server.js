const express = require('express')
const app = express()
const port = 3000
const sequelizeDB = require("./database.js");
const Liste = require("./models/Liste.js");
Liste.init(sequelizeDB);
Liste.sync({force: true});

app.use(express.json());
app.use(express.static('public'))


app.get('/getAll', async (req, res) => {
  
  res.send(await Liste.findAll())
})
app.post('/addDate', async (req, res) => {
  const {dato, antall} = req.body;
  await Liste.create({dato, antall});
  res.send("Dato lagt til");
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})