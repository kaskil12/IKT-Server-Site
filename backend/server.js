const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001; // Change to an available port
const sequelizeDB = require("./database.js");
const Account = require("./models/Account.js");
Account.init(sequelizeDB);
Account.sync({force: true});
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/getAll', async (req, res) => {
  try {
    const data = await Account.findAll({
      order: [['name', 'ASC']]
    });
    res.send(data);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).send('Failed to fetch accounts');
  }
});

app.post('/add', async (req, res) => {
  const { name, password } = req.body;
  console.log('Received data:', name, password);
  // Validate input
  if (!name || !password) {
    return res.status(400).send('Name and password are required');
  }
  try {
    // Check if the account already exists
    const existingAccount = await Account.findOne({ where: { name } });
    if (existingAccount) {
      return res.status(409).send('Account already exists');
    }
    const newEntry = await Account.create({ name, password });
    res.status(201).json(newEntry);
  } catch (error) {
    console.error('Error adding account:', error); // Log the error details
    res.status(500).send('Failed to add data');
  }
});

// New route to delete an account by ID
app.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const account = await Account.findByPk(id);
    if (!account) {
      return res.status(404).send('Account not found');
    }
    
    await account.destroy();
    res.status(200).send({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).send('Failed to delete account');
  }
});

// New route to update an account by ID
app.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  const { name, password } = req.body;
  
  // Validate input
  if (!name || !password) {
    return res.status(400).send('Name and password are required');
  }
  
  try {
    const account = await Account.findByPk(id);
    if (!account) {
      return res.status(404).send('Account not found');
    }
    
    // Check if the new name already exists for another account
    if (name !== account.name) {
      const existingAccount = await Account.findOne({ where: { name } });
      if (existingAccount && existingAccount.id !== parseInt(id)) {
        return res.status(409).send('An account with this name already exists');
      }
    }
    
    // Update the account
    account.name = name;
    account.password = password;
    await account.save();
    
    res.status(200).json(account);
  } catch (error) {
    console.error('Error updating account:', error);
    res.status(500).send('Failed to update account');
  }
});
 
app.listen(port, '0.0.0.0', () => {
  console.log(`Example app listening on port ${port}`);
});