const express = require('express');
const cors = require('cors');
const snmp = require('net-snmp');
const http = require('http');
const socketio = require('socket.io');
const app = express();
const port = 3000;
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
const sequelizeDB = require("./database.js");
const Printer = require("./models/Printer.js");
Printer.init(sequelizeDB);
Printer.sync().then(() => {
  updatePrintersStatus();
  setInterval(updatePrintersStatus, 3 * 60 * 1000);

  server.listen(port, () => {
    console.log(`Express app listening at http://localhost:${port}`);
  });
});


app.use(cors());
app.use(express.json());
app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});


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
    let updatedOids = [];

    const getOidValue = oidObj =>
      new Promise(resolve => {
        session.get([oidObj.oid], (error, varbinds) => {
          if (error || !varbinds || varbinds.length === 0) {
            resolve({
              name: oidObj.name,
              oid: oidObj.oid,
              value: null
            });
          } else {
            resolve({
              name: oidObj.name,
              oid: oidObj.oid,
              value: varbinds[0].value
            });
          }
        });
      });

    updatedOids = await Promise.all(oids.map(getOidValue));

    const online = updatedOids.some(oid => oid.value !== null);

    await Printer.update({
      online,
      oids: updatedOids
    }, { where: { id: printer.id } });

    session.close();
  }
  const allPrinters = await Printer.findAll();
  io.emit('printersUpdated', allPrinters);
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
app.post('/update', async (req, res) => {
  const { id, modell, serienummer, PrinterIP, plassering, oids, feilkode, online } = req.body;
  try {
    const printer = await Printer.findByPk(id);
    if (!printer) {
      return res.status(404).send({ error: "Printer not found" });
    }

    await Printer.update({
      modell,
      serienummer,
      PrinterIP,
      plassering,
      oids,
      feilkode,
      online
    }, { where: { id } });

    res.send({ status: "updated" });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.post('/delete', async (req, res) => {
  const { id } = req.body;

  try {
    await Printer.destroy({ where: { id } });
    res.send({ status: "deleted" });
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

