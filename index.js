const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
dotenv.config()
const uri = process.env.MONGO_URI;


const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json())

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true, 
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const db = client.db("wanderlust");
    const destinationCollection = db.collection("destinations");
    const bookingCollection= db.collection("booking")
    app.get('/destination', async (req, res) => {
      const result = await destinationCollection.find().toArray();
      res.json(result)
    })

    app.post('/destination', async (req, res) => {
      const destinationsData = req.body;
      // console.log(destinationsData, "destination data in the server");
      const result = await destinationCollection.insertOne(destinationsData);
      res.send(result)
    })

    app.get("/destination/:id", (req, res, next) => {
      const header = req.headers.authorization;
      if (header === "logged in") {
        next()
      }
      else {
        res.status(401).json({message: "Unauthorized"})
      }
    } , async (req, res) => {
      const { id } = req.params;
      const result = await destinationCollection.findOne({ _id: new ObjectId(id) });
      res.json(result)
    })

    app.patch("/destination/:id", async (req, res) => {
      const { id } = req.params;
      const updatedData = req.body;

      const result = await destinationCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedData }
      )
      res.json(result)
    })

    app.delete("/destination/:id",async (req, res) => {
      const { id } = req.params;
      const result = await destinationCollection.deleteOne({
        _id: new ObjectId(id)
      })

      res.json(result);
    
    });

    app.get("/booking/:userId", async(req, res) => {
      const { userId } = req.params;
      console.log(req.params.userId);
      const result = await bookingCollection.find({ userId: userId }).toArray();
      res.json(result);
    })

    app.post("/booking", async (req, res) => {
      const bookingData = req.body;
      const result = await bookingCollection.insertOne(bookingData);
       res.json(result)
    })

    app.delete('/booking/:bookingId', async (req, res) => {
      const { bookingId } = req.params;
      const result = await bookingCollection.deleteOne({ _id: new ObjectId(bookingId) })
      
      res.json(result);
    })
 
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("Servser is running fine")
})

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}` );
})