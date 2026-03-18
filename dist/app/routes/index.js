"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_routes_1 = require("../modules/user/user.routes");
const auth_routes_1 = require("../modules/auth/auth.routes");
const track_routes_1 = require("../modules/track/track.routes");
const parcel_routes_1 = require("../modules/parcel/parcel.routes");
const review_route_1 = require("../modules/review/review.route");
const contactSupport_route_1 = require("../modules/contactSupport/contactSupport.route");
const router = express_1.default.Router();
const apiRoutes = [
    { path: "/user", route: user_routes_1.UserRoutes },
    { path: "/auth", route: auth_routes_1.AuthRoutes },
    { path: "/track", route: track_routes_1.TrackRoutes },
    { path: "/parcel", route: parcel_routes_1.ParcelRoutes },
    { path: "/review", route: review_route_1.ReviewRoutes },
    { path: "/support", route: contactSupport_route_1.ContactSupportRoutes },
];
apiRoutes.forEach(route => router.use(route.path, route.route));
exports.default = router;
