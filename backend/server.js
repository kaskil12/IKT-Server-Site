const express = require('express');
const cors = require('cors');
const snmp = require('net-snmp');
const app = express();
const port = 64;
const sequelizeDB = require("./database.js");
const Printer = require("./models/Printer.js");
Printer.init(sequelizeDB);
Printer.sync({ force: true }).then(() => {
  updatePrintersStatus();
  setInterval(updatePrintersStatus, 5 * 60 * 1000);

  app.listen(port, () => {
    console.log(`Express app listening at http://localhost:${port}`);
  });
});


app.use(cors());
app.use(express.json());
app.use(express.static('public'))


app.get('/getAll', async (req, res) => {

  res.send(await Printer.findAll())
})
const updatePrintersStatus = async () => {
  const printers = await Printer.findAll();
  for (const printer of printers) {
    const oids = printer.oids || [];
    const ip = printer.PrinterIP;
    if (!ip || !Array.isArray(oids) || oids.length === 0) continue;

    const session = snmp.createSession(ip, "public");
    const oidNumbers = oids.map(oid => oid.oid);
    
    session.get(oidNumbers, async (error, varbinds) => {
      if (error) {
        await Printer.update({ online: false }, { where: { id: printer.id } });
      } else {
        const updatedOids = oids.map(oidObj => {
          const varbind = varbinds.find(vb => vb.oid === oidObj.oid);
          return {
            name: oidObj.name,
            oid: oidObj.oid,
            value: varbind ? varbind.value : oidObj.value
          };
        });
        
        await Printer.update({
          online: true,
          oids: updatedOids
        }, { where: { id: printer.id } });
      }
      session.close();
    });
  }
};

app.post('/add', async (req, res) => {
  const { modell, serienummer, PrinterIP, plassering, oids, feilkode, online } = req.body;
  try {
    const formattedOids = oids.map(oid => ({
      name: oid.name,
      oid: oid.oid,
      value: null
    }));
    
    const printer = await Printer.create({
      modell,
      serienummer,
      PrinterIP,
      plassering,
      oids: formattedOids,
      feilkode,
      online
    });
    res.send(printer);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

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

