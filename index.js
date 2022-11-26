const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
require('dotenv').config();

const app = express();

app.use(cors())
app.use(express.json())


const uri = process.env.URI;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



function verifyJWT(req, res, next) {
  // console.log(req);
  const userJwtToken = req.headers.authorization;

  if (!userJwtToken) {
    return res.status(401).send({
      success: false,
      message: "Unauthorized access."
    })
  }

  const token = userJwtToken.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({
        success: false,
        message: 'Forbidden access.'
      })
    }
    req.decoded = decoded;
    next();
  })
};



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


const Services = client.db('aero-db').collection('services');
const Categories = client.db('aero-db').collection('categories');
const Bookings = client.db('aero-db').collection('bookings');
const Users = client.db('aero-db').collection('users');


// Verify Admin
function verifyJWT(req, res, next) {
  // console.log(req);
  const userJwtToken = req.headers.authorization;

  if (!userJwtToken) {
    return res.status(401).send({
      success: false,
      message: "Unauthorized access."
    })
  }

  const token = userJwtToken.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({
        success: false,
        message: 'Forbidden access.'
      })
    }
    req.decoded = decoded;
    next();
  })
};



//services APi
app.get('/services', async (req, res) => {
  try {
    const services = await Services.find({}).toArray();
    res.send({
      success: true,
      data: services
    })
  } catch (error) {
    console.log(error.name, error.message);
    res.send({
      success: false,
      error: error.message
    })
  }
})


app.get('/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Services.find({ category_id: Number(id) }).toArray();
    res.send({
      success: true,
      data: service
    })
  } catch (error) {
    console.log(error.name, error.message);
    res.send({
      success: false,
      error: error.message
    })
  }
})


//Category API
app.get('/categories', async (req, res) => {
  try {
    const category = await Categories.find({}).toArray();
    res.send({
      success: true,
      data: category
    })
  } catch (error) {
    console.log(error.name, error.message);
    res.send({
      success: false,
      error: error.message
    })
  }
})





//Saved user in DB
app.post('/users', async (req, res) => {
  try {
    console.log('body', req.body);
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


// get Token
app.get('/jwt', async (req, res) => {
  const email = req.query.email;
  const user = await Users.findOne({ email: email });

  console.log(user);

  if (user) {
    const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1d' })
    return res.send({
      success: true,
      token: token
    })
  }
  res.status(403).send({
    token: 'Unauthorized access'
  })
});


// Get Admin 

app.get('/users/admin/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const user = await Users.findOne({ email })
    res.send({ isAdmin: user?.role === 'Admin' })
  } catch (error) {
    console.log(error.message);
    res.send({
      success: false,
      error: error.message
    })
  }
})



app.get('/users/:email', async (req, res) => {
  try {
    const { email } = req.params

    const result = await Users.findOne({ email: email })
    console.log(result);

    res.send({
      success: true,
      data: result
    })

  } catch (error) {
    res.send({
      success: false,
      error: error.message
    })
  }
})



// Get all Sellers API
app.get('/all-sellers', async (req, res) => {
  try {
    const sellers = await Users.find({ role: 'Seller' }).toArray();
    res.send({
      success: true,
      data: sellers
    })
  } catch (error) {
    console.log(error.name, error.message);
    res.send({
      success: false,
      error: error.message
    })
  }
})


// Delete Seller 

app.delete('/all-sellers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const user = await Users.deleteOne({ _id: ObjectId(id) });
    res.send({
      success: true,
      data: user
    })
  } catch (error) {
    console.log(error.name, error.message);
    res.send({
      success: false,
      error: error.message
    })
  }
})




app.post('/bookings', verifyJWT, async (req, res) => {
  try {
    const booking = req.body;
    const query = {
      brand: booking.brand,
      email: booking.userEmail,
      name: booking.name
    }
    const allReadyBooked = await Bookings.find(query).toArray();
    if (allReadyBooked?.length) {
      const message = `You already have a booking on ${booking.brand, booking.name}`
      res.send({ success: false, message })
      return;
    }
    const result = await Bookings.insertOne(booking);
    // console.log(result);
    res.send({
      success: true,
      data: result
    })
  } catch (error) {
    console.log(error.name, error.message);
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