const express = require('express');
const cors = require('cors');
require('dotenv').config();
const adminRoutes = require('./routes/admin.routes');

const app = express();
const PORT = process.env.PORT || 8002;

app.use(cors());
app.use(express.json());

app.use('/', adminRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Auth Admin Service is healthy' });
});

app.listen(PORT, () => {
  console.log(`Auth Admin Service running on port ${PORT}`);
});

