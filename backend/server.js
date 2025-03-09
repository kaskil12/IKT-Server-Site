const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const port = 3001; // Change to an available port
const sequelizeDB = require("./database.js");
const Account = require("./models/Account.js");

Account.init(sequelizeDB);
Account.sync({ force: false }); // Change this line
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
const secretKey = "yourVerySecretKey"; // Change this to a secure key!

const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Access denied" });

  try {
    req.user = jwt.verify(token, secretKey);
    next(); // Move to the next middleware or route
  } catch {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

app.post('/verifyToken', authenticateToken, (req, res) => {
  // If the token is valid, `req.user` will contain the decoded information.
  res.json({ valid: true, user: req.user });
});



app.post('/add', authenticateToken, async (req, res) => {
  const { name, password, isAdmin } = req.body;
  console.log('Received data:', name, password, isAdmin);
  
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
    
    const newEntry = await Account.create({ 
      name, 
      password,
      isAdmin: isAdmin === true // Ensure it's a boolean
    });
    
    res.status(201).json(newEntry);
  } catch (error) {
    console.error('Error adding account:', error);
    res.status(500).send('Failed to add data');
  }
});
app.post('/login', async (req, res) => {
  const { name, password } = req.body;

  try {
    // Find the user in the database
    const user = await Account.findOne({ where: { name } });

    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate a JWT token that includes the isAdmin flag
    const token = jwt.sign(
      { id: user.id, name: user.name, isAdmin: user.isAdmin }, 
      secretKey, 
      { expiresIn: "1h" }
    );

    res.json({ token, isAdmin: user.isAdmin }); // Send the token and admin status
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
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
const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};
app.get('/getAll', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const data = await Account.findAll({ order: [['name', 'ASC']] });
    res.send(data);
  } catch (error) {
    console.error("Error fetching accounts:", error);
    res.status(500).send("Failed to fetch accounts");
  }
});
// New route to update an account by ID
app.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  const { name, password, isAdmin } = req.body;
  
  // Validate input
  if (!name) {
    return res.status(400).send('Name is required');
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
    if (password) {
      account.password = password;
    }
    account.isAdmin = isAdmin === true; // Ensure it's a boolean
    
    await account.save();
    
    res.status(200).json(account);
  } catch (error) {
    console.error('Error updating account:', error);
    res.status(500).send('Failed to update account');
  }
});
async function ensureDefaultAdmin() {
  try {
    // Check if admin account already exists
    const adminExists = await Account.findOne({ where: { name: 'kaskil' } });
    
    if (!adminExists) {
      // Create the default admin account
      await Account.create({
        name: 'kaskil',
        password: 'kaskil',
        isAdmin: true // Set as admin
      });
      console.log('Default admin account created');
    } else {
      // Ensure the existing account has admin privileges
      if (!adminExists.isAdmin) {
        adminExists.isAdmin = true;
        await adminExists.save();
        console.log('Updated existing account to admin');
      }
      console.log('Default admin account already exists');
    }
  } catch (error) {
    console.error('Error creating default admin account:', error);
  }
}
sequelizeDB.sync({ alter: true }).then(() => {
  console.log('Database synchronized');
  ensureDefaultAdmin();
}).catch(err => {
  console.error('Failed to sync database:', err);
});
// Initialize the database and create the admin account
sequelizeDB.sync().then(() => {
  console.log('Database synchronized');
  ensureDefaultAdmin();
}).catch(err => {
  console.error('Failed to sync database:', err);
});
app.listen(port, '0.0.0.0', () => {
  console.log(`Example app listening on port ${port}`);
});