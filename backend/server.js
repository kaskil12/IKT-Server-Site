const express = require('express');
const cors = require('cors');
const snmp = require('net-snmp');
const http = require('http');
const socketio = require('socket.io');
const app = express();

app.use(cors());
app.use(express.json());

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
const SettingString = require("./models/SettingString.js");
const Users = require("./models/Users.js");
Printer.init(sequelizeDB);
SettingString.init(sequelizeDB);
Users.init(sequelizeDB);

Promise.all([
  Printer.sync(),
  SettingString.sync(),
  Users.sync()
]).then(async () => {
  try {
    const [adminUser, created] = await Users.findOrCreate({
      where: { username: 'admin' },
      defaults: { username: 'admin', password: 'admin123' }
    });
    if (created) {
      console.log('Default admin user created with username: admin, password: admin123');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }

  updatePrintersStatus();
  setInterval(updatePrintersStatus, 3 * 60 * 1000);

  server.listen(port, () => {
    console.log(`Express app listening at http://localhost:${port}`);
  });
});

app.get('/settings', async (req, res) => {
  try {
    const settings = await SettingString.findAll();
    res.json(settings.map(s => s.value));
  } catch (e) {
    res.status(500).json([]);
  }
});

app.post('/users/add', async (req, res) => {
  const { username, password } = req.body;
  if (!username || typeof username !== 'string' || !password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Missing username or password' });
  }
  try {
    const [user, created] = await Users.findOrCreate({ where: { username, password } });
    res.json({ username: user.username, created });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/users/all', async (req, res) => {
  try {
    const users = await Users.findAll();
    res.json(users.map(u => u.username));
  } catch (e) {
    res.status(500).json([]);
  }
});

app.post('/users/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || typeof username !== 'string' || !password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Missing username or password' });
  }
  try {
    const user = await Users.findOne({ where: { username, password } });
    if (user) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});



app.post('/settings/add', async (req, res) => {
  const { value } = req.body;
  if (!value || typeof value !== 'string') {
    return res.status(400).json({ error: 'Missing value' });
  }
  try {
    const [setting, created] = await SettingString.findOrCreate({ where: { value } });
    res.json({ value: setting.value, created });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.post('/settings/delete', async (req, res) => {
  const { value } = req.body;
  if (!value || typeof value !== 'string') {
    return res.status(400).json({ error: 'Missing value' });
  }
  try {
    const deleted = await SettingString.destroy({ where: { value } });
    res.json({ value, deleted: deleted > 0 });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

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

