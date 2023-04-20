require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.CONNECTION_URL;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
async function run() {
    try {
        // Connect the client to the server    (optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
run().catch(console.dir);

async function findAll() {
    const cursor = client.db("musicalbums").collection("albums").find();
    const results = await cursor.toArray();
    return JSON.stringify(results)
}

async function isAlbumInDatabase(title,artist) {
    try {
      await client.connect();
      const query = { title:title, artist_name:artist};
      const albumData = await client.db("musicalbums").collection("albums").findOne(query);
      return albumData !== null;
    } catch (error) {
      console.log(error);
      return false;
    }
}

app.post('/api/albums', async (req, res) => {
    
    const { title, artist } = req.body; // extract variables from request body
    console.log(req.body);
    await client.connect();
    console.log(await isAlbumInDatabase(title,artist));
})
//by title
app.get('/api/albums/:title', async (req, res) => {
    await client.connect();
    try {
      const albumData = await client.db('musicalbums').collection('albums').find({ title: req.params.title }).toArray();
      return albumData.length === 0 ? res.status(404).send('Album not found') : res.send(albumData);
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
    }
  });

//all
app.get('/api/albums', async (req, res) => {
    await client.connect();
    const albumsData = await findAll();
    res.send(albumsData);
})



app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '/index.html'));
})


app.listen(process.env.PORT, () => {
    console.log("Server listening on port: " + process.env.PORT)
})