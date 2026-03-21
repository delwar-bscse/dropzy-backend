import { StatusCodes } from 'http-status-codes';
import { TransactionModel } from './transaction.model';
import { UserModel } from '../user/user.model';
import ApiError from '../../../errors/ApiErrors';
import mongoose from 'mongoose';
import { USER_ROLES } from '../../../enums/user';
import QueryBuilder from '../../../helpers/QueryBuilder';
import { ITransaction } from './transaction.interface';


//create contact support
const createTransactionToDB = async (payload: any): Promise<any> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const amount: number = 900;

  try {
    const newPayload = {
      ref: "ABC",
      parcel: "69ba1374336f0f964d37d6f3",
      from: "69b9489e6642b044b97d90b4",
      to: "69b949c46642b044b97d90c1",
      balance: amount,
      courierBalance: amount * 0.9,
      systemBalance: amount * 0.1
    };

    // ✅ Create transaction with session
    const transaction = await TransactionModel.create([newPayload], { session });

    if (!transaction || transaction.length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create transaction');
    }

    // ✅ Update user WITH session
    const user = await UserModel.findByIdAndUpdate(
      newPayload.to,
      { $inc: { balance: newPayload.courierBalance } },
      { new: true, session } // 👈 correct way
    );

    if (!user) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "User not found");
    }

    await session.commitTransaction();

    return {
      user,
      transaction: transaction[0]
    };

  } catch (error: any) {
    await session.abortTransaction();
    throw new ApiError(StatusCodes.BAD_REQUEST, error.message);
  } finally {
    session.endSession();
  }
};

const getTransactionsFromDB = async (query: any) => {
      const builder = new QueryBuilder<ITransaction>(
        TransactionModel.find(),
        query
    );

    const usersQuery = builder
        .search(['ref', 'parcel'])
        .filter()
        .sort(['-createdAt'])
        .paginate()

    const [data, meta] = await Promise.all([
        usersQuery.modelQuery.lean().exec(),
        builder.getPaginationInfo(),
    ]);

    return { data, meta };
};

const getMyTransactionsFromDB = async (user: any, query: any) => {
  if (![USER_ROLES.SENDER, USER_ROLES.COURIER].includes(user.role)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'You are not allowed to access this route');
  }
  const baseQuery = user.role === USER_ROLES.SENDER ? { from: user.id } : { to: user.id };

  // const transactions = await TransactionModel.find(match);
      const builder = new QueryBuilder<ITransaction>(
        TransactionModel.find(baseQuery),
        query
    );

    const usersQuery = builder
        .search(['ref', 'parcel'])
        .filter()
        .sort(['-createdAt'])
        .paginate()

    const [data, meta] = await Promise.all([
        usersQuery.modelQuery.lean().exec(),
        builder.getPaginationInfo(),
    ]);

    return { data, meta };
};

export const TransactionService = {
  createTransactionToDB,
  getTransactionsFromDB,
  getMyTransactionsFromDB
};