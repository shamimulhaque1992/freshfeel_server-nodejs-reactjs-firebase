const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require("cors");
require ('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


//Middleware
app.use(cors());
app.use(express.json());


//Connect the database


const uri = `mongodb+srv://${process.env.DB_ITEMS}:${process.env.DB_PASS}@cluster0.9zbl9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run(){
    try {
        await client.connect();
        const productCollection = client.db("fragrance").collection("product");


        //Get all Product
        app.get("/product", async(req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        })

        //Get product info of specific id
        app.get('/updateitem/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const product = await productCollection.findOne(query);
            res.send(product);
        })

        app.put('/updateitem/:id', async(req, res)=>{
            console.log(req.body);
            const id = req.params.id;
            const updatedProduct = req.body;
            const filter = {_id: ObjectId(id)};
            const options = {upsert: true};
            const updatedInfo = {
                $set:{
                    quantity: updatedProduct.updatedQuentity
                }
            }
            const result = await productCollection.updateOne(filter,updatedInfo, options);
            res.send(result);
        })

        // deleting a product
        app.delete('/product/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await productCollection.deleteOne(query);
            res.send(result);
        })

        // POST Operation
        app.post("/product", async(req, res)=>{

            const newProduct = req.body;
            const result = await productCollection.insertOne(newProduct);
            res.send(result);
        })
    }
    finally{

    }
}
run().catch(console.dir)

//root
app.get('/', (req, res)=>{
    res.send('Fregrance server is running')
})

app.listen(port, ()=>{
    console.log(`Listening to port ${port}`);
})