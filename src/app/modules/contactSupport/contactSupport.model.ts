
import { model, Schema } from 'mongoose';
import { IContactSupport, IContactSupportModal } from './contactSupport.interface';

const subCategorySchema = new Schema<IContactSupport, IContactSupportModal>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    attachment: {
      type: String,
      default: null,
    },
    sub: {
      type: String,
      required: true,
    },
    msg: {
      type: String,
      required: true,
    },
    reply: {
      type: String,
      default: null,
    },
    isReply: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);


export const ContactSupportModel = model<IContactSupport, IContactSupportModal>('ContactSupport', subCategorySchema);
