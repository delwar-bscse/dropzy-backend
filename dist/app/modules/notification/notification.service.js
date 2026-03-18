"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const notification_model_1 = require("./notification.model");
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const http_status_codes_1 = require("http-status-codes");
const QueryBuilder_1 = __importDefault(require("../../../helpers/QueryBuilder"));
const getNotificationFromDB = async (user, query) => {
    const notificationQuery = new QueryBuilder_1.default(notification_model_1.Notification.find({ receiver: user.id }).sort({ createdAt: -1 }), query).paginate();
    const [notifications, pagination, unreadCount] = await Promise.all([
        notificationQuery.queryModel.lean().exec(),
        notificationQuery.getPaginationInfo(),
        notification_model_1.Notification.countDocuments({ type: 'ADMIN', isRead: false })
    ]);
    return {
        notifications,
        pagination,
        unreadCount
    };
};
const readNotificationToDB = async (user) => {
    const result = await notification_model_1.Notification.bulkWrite([
        {
            updateMany: {
                filter: { receiver: user.id, read: false },
                update: { $set: { read: true } },
                upsert: false // Don't insert new docs
            }
        }
    ]);
    if (result.modifiedCount < 0) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to update notifications');
    }
    return true;
};
// get notifications for admin
const adminNotificationFromDB = async (query) => {
    const notificationQuery = new QueryBuilder_1.default(notification_model_1.Notification.find({ type: 'ADMIN' }).sort({ createdAt: -1 }), query).paginate();
    const [notifications, pagination, unreadCount] = await Promise.all([
        notificationQuery.queryModel.lean().exec(),
        notificationQuery.getPaginationInfo(),
        notification_model_1.Notification.countDocuments({ type: 'ADMIN', isRead: false })
    ]);
    return {
        notifications,
        pagination,
        unreadCount
    };
};
// read notifications only for admin
const adminReadNotificationToDB = async () => {
    const result = await notification_model_1.Notification.bulkWrite([
        {
            updateMany: {
                filter: { type: 'ADMIN', read: false },
                update: { $set: { read: true } },
                upsert: false // Don't insert new docs
            }
        }
    ]);
    if (result.modifiedCount < 0) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to update notifications');
    }
    return true;
};
exports.NotificationService = {
    adminNotificationFromDB,
    getNotificationFromDB,
    readNotificationToDB,
    adminReadNotificationToDB
};
