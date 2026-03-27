import { Model, Types } from 'mongoose';
import { Notification_Type } from '../../../enums/notification';

export type INotification = {
  _id: Types.ObjectId;
  type: Notification_Type;
  title: string;
  sender?: Types.ObjectId;
  receiver: Types.ObjectId;
  referenceId?: Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type TNotificationModel = Model<INotification>;