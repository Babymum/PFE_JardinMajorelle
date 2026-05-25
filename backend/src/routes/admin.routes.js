const express = require("express");
const router = express.Router();
const { login } = require("../controllers/admin.controller");
const { validateLogin } = require("../middleware/validator");

router.post("/login", validateLogin, login);

module.exports = router;