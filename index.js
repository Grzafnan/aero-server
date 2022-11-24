const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;
require('dotenv').config();

const app = express();

app.use(cors())
app.use(express.json())


const uri = process.env.URI;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


// function run = async
async function run() {
  try {
    await client.connect();
    console.log('Server connected');
  } catch (error) {
    console.log(error.message);
  }
}
run();


const Users = client.db('aero-db').collection('users');


app.post('/users', async (req, res) => {
  try {
    console.log(req.body);
    const isExists = await Users.findOne({ email: req.body.email })
    if (isExists) {
      return res.send({
        success: false,
        message: 'User already exists'
      })
    }

    const user = await Users.insertOne(req.body);
    console.log(user);

    res.send({
      success: true,
      data: user
    })
  } catch (error) {
    console.log(error);
    res.send({
      success: false,
      error: error.message
    })
  }
})



app.get('', async (req, res) => {
  res.send('Aero server in running...')
});

app.listen(port, () => {
  console.log(`Server listening on ${port}`)
})