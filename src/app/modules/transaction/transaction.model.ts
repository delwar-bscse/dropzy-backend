
import { model, Schema } from 'mongoose';
import { ITransaction, ITransactionModal } from './transaction.interface';

const transactionSchema = new Schema<ITransaction, ITransactionModal>(
  {
    ref: {
      type: String,
      required: true,
    },
    parcel: {
      type: Schema.Types.ObjectId,
      ref: 'Parcel',
    },
    from: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    balance: {
      type: Number,
      required: true,
    },
    courierBalance: {
      type: Number,
      required: true,
    },
    systemBalance: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);


export const TransactionModel = model<ITransaction, ITransactionModal>('Transaction', transactionSchema);
