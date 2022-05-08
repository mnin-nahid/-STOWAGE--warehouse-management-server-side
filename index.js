const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

//middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@cluster0.rxj83.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const productCollection = client.db('Inventorie').collection('products');


        //Products API
        app.get('/product', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });
        //Single Product API
        app.get('/product/:productid', async (req, res)=>{
            const productId = req.params.productid;
            const query = {_id: ObjectId(productId)};
            const product = await productCollection.findOne(query);
            res.send(product);
        })
    
        //POST API
        app.post('/product', async (req, res) => {
            const newProduct = req.body;
            const result = await productCollection.insertOne(newProduct);
            res.send(result);
        });

        //Delete API
        app.delete('/product/:productid', async (req, res) => {
            const id = req.params.productid;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.send(result);
        })
    }
    finally {
        //finall work!!
    }
};

run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('server is running...');
});



app.listen(port, () => {
    console.log('Listening to port', port);
});