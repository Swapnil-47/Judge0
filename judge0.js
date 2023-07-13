// Import dependencies
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const bcrypt = require('bcrypt')
require('dotenv').config()


// Create Express application
const app = express();

// Configure JSON body parsing
app.use(express.json());

const bodyParser = require('body-parser');

app.use(bodyParser.text());

// Connect to MongoDB
mongoose.connect(process.env.MONG_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Defined Mongoose schema and model
const submissionSchema = new mongoose.Schema({
  code: String,
  output: String,
});
const Submission = mongoose.model('Submission', submissionSchema);

// model for new User

const userSchema = new mongoose.Schema({
    email: String,
    hash: String
  });
  const User = mongoose.model('User', userSchema);

// Define API routes

// Route for user registration
app.post('/register', (req, res) => {
  // Handling user registration logic here
  // ...
  if(req.body.email && req.body.password){
  const { email, password } = req.body;
  bcrypt.hash(password ,10).then(hash =>{
    const user = new User({ email, hash });
    console.log(hash)
    user.save();
    })
    .catch(()=>{
        res.status(400).json({
            message:"Something went wrong :("
        })
    })
  }
  else{
    res.json({
        message:"invalid fields entered !!!"
    })
  }
    
  // Returning success response
  res.json({ message: 'User registered successfully.' });
});

// Route for user login
app.post('/login', (req, res) => {
    const { email, password } = req.body;
  
    User.findOne({ email: email })
      .then((doc) => {
        if (!doc) {
          res.status(404).json({
            message: 'User not found',
          });
          return;
        }
  
        bcrypt.compare(password, doc.hash)
          .then((result) => {
            if (!result) {
              res.status(401).json({
                message: 'Authentication failed',
              });
              return;
            }
  
            const token = jwt.sign({ email: doc.email }, 'Secret-Thing', {
              expiresIn: '1h',
            });
  
            res.status(200).json({
              token: token,
              message: 'User is authenticated and token is received! (Attach this token to every request header)',
              email: doc.email,
            });
          })
          .catch((err) => {
            console.log('Error comparing passwords:', err);
            res.status(500).json({ error: 'Error comparing passwords' });
          });
      })
      .catch((err) => {
        console.log('Error finding user:', err);
        res.status(500).json({ error: 'Error finding user' });
      });
  });
  
  

// Middleware for token authentication
function authenticateToken(req, res, next) {
    try{
        const token = req.headers.authorization.split(" ")[1];
        // console.log(token);
        jwt.verify(token,"Secret-Thing");
        console.log('user Authenticated from AuthJS')
        next();
      }
      catch(error){
        console.log(error);
        res.status(401).json({
          message:'You are not Authorized to access this page'
        })
      }
}

// Protected route for code submission
app.post('/submit', authenticateToken, async (req, res) => {

    // const JAVA_KEY = "62";
    // const CPP_KEY = "53";
    // const PYTHON_KEY = "70";
    console.log('Selected language id' + req.query.id)
    
    const code = req.body;
    console.log(code)
  // Save the submission in the database


  try {
    // Execute the code using Judge0 API
    // First Request
    const response = await axios.post('https://judge0-ce.p.rapidapi.com/submissions', {
      source_code: code,
      language_id: req.query.id, // Replace with the appropriate language ID
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': 'ae8be792bamsh89c535c3467ef4bp1a3552jsn19a2fb69d917',
      },
    });

    const submissionId = response.data.token;
    console.log('The token is :'+submissionId)
    const secondUrl = 'https://judge0-ce.p.rapidapi.com/submissions/'+submissionId+'?fields=*';
    const options2 = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': 'ae8be792bamsh89c535c3467ef4bp1a3552jsn19a2fb69d917',
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
        }
    };

    try {
        await new Promise((resolve) => setTimeout(resolve, 4000)); // 7 seconds delay
    
        const response2 = await fetch(secondUrl, options2);
        const result2 = await response2.text();
        
        const data = JSON.parse(result2);
        const stdoutValue = data.stdout;
        console.log(stdoutValue);
        const output = stdoutValue
        res.json({ message: 'Code submitted successfully.',
            output: output });
            const submission = new Submission({ code, output });
            submission.save()
    
    } catch (error) {
        console.log(error);
    }

  } 
    catch (error) {
    console.error('Error executing code: ', error);
    res.status(500).json({ error: 'Failed to execute code.' });
  }
});



// Route for retrieving code submissions and results
app.get('/submissions', authenticateToken, async (req, res) => {


  try {
    // Retrieve submissions from the database for the authenticated user
    Submission.find({}).then((documents)=>{
      console.log(documents);
        res.json(documents)
    })
    .catch((err)=>{
      console.log('An error Occured: '+ err);
      res.json({
        message:'No Submissions found'
      })
    })

  } catch (error) {
    console.error('Error retrieving submissions:', error);
    res.status(500).json({ error: 'Failed to retrieve submissions.' });
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
