import mongoose, { Model } from 'mongoose';

export type IWithdraw = {
  to: string;
  user: mongoose.Types.ObjectId;
  balance: number;
};

export type IWithdrawModal = Model<IWithdraw>;