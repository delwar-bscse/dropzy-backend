"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelRoutes = void 0;
const express_1 = __importDefault(require("express"));
const parcel_controller_1 = require("./parcel.controller");
const parcel_validation_1 = require("./parcel.validation");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_1 = require("../../../enums/user");
const fileUploaderHandler_1 = __importDefault(require("../../middlewares/fileUploaderHandler"));
const getFilePath_1 = require("../../../shared/getFilePath");
const router = express_1.default.Router();
router.route('/')
    .get(parcel_controller_1.ParcelController.getParcels)
    .post((0, auth_1.default)(user_1.USER_ROLES.SENDER), (0, fileUploaderHandler_1.default)(), async (req, res, next) => {
    try {
        // console.log("Files : ", req.files)
        const images = await (0, getFilePath_1.getMultipleFilesPath)(req.files, "images");
        const payload = JSON.parse(req.body.data);
        req.body = {
            ...payload,
            ...(images && { images }),
        };
        next();
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to Process Create Parcel" });
    }
}, (0, validateRequest_1.default)(parcel_validation_1.ParcelValidation.createParcelZodValidationSchema), parcel_controller_1.ParcelController.createParcel);
router.patch('/accept-parcel/:id', (0, auth_1.default)(user_1.USER_ROLES.COURIER), parcel_controller_1.ParcelController.acceptParcel);
router.patch('/pickup-parcel/:id', (0, auth_1.default)(user_1.USER_ROLES.COURIER), parcel_controller_1.ParcelController.pickupParcel);
router.patch('/leave-parcel/:id', (0, auth_1.default)(user_1.USER_ROLES.COURIER), (0, fileUploaderHandler_1.default)(), parcel_controller_1.ParcelController.leaveParcel);
router.patch('/accept-delivery/:id', (0, auth_1.default)(user_1.USER_ROLES.SENDER), parcel_controller_1.ParcelController.acceptDelivery);
router.route('/:id')
    .get((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.COURIER, user_1.USER_ROLES.SENDER), parcel_controller_1.ParcelController.getParcel)
    .patch((0, auth_1.default)(user_1.USER_ROLES.SENDER), (0, fileUploaderHandler_1.default)(), async (req, res, next) => {
    try {
        // console.log("Files : ", req.files)
        const images = await (0, getFilePath_1.getMultipleFilesPath)(req.files, "images");
        const payload = req.body.data && JSON.parse(req.body.data) || {};
        // console.log("Routes Data : ", payload)
        req.body = {
            ...payload,
            ...(images && { images })
        };
        next();
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to Process Create Parcel" });
    }
}, (0, validateRequest_1.default)(parcel_validation_1.ParcelValidation.updateParcelZodValidationSchema), parcel_controller_1.ParcelController.updateParcel);
exports.ParcelRoutes = router;
/*
{
  "receiver": {
    "name": "Hossain",
    "countryCode": "+1",
    "phoneNumber": "5550123456"
  },
  "length": 10.5,
  "width": 8.0,
  "height": 5.2,
  "weight": 2.5,
  "pickup": "123 Warehouse Way, Tech City",
  "p_coordinates": {
    "type": "Point",
    "coordinates": [-122.4194, 37.7749]
  },
  "destination": "456 Residential Ave, Suburbia",
  "d_coordinates": {
    "type": "Point",
    "coordinates": [-118.2437, 34.0522]
  },
  "distance": 380.5,
  "duration": 360,
  "price": 45.99,
  "note": "Handle with care, contains glassware."
}
  
{
  "prevImages": [
    "\\images\\user-1773744534859.jpg"
  ]
}
*/ 
