"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotifications = void 0;
const notification_model_1 = require("../app/modules/notification/notification.model");
const user_model_1 = require("../app/modules/user/user.model");
const firebaseHelper_1 = require("./firebaseHelper");
const sendNotifications = async (data, session) => {
    // save notificaton to the DB
    const result = (await notification_model_1.Notification.create([data], { session }))[0];
    // find receiver fcmToken
    const user = await user_model_1.User.findById(data === null || data === void 0 ? void 0 : data.receiver).lean().exec();
    //@ts-ignore
    const socketIo = global.io;
    // emit notification to the specific user
    if (socketIo && (data === null || data === void 0 ? void 0 : data.receiver)) {
        socketIo.emit(`get-notification::${data === null || data === void 0 ? void 0 : data.receiver}`, result);
    }
    // make firebase notification object
    const message = {
        notification: {
            title: 'New Notification Received',
            body: data === null || data === void 0 ? void 0 : data.text
        },
        tokens: user === null || user === void 0 ? void 0 : user.fcmToken
    };
    // send notification to the specific user
    if (Array.isArray(user === null || user === void 0 ? void 0 : user.fcmToken)) {
        firebaseHelper_1.firebaseHelper.sendPushNotifications(message);
    }
    return result;
};
exports.sendNotifications = sendNotifications;
