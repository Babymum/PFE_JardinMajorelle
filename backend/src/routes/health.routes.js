const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

router.get("/", (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  // readyState Map: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const isMongoConnected = dbStatus === 1;

  if (!isMongoConnected) {
    return res.status(503).json({
      status: "DOWN",
      api: "UP",
      database: "DOWN",
      timestamp: new Date(),
    });
  }

  res.status(200).json({
    status: "UP",
    api: "UP",
    database: "UP",
    timestamp: new Date(),
  });
});

module.exports = router;
