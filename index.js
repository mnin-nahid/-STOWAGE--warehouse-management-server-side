const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const port = process.env.PORT || 5000;

const app = express();

//middleware
app.use(cors());
app.use(express());



//DB connection
const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@stowage.sba66.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
    const collection = client.db("test").collection("devices");
    console.log('DB connected')
    // perform actions on the collection object
    client.close();
});


//root api
app.get('/', (req, res) => {
    res.send('Running STOWAGE server');
});


app.listen(port, () => {
    console.log('Listening to port', port);
});