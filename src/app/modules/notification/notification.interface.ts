import { Model, Types } from 'mongoose';

export type INotification = {
    _id?: Types.ObjectId;
    text: string;
    receiver?: Types.ObjectId;
    read: boolean;
    referenceId?:  Types.ObjectId;
    screen?: "RESERVATION" | "CHAT";
    type?: "ADMIN";
};

export type NotificationModel = Model<INotification>;