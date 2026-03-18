"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.firebaseHelper = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const firebaseSDK_json_1 = __importDefault(require("../../src/firebaseSDK.json"));
const logger_1 = require("../shared/logger");
// Cast serviceAccount to ServiceAccount type
const serviceAccountKey = firebaseSDK_json_1.default;
// Initialize Firebase SDK
firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.cert(serviceAccountKey),
});
// send notification to multiple user
const sendPushNotifications = async (values) => {
    const res = await firebase_admin_1.default.messaging().sendEachForMulticast(values);
    logger_1.logger.info('Notifications sent successfully', res);
};
// send notification to single user
const sendPushNotification = async (values) => {
    const res = await firebase_admin_1.default.messaging().send(values);
    logger_1.logger.info('Notification sent successfully', res);
};
exports.firebaseHelper = {
    sendPushNotifications,
    sendPushNotification,
};
