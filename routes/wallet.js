const express = require("express");
const router = express.Router();
const controllers = require("../controllers/wallet");
const auth = require("../middlewares/auth");
const balances = require("../middlewares/balances");

router.get("/", controllers.get_started);
router.post("/register", controllers.register);
router.get("/verify/:id", controllers.verify);
router.post("/login", controllers.login);
router.route("/reset/password").post(controllers.forgotten_password);
router.route("/reset/password/:id/:u_str").get(controllers.reset_password);
router.route("/get_new_pass/:id/:u_str").post(controllers.get_new_pass);
router.post("/dashboard/flutterwallet", auth.authenticateToken, controllers.flutterWallet);
router.get("/dashboard/flutterpaymentcheck", auth.authenticateToken, controllers.flutterPaymentCheck);
router.post("/dashboard/topup", [auth.authenticateToken, auth.topup_token, balances.topup_balance], controllers.top_up);
router.get("/dashboard/utility/", [auth.authenticateToken, auth.util_token], controllers.electricity_util);
router.post("/dashboard/utility/", [auth.authenticateToken, auth.util_token, balances.util_balance], controllers.electricity_payment);
router.post("/dashboard/utility/verify", [auth.authenticateToken, auth.util_token], controllers.electricity_verification);
router.post("/dashboard/transfer/", auth.authenticateToken, controllers.transfer);
router.post("/dashboard/withdrawal/", auth.authenticateToken, controllers.withdraw);
router.post("/dashboard/giftcards/", [auth.authenticateToken, auth.gift_token], controllers.getAvailable);
router.post("/dashboard/giftcards/order", [auth.authenticateToken, auth.gift_token, balances.gift_balance], controllers.orderGiftcard);



module.exports = router;