"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const track_controller_1 = require("./track.controller");
const user_1 = require("../../../enums/user");
const user_validation_1 = require("./user.validation");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const router = express_1.default.Router();
router.route("/")
    .get((0, auth_1.default)(user_1.USER_ROLES.COURIER, user_1.USER_ROLES.SENDER), track_controller_1.TrackController.getTrack)
    .patch((0, auth_1.default)(user_1.USER_ROLES.COURIER), (0, validateRequest_1.default)(user_validation_1.TrackValidation.updateTrackZodValidationSchema), track_controller_1.TrackController.updateTrack);
exports.TrackRoutes = router;
