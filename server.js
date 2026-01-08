const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

let users = [];

app.post('/signup', (req, res) => {
    const { fName, lName, uName, eMail, password } = req.body;

    // Check for duplicates
    const duplicate = users.find(user =>
        user.uName === uName || user.eMail === eMail || user.password === password
    );

    if (duplicate) {
        return res.status(400).json({ message: 'Username, email, or password already taken.' });
    }

    users.push({ fName, lName, uName, eMail, password });
    res.status(200).json({ message: 'User created successfully.' });
});

app.post('/login', (req, res) => {
    const { uName, password } = req.body;

    const user = users.find(user =>
        (user.uName === uName || user.eMail === uName) && user.password === password
    );

    if (user) {
        res.status(200).json({ message: 'Login successful.', user });
    } else {
        res.status(401).json({ message: 'Invalid credentials.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});