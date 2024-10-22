import { Model, Types } from 'mongoose';

export type INotification = {
  text: string;
  receiver?: Types.ObjectId;
  title?: string;
  read: boolean;
  type?: string;
};

export type NotificationModel = Model<INotification>;
