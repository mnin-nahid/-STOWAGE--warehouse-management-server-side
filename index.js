const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

//middleware
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization || req.body.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbiden access' });
        }
        req.decoded = decoded;
        next();
    })
}


const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@cluster0.rxj83.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const productCollection = client.db('Inventorie').collection('products');
        const serviceCollection = client.db('Inventorie').collection('service');

        //AUTH API
        app.post('/signin', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '2d'
            })
            res.send({ accessToken });
        })
        //Products API
        app.get('/product', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });
        //Single Product API
        app.get('/product/:productid', async (req, res) => {
            const productId = req.params.productid;
            const query = { _id: ObjectId(productId) };
            const product = await productCollection.findOne(query);
            res.send(product);
        })

        //POST API
        app.post('/product', async (req, res) => {
            const newProduct = req.body;
            const result = await productCollection.insertOne(newProduct);
            res.send(result);
        });

        //update API
        app.put('/product/:productid', async (req, res) => {
            const id = req.params.productid;
            const data = req.body.quantity;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity: data,
                },
            };
            const result = await productCollection.updateOne(filter, updateDoc, options);
            res.send(result);


        });

        //my items
        app.get('/myitems/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            const decodedEmail = req.decoded.email;
            // const filter = { email: email };
            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = productCollection.find(query);
                const products = await cursor.toArray();
                res.send(products);
            }
            else {
                res.status(403).send({ message: 'forbiden access' })
            }
        })

        //Delete API
        app.delete('/product/:productid', async (req, res) => {
            const id = req.params.productid;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.send(result);
        })

        //service api
        app.get('/service', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const service = await cursor.toArray();
            res.send(service);
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
app.get('/test', (req, res) => {
    res.send('server is running...teessstt');
});



app.listen(port, () => {
    console.log('Listening to port', port);
});