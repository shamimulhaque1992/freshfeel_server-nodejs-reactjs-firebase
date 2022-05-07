const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//Middleware
app.use(cors());
app.use(express.json());

//Connect the database

const uri = `mongodb+srv://${process.env.DB_ITEMS}:${process.env.DB_PASS}@cluster0.9zbl9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    await client.connect();
    const productCollection = client.db("fragrance").collection("product");

    //Authintication operation
    app.post("/login", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
        expiresIn: "1d",
      });
      res.send({ token });
    });

    function verifyJWT(req, res, next) {
      const authHeader = req.headers.authorization;
      console.log(authHeader);
      if (!authHeader) {
        return res
          .status(401)
          .send({ message: "Invalid authorization header" });
      }
      const authtoken = authHeader.split(" ")[1];
      jwt.verify(authtoken, process.env.ACCESS_TOKEN, (err, decoded) => {
        if (err) {
          return res.status(403).send({ message: "forbidden access token" });
        }
        console.log("decoded", decoded);
        req.decoded = decoded;
      });
      next();
    }

    //Getting all Product
    app.get("/product", async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });

    //Getting a single product Product
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.send(product);
    });

    //Getting all Product of specific user
    app.get("/addedproduct", verifyJWT, async (req, res) => {
      /* const authHeader = req.headers.authorization;
      console.log(authHeader); */
      const decodedEmail = req.decoded.email;
      const email = req.query.email;
      if (email === decodedEmail) {
        const query = { supplyerEmail: email };
        const cursor = productCollection.find(query);
        const products = await cursor.toArray();
        res.send(products);
      }
      else {
          res.status(403).send({message: "forbidden access"})
      }
    });

    //Getting a single product Product of specific user
    app.get("/addedproduct/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.send(product);
    });

    //Get product info of specific id
    app.get("/updateitem/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.send(product);
    });

    //Updating specific product quantity
    app.put("/updateitem/:id", async (req, res) => {
      console.log(req.body);
      const id = req.params.id;
      const updatedProduct = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedInfo = {
        $set: {
          quantity: updatedProduct.updatedQuentity,
        },
      };
      const result = await productCollection.updateOne(
        filter,
        updatedInfo,
        options
      );
      res.send(result);
    });

    // deleting a product
    app.delete("/product/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.send(result);
    });
    // deleting a product of specific user
    app.delete("/addedproduct/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.send(result);
    });

    // POST Operation (adding product operation)
    app.post("/product", async (req, res) => {
      const newProduct = req.body;
      const result = await productCollection.insertOne(newProduct);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

//root
app.get("/", (req, res) => {
  res.send("Fregrance server is running");
});

app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});
