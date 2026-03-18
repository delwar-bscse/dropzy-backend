"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
const mongoose_1 = require("mongoose");
const user_1 = require("../../../enums/user");
const notificationSchema = new mongoose_1.Schema({
    text: {
        type: String,
        required: true
    },
    receiver: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    referenceId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: false
    },
    screen: {
        type: String,
        required: false
    },
    read: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        enum: Object.values(user_1.USER_ROLES),
        required: false
    }
}, {
    timestamps: true
});
// Index for fetching a user's notifications
notificationSchema.index({ receiver: 1, createdAt: -1 });
// Index for counting unread notifications for a user
notificationSchema.index({ receiver: 1, read: 1 });
// Index for filtering by type (e.g., ADMIN)
notificationSchema.index({ type: 1 });
exports.Notification = (0, mongoose_1.model)('Notification', notificationSchema);
