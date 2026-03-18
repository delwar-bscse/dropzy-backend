"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactSupportRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../../../enums/user");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const contactSupport_controller_1 = require("./contactSupport.controller");
const contactSupport_validation_1 = require("./contactSupport.validation");
const fileUploaderHandler_1 = __importDefault(require("../../middlewares/fileUploaderHandler"));
const getFilePath_1 = require("../../../shared/getFilePath");
const router = express_1.default.Router();
router
    .route('/')
    .get((0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), contactSupport_controller_1.ContactSupportController.getContactSupports)
    .post((0, auth_1.default)(user_1.USER_ROLES.COURIER, user_1.USER_ROLES.SENDER), (0, fileUploaderHandler_1.default)(), async (req, res, next) => {
    try {
        console.log("Files : ", req.files);
        const attachment = await (0, getFilePath_1.getSingleFilePathDocument)(req.files, "attachment");
        // const mimetype = (req.files as any).attachment[0].mimetype;
        // console.log("Mimetype : ", mimetype);
        req.body = {
            ...req.body,
            ...(attachment && { attachment }),
        };
        next();
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to Create Contact Support" });
    }
}, (0, validateRequest_1.default)(contactSupport_validation_1.ContactSupportValidation.createContactSupportZodSchema), contactSupport_controller_1.ContactSupportController.createContactSupport);
router
    .route('/:id')
    .get((0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), contactSupport_controller_1.ContactSupportController.getContactSupport)
    .patch((0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), (0, validateRequest_1.default)(contactSupport_validation_1.ContactSupportValidation.updateContactSupportZodSchema), contactSupport_controller_1.ContactSupportController.updateContactSupport);
exports.ContactSupportRoutes = router;
