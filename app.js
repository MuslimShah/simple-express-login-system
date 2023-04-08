const e = require('express');
const express = require('express');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const path = require('path')
const auth = require('./auth');

// Create a new Express application
const app = express();
app.set('view engine', 'ejs')

// Define middleware to use for sessions
app.use(session({
    secret: 'mysecretkey',
    resave: false,
    saveUninitialized: true
}));
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))

const users = [];

//checks for existing users
const userExists = (username) => {
    const exists = users.find(user => {
        return user.username === username
    })
    if (exists)
        return true;
    else
        return false;
}

//checks for valid users
const authenticateUser = (username, password) => {
    const validUser = users.find(user => {
        return user.username === username && user.password === password;
    });
    if (validUser)
        return true;
    else
        return false;
}

const checkValidInput = (username, password) => {
    if (!username || !password)
        return false;
    else
        return true;
}

// Define a route handler for the default home page
app.get('/login', (req, res) => {
    res.render('login')
});
app.get('/register', (req, res) => {
    res.render('register')
})
app.post('/register', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const user = {
        username: username,
        password: password
    };
    if (checkValidInput(username, password)) {
        if (!userExists(username)) {
            users.push(user);
            return res.render('doneRegistration')

        } else {
            return res.status(404).json({ msg: 'user already exists' })
        }
    } else {
        return res.json({ msg: 'invalid input for username and password' })
    }
});
app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const user = {
        username: username,
        password: password
    };

    if (checkValidInput(username, password)) {
        if (authenticateUser(username, password)) {
            const accessToken = jwt.sign({ user: user.username }, `${process.env.secretKey}`, { expiresIn: 100 })
            req.session.authorization = {
                accessToken,
                user: user.username
            }
            return res.render('welcome', { user })
        } else {
            res.redirect('/register')
        }
    } else {
        return res.json({ msg: 'invalid input for username and password' })
    }

})
app.get('/data', auth, (req, res) => {
    res.render('data')
})
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            res.json({ msg: 'something went wrong try agin!' })
        } else {
            res.redirect('/login');
        }
    });
});


// Start the server on port 3000
app.listen(3000, () => {
    console.log('Server started on port 3000');
});