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
  if (req.query) {
    console.table(req.query);
  }
  if (req.files) {
    console.table(
      Object.getOwnPropertyNames(req.files)
        .map((x) => req.files[x])
        .map((x) => {
          return {
            name: x.name,
            size: x.size,
            mime: x.mimetype,
          };
        })
    );
  }
  res.send("ok");
});
module.exports = router;
