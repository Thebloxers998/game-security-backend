const express = require('express');
const bodyParser = require('body-parser');
const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Set up Winston logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: path.join(__dirname, '../logs/server.log'), level: 'info' }),
        new winston.transports.Console()
    ]
});

const app = express();
const port = 4000;

app.use(bodyParser.json());

let games = [];
let devKeys = [];
let licenseKeys = [];

// Function to log messages
function logMessage(level, message) {
    logger.log({ level, message });
}

// Register Game
app.post('/register', (req, res) => {
    const { gameName, owner } = req.body;
    games.push({ gameName, owner });
    logMessage('info', `Game registered: ${gameName}, Owner: ${owner}`);
    res.status(201).send({ message: 'Game registered', gameName, owner });
});

// Add Dev Key
app.post('/add-dev-key', (req, res) => {
    const { username, password } = req.body;
    const devKey = `${username}-${password}-${Date.now()}`;
    devKeys.push({ username, devKey });
    logMessage('info', `Dev key added for user: ${username}`);
    res.status(201).send({ message: 'Dev key added', devKey });
});

// Enter Game with Dev Key
app.get('/enter-game/:devKey', (req, res) => {
    const { devKey } = req.params;
    const devKeyEntry = devKeys.find(key => key.devKey === devKey);
    if (devKeyEntry) {
        logMessage('info', `Entered game with dev key: ${devKey}`);
        res.status(200).send({ message: 'Entered game', devKey });
    } else {
        logMessage('error', `Failed attempt to enter game with dev key: ${devKey}`);
        res.status(404).send({ message: 'Dev key not found' });
    }
});

// Add License Key
app.post('/add-license-key', (req, res) => {
    const { licenseKey } = req.body;
    licenseKeys.push({ licenseKey });
    logMessage('info', `License key added: ${licenseKey}`);
    res.status(201).send({ message: 'License key added', licenseKey });
});

// Export All Games Data
app.get('/export-all-games', (req, res) => {
    logMessage('info', 'Exporting all game data');
    const gamesData = JSON.stringify(games, null, 2);
    fs.writeFileSync(path.join(__dirname, '../logs/games.json'), gamesData);
    res.status(200).send({ message: 'All games data exported', games });
});

app.listen(port, '0.0.0.0', () => {
    logMessage('info', `Server started on port ${port}`);
    console.log(`Server running at http://0.0.0.0:${port}`);
});
