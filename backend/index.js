const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { connectToDB, sql } = require('./dbConfig');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const usersRoutes = require('./routes/usersRoutes');
const postsRoutes  = require('./routes/postsRoutes');
const feedRoutes = require('./routes/feedRoutes');
const adsRoutes = require('./routes/adsRoutes');
const healthRoutes = require('./routes/healthRoutes');


dotenv.config();
const app = express();


app.use(cors());
app.use(bodyParser.json());


app.use('/api/auth', authRoutes);
app.use(express.json());
app.use('/api/users', usersRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/ads', adsRoutes);
app.use('/api/health', healthRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor en ejecución en puerto ${PORT}`));