const express = require("express");
const router = express.Router();
const controllers = require("../controllers/wallet");
const auth = require("../middlewares/auth");
const balances = require("../middlewares/balances");

router.get("/", controllers.get_started);
router.get("/register", controllers.register_redirect);
router.get("/contact", controllers.contact_redirect);
router.get("/features", controllers.features);
router.get("/login", controllers.login_redirect);
router.get("/dashboard",  auth.authenticateToken, controllers.dashboard);
router.get("/airtime-transaction",  auth.authenticateToken, controllers.airtime_redirect);
router.get("/data-transaction",  auth.authenticateToken, controllers.data_redirect);
router.get("/cable-subscription",  auth.authenticateToken, controllers.cable_redirect);
router.get("/utility-billing-transaction",  auth.authenticateToken, controllers.electricity_redirect);
router.get("/betting-funding",  auth.authenticateToken, controllers.betting_redirect);
router.get("/transfer",  auth.authenticateToken, controllers.transfer_redirect);
router.get("/wallet-transfer",  auth.authenticateToken, controllers.wallet_transfer_redirect);
router.get("/bank-transfer",  auth.authenticateToken, controllers.banks_transfer_redirect);
router.get("/deposit",  auth.authenticateToken, controllers.deposit_redirect);
router.get("check-last-deposit", auth.authenticateToken, controllers.check_and_validate_deposit);
router.get("/settings",  auth.authenticateToken, controllers.settings_redirect);
router.get("/withdraw",  auth.authenticateToken, controllers.withdrawal_redirect);


router.get("/admin", controllers.admin);
router.get("/admin/dashboard/:start", auth.authenticateToken, controllers.admin_complaints);
router.get("/complaints/details/:id", auth.authenticateToken, controllers.admin_complaint);
router.get("/admin/search-transaction", auth.authenticateToken, controllers.search_transaction);
router.get("/admin/settings", auth.authenticateToken, controllers.admin_settings_redirect);
router.get("/admin/logout", auth.authenticateToken, controllers.admin_logout);
router.get("/admin/add-admin", auth.authenticateToken, controllers.add_admin_redirect);
router.get("/admin/send-email", auth.authenticateToken, controllers.admin_send_mail);
router.get("/admin/searches", auth.authenticateToken, controllers.admin_search);










router.post("/register", controllers.register);
router.get("/verify/:id/:uuid", controllers.verify);
router.get("/logout", auth.authenticateToken, controllers.logout);
router.post("/login", controllers.login);
router.route("/reset/password").post(controllers.forgotten_password);
router.route("/reset/password/:id/:u_str").get(controllers.reset_password);
router.route("/forgot/password/").get(controllers.forgot_password_redirect);
router.route("/get_new_pass/").post(controllers.get_new_pass);
router.post("/dashboard/flutterwallet", auth.authenticateToken, controllers.flutterWallet);
router.get("/dashboard/flutterpaymentcheck", auth.authenticateToken, controllers.flutterPaymentCheck);
router.post("/dashboard/topup", [auth.authenticateToken, auth.topup_token, balances.topup_balance], controllers.top_up);
router.post("/dashboard/get-airtime-network", [auth.authenticateToken, auth.topup_token], controllers.get_airtime_network);
router.post("/dashboard/get-data-network", [auth.authenticateToken, auth.topup_token], controllers.get_data_network);
router.get("/dashboard/get-betting-billers", [auth.authenticateToken, auth.sagecloud_token], controllers.betting_billers);
router.post("/dashboard/validate-betting-details", [auth.authenticateToken, auth.sagecloud_token], controllers.betting_validate);
router.post("/dashboard/fund-betting-wallet", [auth.authenticateToken, auth.sagecloud_token], controllers.betting_funder);
router.get("/dashboard/fetch_banks", [auth.authenticateToken, auth.sagecloud_token], controllers.fetch_banks);
router.post("/dashboard/verify-bank-details", [auth.authenticateToken, auth.sagecloud_token], controllers.verify_bank_details);
router.post("/dashboard/bank-transfer", [auth.authenticateToken, auth.sagecloud_token], controllers.bank_transfer);
router.post("/dashboard/get-cable-network", auth.authenticateToken, controllers.get_cable_network);
router.post("/dashboard/transfer/", auth.authenticateToken, controllers.transfer);
router.post("/dashboard/withdrawal/", [auth.authenticateToken, auth.sagecloud_token], controllers.withdraw);
router.post("/dashboard/buy/data", [auth.authenticateToken, auth.topup_token], controllers.buyData);
router.get("/dashboard/billers/electricity", auth.authenticateToken, controllers.electricity_details);
router.post("/dashboard/payment/electricity", auth.authenticateToken, controllers.electricity_payment);
router.post("/dashboard/edit-details", auth.authenticateToken, controllers.edit_details);
router.post("/dashboard/change-password", auth.authenticateToken, controllers.change_password);
router.post("/dashboard/change-pin", auth.authenticateToken, controllers.change_pin);
router.post("/dashboard/change-dp", auth.authenticateToken, controllers.change_dp);
router.post("/dashboard/payment/cables", auth.authenticateToken, controllers.cable_payment);
router.post("/initiate-deposit", auth.authenticateToken, controllers.initiate_deposit);
router.post("/authenticate-deposit", auth.authenticateToken, controllers.authenticate_deposit);
router.post("/validate-deposit", auth.authenticateToken, controllers.validate_deposit);
router.post("/support", auth.authenticateToken, controllers.support);




router.post("/admin/login", controllers.admin_login);
router.post("/admin/dashboard/get-complaints-by-email", auth.authenticateToken, controllers.search_complaint);
router.post("/admin/validate-deposit", auth.authenticateToken, controllers.admin_validate_deposit);
router.post("/admin/add", auth.authenticateToken, controllers.add_admin);
router.post("/admin/settings", auth.authenticateToken, controllers.admin_settings);


module.exports = router;