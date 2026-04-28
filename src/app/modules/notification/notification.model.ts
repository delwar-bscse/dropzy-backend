import { Schema, model } from 'mongoose';
import { INotification, TNotificationModel } from './notification.interface';
import { Notification_Type } from '../../../enums/notification';

const notificationSchema = new Schema<INotification, TNotificationModel>(
  {
    type: {
      type: String,
      enum: Object.values(Notification_Type),
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    referenceId: {
      type: Schema.Types.ObjectId,
      ref: 'Parcel',
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const NotificationModel = model<INotification, TNotificationModel>(
  'Notification',
  notificationSchema
);
