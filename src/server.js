const express = require('express');
const bodyParser = require('body-parser');
const winston = require('winston');
const path = require('path');

// Set up Winston logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: path.join(__dirname, '../logs/server.log') }),
        new winston.transports.Console()
    ]
});

const app = express();
const port = 4000; // Changed port from 3000 to 4000

app.use(bodyParser.json());

let games = [];
let devKeys = [];
let licenseKeys = [];

// Function to log messages
function logMessage(message) {
    logger.info(message);
}

// Register Game
app.post('/register', (req, res) => {
    const { gameName } = req.body;
    games.push({ gameName });
    logMessage(`Game registered: ${gameName}`);
    res.status(201).send({ message: 'Game registered', gameName });
});

// Add Dev Key
app.post('/add-dev-key', (req, res) => {
    const { username, password } = req.body;
    const devKey = `${username}-${password}-${Date.now()}`;
    devKeys.push({ username, devKey });
    logMessage(`Dev key added for user: ${username}`);
    res.status(201).send({ message: 'Dev key added', devKey });
});

// Enter Game with Dev Key
app.get('/enter-game/:devKey', (req, res) => {
    const { devKey } = req.params;
    const devKeyEntry = devKeys.find(key => key.devKey === devKey);
    if (devKeyEntry) {
        logMessage(`Entered game with dev key: ${devKey}`);
        res.status(200).send({ message: 'Entered game', devKey });
    } else {
        logMessage(`Failed attempt to enter game with dev key: ${devKey}`);
        res.status(404).send({ message: 'Dev key not found' });
    }
});

// Add License Key
app.post('/add-license-key', (req, res) => {
    const { licenseKey } = req.body;
    licenseKeys.push({ licenseKey });
    logMessage(`License key added: ${licenseKey}`);
    res.status(201).send({ message: 'License key added', licenseKey });
});

app.listen(port, () => {
    logMessage(`Server started on port ${port}`);
    console.log(`Server running at http://localhost:${port}`);
});
