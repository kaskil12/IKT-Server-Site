const express = require('express');
const cors = require('cors');
const snmp = require('net-snmp');
const http = require('http');
const socketio = require('socket.io');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const app = express();
const JWT_SECRET = 'your-secret-key-change-this-in-production';

const authenticateToken = (req, res, next) => {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};
app.use(cors({
  origin: 'http://10.230.17.52:3001',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

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
const Switcher = require('./models/Switcher.js');
Printer.init(sequelizeDB);
SettingString.init(sequelizeDB);
Users.init(sequelizeDB);
Switcher.init(sequelizeDB);


Promise.all([
  Printer.sync(),
  SettingString.sync(),
  Users.sync(),
  Switcher.sync()
]).then(async () => {
  try {
    const userCount = await Users.count();
    const [adminUser, created] = await Users.findOrCreate({
      where: { username: 'admin' },
      defaults: { username: 'admin', password: 'admin123', isAdmin: true }
    });
    if (created) {
      console.log('Default admin user created with username: admin, password: admin123');
    } else {
      if (!adminUser.isAdmin) {
        adminUser.isAdmin = true;
        await adminUser.save();
        console.log('Admin user updated to isAdmin: true');
      } else {
        console.log('Admin user already exists');
      }
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }

  updatePrintersStatus();
  setInterval(fetchtraffic, 1 * 10 * 1000);
  setInterval(updatePrintersStatus, 3 * 60 * 1000);

  server.listen(port, "0.0.0.0", () => {
    console.log(`Express app listening at http://localhost:${port}`);
  });
});

function requireAdmin(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}
app.post('/switcher/add', async (req, res) => {
  const { modell, ip, lokasjon, rack, trafikkMengde, online, oids, community, monitor } = req.body;
  try {
    const switcher = await Switcher.create({ modell, ip, lokasjon, rack, trafikkMengde, online, oids, community, monitor });
    res.status(201).json(switcher);
  } catch (error) {
    console.error('Error adding switcher:', error);
    res.status(500).json({ error: 'Failed to add switcher' });
  }
});
app.get('/switcher/all', async (req, res) => {
  try {
    const switchers = await Switcher.findAll();
    res.json(switchers);
  } catch (error) {
    console.error('Error fetching switchers:', error);
    res.status(500).json({ error: 'Failed to fetch switchers' });
  }
});
app.post('/switcher/update/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const switcher = await Switcher.findByPk(id);
    if (!switcher) {
      return res.status(404).json({ error: 'Switcher not found' });
    }
    Object.keys(req.body).forEach(key => {
      if (key in switcher) {
        switcher[key] = req.body[key];
      }
    });
    await switcher.save();
    res.json(switcher);
  } catch (error) {
    console.error('Error updating switcher:', error);
    res.status(500).json({ error: 'Failed to update switcher' });
  }
});
app.post('/switcher/delete/:id', async (req, res) => {
  const { id } = req.params;
  console.log("Deleting switcher with id:", id);
  try {
    const deleted = await Switcher.destroy({ where: { id } });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Switcher not found' });
    }
  } catch (error) {
    console.error('Error deleting switcher:', error);
    res.status(500).json({ error: 'Failed to delete switcher' });
  }
});


let switchTrafficHistory = {};

const fetchtraffic = async () => {
  const switchers = await Switcher.findAll({ where: { monitor: true } });
  let updatedSwitchers = [];
  for (const switcher of switchers) {
    const oids = switcher.oids || [];
    const incomingOidObj = oids.find(oid => oid.name.toLowerCase() === 'incoming');
    const outgoingOidObj = oids.find(oid => oid.name.toLowerCase() === 'outgoing');
    if (!incomingOidObj || !outgoingOidObj) {
      console.warn(`Switch ${switcher.id} is missing Incoming or Outgoing OID`);
      continue;
    }
    const incomingOid = incomingOidObj.oid;
    const outgoingOid = outgoingOidObj.oid;
    const speedOid = "1.3.6.1.2.1.2.2.1.5.4";
    const community = switcher.community || "public";
    let session1;
    try {
      session1 = snmp.createSession(switcher.ip, community);
    } catch (err) {
      console.error(`Failed to create SNMP session for switch ${switcher.id}:`, err);
      switcher.online = false;
      await switcher.save();
      updatedSwitchers.push(switcher);
      continue;
    }
    console.log(`Calling OIDs for switch ${switcher.id}: Incoming=${incomingOid}, Outgoing=${outgoingOid}, Community=${community}`);
    var incomingTraffic = 0;
    var outgoingTraffic = 0;
    var speedTraffic = 0;
    await new Promise(resolve => {
      session1.get([incomingOid, outgoingOid, speedOid], async (error, varbinds) => {
        if (error || !varbinds || varbinds.length < 2) {
          console.error(`Error fetching SNMP data for switch ${switcher.id}:`, error);
          switcher.online = false;
          await switcher.save();
          updatedSwitchers.push(switcher);
          session1.close();
          return resolve();
        }

        incomingTraffic = Number(varbinds[0]?.value) || 0;
        outgoingTraffic = Number(varbinds[1]?.value) || 0;
        speedTraffic = Number(varbinds[2]?.value) || 0;

        session1.close();
        resolve();
      });
    });

    // Wait before next SNMP call
    const interval = 5 * 1000; // 15 seconds
    await new Promise(resolve => setTimeout(resolve, interval));

    var incomingTraffic2 = 0;
    var outgoingTraffic2 = 0;
    var speedTraffic2 = 0;
    let session2;
    try {
      session2 = snmp.createSession(switcher.ip, community);
    } catch (err) {
      console.error(`Failed to create SNMP session for switch ${switcher.id} (second call):`, err);
      switcher.online = false;
      await switcher.save();
      updatedSwitchers.push(switcher);
      continue;
    }
    await new Promise(resolve => {
      session2.get([incomingOid, outgoingOid, speedOid], async (error, varbinds) => {
        if (error || !varbinds || varbinds.length < 2) {
          console.error(`Error fetching SNMP data for switch ${switcher.id}:`, error);
          switcher.online = false;
          await switcher.save();
          updatedSwitchers.push(switcher);
          session2.close();
          return resolve();
        }

        incomingTraffic2 = Number(varbinds[0]?.value) || 0;
        outgoingTraffic2 = Number(varbinds[1]?.value) || 0;
        speedTraffic2 = Number(varbinds[2]?.value) || 0;
        var deltaIn = incomingTraffic2 - incomingTraffic;
        var deltaOut = outgoingTraffic2 - outgoingTraffic;
        var inbps = (deltaIn * 8) / (interval / 1000);
        var outbps = (deltaOut * 8) / (interval / 1000);
        var inmbps = inbps / 1000000;
        var outmbps = outbps / 1000000;
        let totalTraffic2 = inmbps + outmbps;
        totalTraffic2 = Math.floor(totalTraffic2);
        totalTraffic2 = Math.round(totalTraffic2);
        switcher.trafikkMengde = totalTraffic2;
        switcher.online = true;
        await switcher.save();
        if (!switchTrafficHistory[switcher.id]) switchTrafficHistory[switcher.id] = [];
        switchTrafficHistory[switcher.id].push({
          timestamp: Date.now(),
          incoming: deltaIn,
          outgoing: deltaOut,
          total: totalTraffic2
        });
        updatedSwitchers.push(switcher);
        session2.close();
        resolve();
      });
    });
  }
  io.emit('switchersTrafficUpdate', {
    switchers: updatedSwitchers.map(s => s.toJSON()),
    trafficHistory: switchTrafficHistory
  });
};

app.get('/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await Users.findAll({ attributes: ['id', 'username', 'isAdmin'] });
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  const { username, password, isAdmin } = req.body;
  if (!username || typeof username !== 'string' || !password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Missing username or password' });
  }
  try {
    const [user, created] = await Users.findOrCreate({
      where: { username },
      defaults: { password, isAdmin: !!isAdmin }
    });
    if (!created) {
      return res.status(409).json({ error: 'User already exists' });
    }
    res.json({ id: user.id, username: user.username, isAdmin: user.isAdmin });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/admin/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { username, password, isAdmin } = req.body;
  try {
    const user = await Users.findByPk(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (username) user.username = username;
    if (typeof password === 'string' && password.length > 0) user.password = password;
    if (typeof isAdmin === 'boolean') user.isAdmin = isAdmin;
    await user.save();
    res.json({ id: user.id, username: user.username, isAdmin: user.isAdmin });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/admin/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const user = await Users.findByPk(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    await user.destroy();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
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
    const userCount = await Users.count();
    const [user, created] = await Users.findOrCreate({
      where: { username },
      defaults: { password, isAdmin: userCount === 0 }
    });
    res.json({ username: user.username, isAdmin: user.isAdmin, created });
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
      const token = jwt.sign(
        { id: user.id, username: user.username, isAdmin: user.isAdmin },
        JWT_SECRET,
        { expiresIn: '365d' }
      );
      res.cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 365 * 24 * 60 * 60 * 1000
      });
      res.json({ success: true, user: { id: user.id, username: user.username, isAdmin: user.isAdmin } });
    } else {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/users/logout', (req, res) => {
  res.clearCookie('authToken');
  res.json({ success: true, message: 'Logged out successfully' });
});

app.get('/users/me', authenticateToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

app.get('/users/check-auth', (req, res) => {
  const token = req.cookies.authToken;

  if (!token) {
    return res.json({ authenticated: false });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.json({ authenticated: false });
    }
    res.json({ authenticated: true, user: { id: user.id, username: user.username, isAdmin: user.isAdmin } });
  });
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

// const monitorbandwidth = async () => {
//   const switchers = await Switcher.findAll();
//   for (const switcher of switchers) {
//     const session = snmp.createSession(switcher.ip, "public");
//     const oids = switcher.oids || [];
//     let updatedOids = [];

//     const getOidValue = oidObj =>
//       new Promise(resolve => {
//         session.get([oidObj.oid], (error, varbinds) => {
//           if (error || !varbinds || varbinds.length === 0) {
//             resolve({
//               name: oidObj.name,
//               oid: oidObj.oid,
//               value: null
//             });
//           } else {
//             resolve({
//               name: oidObj.name,
//               oid: oidObj.oid,
//               value: varbinds[0].value
//             });
//           }
//         });

//       });

//     updatedOids = await Promise.all(oids.map(getOidValue));

//     await Switcher.update({
//       oids: updatedOids
//     }, { where: { id: switcher.id } });

//     session.close();
//   }
//   const allSwitchers = await Switcher.findAll();
//   io.emit('switchersUpdated', allSwitchers);
// };

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

