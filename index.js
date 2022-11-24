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
console.log(uri);
// aeroDb
// rmjl13UR7u93PpTY

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



app.get('', async (req, res) => {
  res.send('Aero server in running...')
});

app.listen(port, () => {
  console.log(`Server listening on ${port}`)
})