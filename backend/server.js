const express = require('express')
const app = express()
const port = 3000
const sequelizeDB = require("./database.js");
const Utstyr = require("./models/Utstyr.js");
Utstyr.init(sequelizeDB);
Utstyr.sync({force: true});

app.use(express.json());
app.use(express.static('public'))


app.get('/getAll', async (req, res) => {
  
  res.send(await Utstyr.findAll())
})

app.post('/add', async (req, res) => {
  Utstyr.create({
    code: req.body.code,
    item: req.body.item
  });
  res.send(await Utstyr.findOne({where: {code : req.body.code,}, order: [ [ 'id', 'DESC' ]]}))
})

app.get('/loanOut/:id/:name', async (req, res) => {
  await Utstyr.update({utlånt: true}, {where: {id : req.params.id}})
  await Utstyr.update({name: req.params.name}, {where: {id : req.params.id}})
  res.send({status: "okidoki"})
})

app.get('/getIn/:id', async (req, res) => {
  await Utstyr.update({utlånt: false}, {where: {id : req.params.id}})
  await Utstyr.update({name: "Tom bombadil"}, {where: {id : req.params.id}})
  res.send({status: "okidoki"})
})

app.get('/:code', async (req, res) =>{
  await Utstyr.destroy({where: {code : req.params.code,}})
  res.send("Kult")
})  

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})