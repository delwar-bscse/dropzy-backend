import mongoose from "mongoose";
import { INotification } from "../app/modules/notification/notification.interface";
import { Notification } from "../app/modules/notification/notification.model";
import { User } from "../app/modules/user/user.model";
import { firebaseHelper } from "./firebaseHelper";
import admin from 'firebase-admin';

export const sendNotifications = async (data:any, session?: mongoose.ClientSession):Promise<INotification> =>{

    // save notificaton to the DB
    const result =  (await Notification.create([data], { session }))[0];

    // find receiver fcmToken
    const user = await User.findById(data?.receiver).lean().exec();

    //@ts-ignore
    const socketIo = global.io;

    // emit notification to the specific user
    if (socketIo && data?.receiver) {
        socketIo.emit(`get-notification::${data?.receiver}`, result);
    }

    // make firebase notification object
    const message = {
        notification: {
            title: 'New Notification Received',
            body: data?.text
        },
        tokens: user?.fcmToken as string[]
    } as admin.messaging.MulticastMessage;

    // send notification to the specific user
    if (Array.isArray(user?.fcmToken)) {
        firebaseHelper.sendPushNotifications(message);
    }

    return result;
}