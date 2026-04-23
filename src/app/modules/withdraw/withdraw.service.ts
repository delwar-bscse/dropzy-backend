import { WithdrawModel } from './withdraw.model';
import QueryBuilder from '../../../helpers/QueryBuilder';
import { IWithdraw } from './withdraw.interface';
import { JwtPayload } from 'jsonwebtoken';


// get transactions
const getWithdrawsFromDB = async (query: any) => {
  const builder = new QueryBuilder<IWithdraw>(
    WithdrawModel.find(),
    query
  );

  const withdrawsQuery = builder
    .search(['to'])
    .filter()
    .sort(['-createdAt'])
    .paginate()

  const [data, meta] = await Promise.all([
    withdrawsQuery.modelQuery.lean().exec(),
    builder.getPaginationInfo(),
  ]);

  return { data, meta };
};

// get my transactions
const getMyWithdrawsFromDB = async (user: JwtPayload, query: any) => {

  // const transactions = await WithdrawModel.find(match);
  const builder = new QueryBuilder<IWithdraw>(
    WithdrawModel.find({ user: user.id }),
    query
  );

  const withdrawsQuery = builder
    .search(['to'])
    .filter()
    .sort(['-createdAt'])
    .paginate()

  const [data, meta] = await Promise.all([
    withdrawsQuery.modelQuery.lean().exec(),
    builder.getPaginationInfo(),
  ]);

  return { data, meta };
};


export const WithdrawService = {
  getWithdrawsFromDB,
  getMyWithdrawsFromDB
};