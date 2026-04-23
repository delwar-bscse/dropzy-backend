
import { model, Schema } from 'mongoose';
import { IWithdraw, IWithdrawModal } from './withdraw.interface';

const withdrawSchema = new Schema<IWithdraw, IWithdrawModal>(
  {
    to: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    balance: {
      type: Number,
      required: true,
    }
  },
  { timestamps: true }
);


export const WithdrawModel = model<IWithdraw, IWithdrawModal>('Withdraw', withdrawSchema);
