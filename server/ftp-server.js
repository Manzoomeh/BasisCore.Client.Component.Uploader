const express = require("express");
const fileUpload = require("express-fileupload");
const router = express.Router();
router.use(express.json());
router.use(fileUpload());

const widgets = [
  {
    id: "userWidget1.html",
    title: "ویجت داشبورد",
    imageUrl: "userWidget1",
  },
  {
    id: "external-file.html",
    title: "اکسترنال ویجت",
    imageUrl: "externalFile",
  },
];

router.get("/list", function (req, res) {
  res.json(widgets);
});

router.post("/add", function (req, res) {
  console.table(req.query);
  console.log(req.files);
  res.send("ok");
});
module.exports = router;
