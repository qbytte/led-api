const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const port = process.env.PORT;
const connection_url = process.env.CONNECTION_URL;

const app = express();

app.use(cors());

MongoClient.connect(connection_url)
  .then(async (client) => {
    console.log("Connected to mongo");

    const db = client.db("led-db");
    const status_collection = db.collection("status_collection");
    const led = await status_collection.findOne();

    if (!led) {
      status_collection
        .insertOne({
          led: false,
        })
        .then((results) => console.log(`Inserted ${results} in db`))
        .catch((error) => console.error(error));
    }

    app.get("/", (req, res) => {
      res.send("Server running");
    });

    app.get("/led_status", (req, res) => {
      status_collection
        .findOne()
        .then((results) => {
          console.log(results);
          res.json(results);
        })
        .catch((error) => console.error(error));
    });

    app.patch("/led_status/update", async (req, res) => {
      const prevStatus = await status_collection.findOne();
      console.log(prevStatus)
      status_collection
        .findOneAndUpdate(prevStatus, {
          $set: {
            led: !prevStatus.led,
          },
        })
        .then((results) => res.json("Success"))
        .catch((error) => console.error(error));
    });
  })
  .catch((error) => console.error(error));

app.listen(port, () => console.log(`Server running in port ${port}`));
