import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiErrors';
import { IUser } from '../user/user.interface';
import { User } from '../user/user.model';
import QueryBuilder from '../../../helpers/QueryBuilder';
import { FilterQuery } from 'mongoose';
import { checkMongooseIDValidation } from '../../../shared/checkMongooseIDValidation';

const createAdminToDB = async (payload: IUser): Promise<IUser> => {

    payload.verified = true;

    const createAdmin = await User.create(payload);
    if (!createAdmin) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create Admin');
    }
    return createAdmin;
};

const deleteAdminFromDB = async (id: any): Promise<IUser | undefined> => {

    checkMongooseIDValidation(id, "Admin");
    
    const isExistAdmin = await User.findByIdAndDelete(id);
    if (!isExistAdmin) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete Admin');
    }
    return;
};

const retrievedAdminFromDB = async (query: FilterQuery<IUser>): Promise<{admins: IUser[], pagination: any}> => {
    
    const AdminQuery = new QueryBuilder(
        User.find({ role: 'ADMIN' }).lean().exec(),
        query
    ).paginate();

    const [admins, pagination] = await Promise.all([
        AdminQuery.queryModel.populate("service"),
        AdminQuery.getPaginationInfo()
    ]);

    return { admins, pagination };
};

export const AdminService = {
    createAdminToDB,
    deleteAdminFromDB,
    retrievedAdminFromDB
};
