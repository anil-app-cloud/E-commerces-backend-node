const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();
const port = 3005;

app.use(cors()); 
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.header("Content-Type", "application/json; charset=UTF-8");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "*");
    next();
});

const apiRoutes = require('./apiprocess');
app.use('/api', apiRoutes);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
