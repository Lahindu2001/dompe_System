const express = require("express");
const router = express.Router();
//insert Model
const User = require("../Model/UserModel") ;
//insert user controller+
const UserController = require("../Controlers/UserControlers");
router.get("/",UserController.getAllUsers);
router.post("/",UserController.addUsers);
router.get("/:id",UserController.getbyId);
router.put("/:id",UserController.updateUser);
router.delete("/:id",UserController.deleteUser);
router.get("/reg/:reg_no", UserController.getByRegNo);
//export
module.exports = router;