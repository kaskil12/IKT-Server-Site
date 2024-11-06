const express = require('express');
const cors = require('cors'); // Import the cors package
const app = express();
const port = 3000;
const sequelizeDB = require("./database.js");
const Liste = require("./models/Liste.js");

Liste.init(sequelizeDB);
Liste.sync({force: true});

app.use(cors()); // Enable CORS for all routes
app.use(express.json());
app.use(express.static('public'));

app.get('/getAll', async (req, res) => {
  const data = await Liste.findAll({
    order: [['dato', 'ASC']]  // Sort by the date (dato)
  });
  res.send(data);
});

app.post('/add', async (req, res) => {
  const { dato, antall } = req.body;
  console.log('Received data:', { dato, antall }); // Log received data

  // Validate input
  if (!dato || !antall) {
    return res.status(400).send('Date and amount are required');
  }

  try {
    const newEntry = await Liste.create({ dato, antall });
    res.status(201).json(newEntry);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to add data');
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});