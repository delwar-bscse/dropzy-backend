import { JwtPayload } from 'jsonwebtoken';
import { Notification } from './notification.model';
import QueryBuilder from '../../../helpers/QueryBuilder';
import { FilterQuery } from 'mongoose';
import ApiError from '../../../errors/ApiErrors';
import { StatusCodes } from 'http-status-codes';

const getNotificationFromDB = async (user: JwtPayload, query: FilterQuery<any>): Promise<Object> => {

    const notificationQuery = new QueryBuilder(
        Notification.find({ receiver: user.id }).sort({ createdAt: -1 }),
        query
    ).paginate();

    const [notifications, pagination, unreadCount] = await Promise.all([
        notificationQuery.queryModel.lean().exec(),
        notificationQuery.getPaginationInfo(),
        Notification.countDocuments({ type: 'ADMIN', isRead: false })
    ]);

    return {
        notifications,
        pagination,
        unreadCount
    }
};


const readNotificationToDB = async (user: JwtPayload): Promise<boolean> => {

    const result = await Notification.bulkWrite([
        {
            updateMany: {
                filter: { receiver: user.id, read: false },
                update: { $set: { read: true } },
                upsert: false // Don't insert new docs
            }
        }
    ]);

    if (result.modifiedCount < 0) {
        throw new ApiError( StatusCodes.BAD_REQUEST, 'Failed to update notifications');
    }
    return true;
};

// get notifications for admin
const adminNotificationFromDB = async (query: FilterQuery<any>): Promise<Object> => {

    const notificationQuery = new QueryBuilder(
        Notification.find({ type: 'ADMIN' }).sort({ createdAt: -1 }),
        query
    ).paginate();

    const [notifications, pagination, unreadCount] = await Promise.all([
        notificationQuery.queryModel.lean().exec(),
        notificationQuery.getPaginationInfo(),
        Notification.countDocuments({ type: 'ADMIN', isRead: false })
    ]);

    return {
        notifications,
        pagination,
        unreadCount
    }
};

// read notifications only for admin
const adminReadNotificationToDB = async (): Promise<boolean> => {

    const result = await Notification.bulkWrite([
        {
            updateMany: {
                filter: { type: 'ADMIN', read: false },
                update: { $set: { read: true } },
                upsert: false // Don't insert new docs
            }
        }
    ]);

    if (result.modifiedCount < 0) {
        throw new ApiError( StatusCodes.BAD_REQUEST, 'Failed to update notifications');
    }
    return true;
};

export const NotificationService = {
    adminNotificationFromDB,
    getNotificationFromDB,
    readNotificationToDB,
    adminReadNotificationToDB
};
