const User = require("../Model/UserModel");
// Get all users
const getAllUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find();
    } catch (err) {
        console.log(err);
    }
    if (!users) return res.status(404).json({ message: "Users not found" });
    return res.status(200).json({ shops: users });
};
// Insert user
const addUsers = async (req, res, next) => {
    const { shop_owner_name, shop_name, phone_number } = req.body;
    let user;
    try {
        user = new User({ shop_owner_name, shop_name, phone_number });
        await user.save();
    } catch (err) {
        console.log(err);
    }
    if (!user) return res.status(404).json({ message: "Unable to add user" });
    return res.status(200).json({ shop: user });
};
// Get user by ID
const getbyId = async (req, res, next) => {
    const id = req.params.id;
    let user;
    try {
        user = await User.findById(id);
    } catch (err) {
        console.log(err);
    }
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ shop: user });
};
// Update user
const updateUser = async (req, res, next) => {
    const id = req.params.id;
    const { shop_owner_name, shop_name, phone_number } = req.body;
    let user;
    try {
        user = await User.findByIdAndUpdate(
            id,
            { shop_owner_name, shop_name, phone_number },
            { new: true }
        );
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error while updating user" });
    }
    if (!user) return res.status(404).json({ message: "Unable to update user detail" });
    return res.status(200).json({ shop: user });
};
// Delete user
const deleteUser = async (req, res, next) => {
    const id = req.params.id;
    let user;
    try {
        user = await User.findByIdAndDelete(id);
    } catch (err) {
        console.log(err);
    }
    if (!user) return res.status(404).json({ message: "Unable to delete user" });
    return res.status(200).json({ shop: user });
};
exports.getAllUsers = getAllUsers;
exports.addUsers = addUsers;
exports.getbyId = getbyId;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;