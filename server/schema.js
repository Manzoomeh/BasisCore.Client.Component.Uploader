const fs = require("fs");
const path = require("path");
const express = require("express");
const router = express.Router();

router.get("/questions", function (req, res) {
  const stream = fs.createReadStream(
    path.join(__dirname, `/schemas/questions/${req.query.id}.json`)
  );
  stream.on("open", function () {
    res.set("Content-Type", "application/json");
    stream.pipe(res);
  });
  stream.on("error", function () {
    res.set("Content-Type", "text/plain");
    res.status(404).end("Not found");
  });
});

router.get("/answers", function (req, res) {
  const stream = fs.createReadStream(
    path.join(__dirname, `/schemas/answers/${req.query.id}.json`)
  );
  stream.on("open", function () {
    res.set("Content-Type", "application/json");
    stream.pipe(res);
  });
  stream.on("error", function () {
    res.set("Content-Type", "text/plain");
    res.status(404).end("Not found");
  });
});

module.exports = router;
