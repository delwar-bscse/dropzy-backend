import mongoose, { Model } from 'mongoose';

export type ITransaction = {
  ref: string;
  parcel:  mongoose.Types.ObjectId;
  from:  mongoose.Types.ObjectId;
  to: mongoose.Types.ObjectId;
  balance: number;
  courierBalance: number;
  systemBalance: number;
};

export type ITransactionModal = Model<ITransaction>;