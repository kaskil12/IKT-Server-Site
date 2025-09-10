const express = require('express');
const cors = require('cors');
const snmp = require('net-snmp');
const app = express();
const port = 64;
const sequelizeDB = require("./database.js");
const Printer = require("./models/Printer.js");
Printer.init(sequelizeDB);
Printer.sync({ force: true });


app.use(cors());
app.use(express.json());
app.use(express.static('public'))


app.get('/getAll', async (req, res) => {

  res.send(await Printer.findAll())
})
app.get('/snmp-data', async (req, res) => {
  const host = '10.230.144.43';
  const community = 'public';
  const oids = ["1.3.6.1.2.1.43.11.1.1.9.1.2"];

  const session = snmp.createSession(host, community);

  try {
    const varbinds = await new Promise((resolve, reject) => {
      session.get(oids, (error, varbinds) => {
        if (error) {
          reject(error);
        } else {
          resolve(varbinds);
        }
      });
    });

    const snmpData = varbinds.map(vb => ({
      oid: vb.oid,
      value: vb.value.toString()
    }));
    res.json(snmpData);
  } catch (error) {
    console.error("SNMP Error:", error.message);
    res.status(500).send("Error fetching SNMP data.");
  } finally {
    session.close();
  }
});

app.listen(port, () => {
  console.log(`Express app listening at http://localhost:${port}`);
});

app.post('/add', async (req, res) => {
  Printer.create({
    code: req.body.code,
    item: req.body.item
  });
  res.send(await Printer.findOne({ where: { code: req.body.code, }, order: [['id', 'DESC']] }))
})

// app.get('/loanOut/:id/:name', async (req, res) => {
//   await Printer.update({ utlånt: true }, { where: { id: req.params.id } })
//   await Printer.update({ name: req.params.name }, { where: { id: req.params.id } })
//   res.send({ status: "okidoki" })
// })

// app.get('/getIn/:id', async (req, res) => {
//   await Printer.update({ utlånt: false }, { where: { id: req.params.id } })
//   await Printer.update({ name: "Tom bombadil" }, { where: { id: req.params.id } })
//   res.send({ status: "okidoki" })
// })

// app.get('/:code', async (req, res) => {
//   await Printer.destroy({ where: { code: req.params.code, } })
//   res.send("Kult")
// })

