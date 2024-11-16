const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  res.json("Test Endpoint")
  // const users = await UsersModel.findAll();
  // res.status(200).json({
  //   data: users,
  //   metadata: "Users Test Endpoint",
  // });
});

module.exports = router;
