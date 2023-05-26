const express = require("express");
const router = express.Router();
const controllers = require("../controllers/wallet");
const middlewares = require("../middlewares/auth");

router.get("/", controllers.get_started);
router.post("/register", controllers.register);
router.get("/verify/:id", controllers.verify);
router.post("/login", controllers.login);
router.post("/initialize/payment", middlewares.authenticateToken, controllers.initialize_payment);
router.post("/confirm", middlewares.authenticateToken, controllers.verify_payment);
router.post("/topup", middlewares.authenticateToken, controllers.top_up);


module.exports = router;