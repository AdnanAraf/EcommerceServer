const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.z0a0ula.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    const categoriescollection = client
      .db("ToysMarket")
      .collection("CategoriesCollection");
    const ProductCollection = client.db("ToysMarket").collection("ToysData");
    const Allproductcollection = client
      .db("ToysMarket")
      .collection("AllProduct");

    const cartcollection = client.db("ToysMarket").collection("carts");

    const Wishlistcollection = client.db("ToysMarket").collection("WishCart");

    app.get("/CategoriesCollection", async (req, res) => {
      const result = await categoriescollection.find().toArray();
      res.send(result);
    });

    app.get("/ToysData", async (req, res) => {
      const result = await ProductCollection.find().limit(20).toArray();
      res.send(result);
    });

    app.get("/ToysData/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await ProductCollection.findOne(query);
      res.send(result);
    });

    app.get("/AllProduct/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await Allproductcollection.findOne(query);
      res.send(result);
    });

    app.get("/myToys/:email", async (req, res) => {
      // console.log(req.params.email);
      const jobs = await ProductCollection.find({
        email: req.params.email,
      })
        .sort({ price: -1 })
        .toArray();
      res.send(jobs);
    });

    app.get("/AllProduct", async (req, res) => {
      const query = {};
      const sort = req.query.sort;
      const options = {
        // sort matched documents in descending order by rating
        sort: { price: sort === "asc" ? 1 : -1 },
        // Include only the `title` and `imdb` fields in the returned document
      };
      const result = await Allproductcollection.find(query, options).toArray();
      res.send(result);
    });

    app.get("/getJobsByText/:text", async (req, res) => {
      const text = req.params.text;
      const result = await ProductCollection.find({
        $or: [
          { title: { $regex: text, $options: "i" } },
          { Toyname: { $regex: text, $options: "i" } },
          { price: { $regex: text, $options: "i" } },
        ],
      }).toArray();
      res.send(result);
    });

    app.get("/AllProduct", async (req, res) => {
      const result = await Allproductcollection.find().toArray();
      res.send(result);
    });

    app.post("/ToysData", async (req, res) => {
      const booking = req.body;
      const result = await ProductCollection.insertOne(booking);
      res.send(result);
    });
    /////////////////////// WishCart/////////////////////////////////////////
    app.post("/WishCart", async (req, res) => {
      const productitem = req.body;
      const existdata = await Wishlistcollection.findOne(productitem);
      if (!existdata) {
        const result = await Wishlistcollection.insertOne(productitem);
        res.send(result);
      } else {
      }
    });

    app.get("/WishCart", async (req, res) => {
      const result = await Wishlistcollection.find().toArray();
      res.send(result);
    });

    //////////////////////////Cart///////////////////////////////////////

    app.post("/carts", async (req, res) => {
      const cartItem = req.body;
      const existdata = await cartcollection.findOne(cartItem);
      // console.log(existdata);
      if (!existdata) {
        const result = await cartcollection.insertOne(cartItem);
        res.send(result);
      } else {
        console.log("ache");
      }
    });

    app.get("/carts", async (req, res) => {
      const email = req.query.email;

      if (!email) {
        res.send([]);
      }
      const query = { email: email };
      const result = await cartcollection.find(query).toArray();
      res.send(result);
    });

    app.get("/carts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartcollection.find(query).toArray();

      res.send(result);
    });

    app.put("/carts/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedToys = req.body;

      const Toys = {
        $set: {
          Count: updatedToys.Count,
        },
      };

      const result = await cartcollection.updateOne(filter, Toys, options);
      res.send(result);
    });

    app.delete("/carts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartcollection.deleteOne(query);
      res.send(result);
    });

    ///// Delete /////
    app.delete("/ToysData/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await ProductCollection.deleteOne(query);
      res.send(result);
    });

    /////Update//////
    app.put("/ToysData/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedToys = req.body;

      const Toys = {
        $set: {
          quantity: updatedToys.quantity,
          price: updatedToys.price,
          details: updatedToys.details,
        },
      };

      const result = await ProductCollection.updateOne(filter, Toys, options);
      res.send(result);
    });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Toys !");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
