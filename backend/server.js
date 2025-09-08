const express = require('express')
const app = express()
const port = 3000
const sequelizeDB = require("./database.js");
const Printer = require("./models/Printer.js");
Printer.init(sequelizeDB);
Printer.sync({ force: true });

app.use(express.json());
app.use(express.static('public'))


app.get('/getAll', async (req, res) => {

  res.send(await Printer.findAll())
})

app.post('/add', async (req, res) => {
  Printer.create({
    code: req.body.code,
    item: req.body.item
  });
  res.send(await Printer.findOne({ where: { code: req.body.code, }, order: [['id', 'DESC']] }))
})

app.get('/loanOut/:id/:name', async (req, res) => {
  await Printer.update({ utlånt: true }, { where: { id: req.params.id } })
  await Printer.update({ name: req.params.name }, { where: { id: req.params.id } })
  res.send({ status: "okidoki" })
})

app.get('/getIn/:id', async (req, res) => {
  await Printer.update({ utlånt: false }, { where: { id: req.params.id } })
  await Printer.update({ name: "Tom bombadil" }, { where: { id: req.params.id } })
  res.send({ status: "okidoki" })
})

app.get('/:code', async (req, res) => {
  await Printer.destroy({ where: { code: req.params.code, } })
  res.send("Kult")
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})