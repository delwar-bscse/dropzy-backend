"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../../../enums/user");
const user_controller_1 = require("./user.controller");
const user_validation_1 = require("./user.validation");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const fileUploaderHandler_1 = __importDefault(require("../../middlewares/fileUploaderHandler"));
const getFilePath_1 = require("../../../shared/getFilePath");
const router = express_1.default.Router();
router.route('/')
    .get((0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.COURIER, user_1.USER_ROLES.SENDER), user_controller_1.UserController.retrieveProfile)
    .post((0, validateRequest_1.default)(user_validation_1.UserValidation.createUserZodValidationSchema), user_controller_1.UserController.createUser)
    .patch((0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.COURIER, user_1.USER_ROLES.SENDER), (0, fileUploaderHandler_1.default)(), async (req, res, next) => {
    try {
        // console.log("Files : ", req.files)
        const profile = await (0, getFilePath_1.getSingleFilePath)(req.files, "profile");
        const imgFront = await (0, getFilePath_1.getSingleFilePath)(req.files, "imgFront");
        const imgBack = await (0, getFilePath_1.getSingleFilePath)(req.files, "imgBack");
        console.log("Account info : ", req.body.accountInfo);
        const { accountInfo, coordinates, email, ...payload } = req.body;
        req.body = {
            ...payload,
            ...(profile && { profile }),
            ...(imgFront && { imgFront }),
            ...(imgBack && { imgBack }),
            ...(coordinates && { coordinates: JSON.parse(coordinates) }),
            ...(accountInfo && { accountInfo: JSON.parse(accountInfo) })
        };
        next();
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to Process Update Profile" });
    }
}, (0, validateRequest_1.default)(user_validation_1.UserValidation.updateUserZodValidationSchema), user_controller_1.UserController.updateProfile);
exports.UserRoutes = router;
