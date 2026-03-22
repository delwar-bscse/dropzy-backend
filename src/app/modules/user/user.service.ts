import { IUser } from "./user.interface";
import { JwtPayload } from 'jsonwebtoken';
import { UserModel } from "./user.model";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import generateOTP from "../../../util/generateOTP";
import { emailTemplate } from "../../../shared/emailTemplate";
import { emailHelper } from "../../../helpers/emailHelper";
import { unlinkFile } from "../../../shared/unlinkFile";
import redis from "../../../config/redisClient";
import { TrackService } from "../track/track.service";
import { logger } from "../../../shared/logger";
import mongoose, { FilterQuery } from "mongoose";
import { USER_ROLES } from "../../../enums/user";
import QueryBuilder from "../../../helpers/QueryBuilder";
import stripe from "../../../config/stripe";

// create user to DB
const createUserToDB = async (payload: Partial<IUser>): Promise<any> => {
    let message = '';
    let createUser: IUser = {} as IUser;

    const isExistUser = await UserModel.isExistUserByEmail(payload?.email as string);

    if (isExistUser?.verified) {
        throw new ApiError(StatusCodes.CONFLICT, 'User already exist! Please Login');
    }

    if (isExistUser && !isExistUser?.verified) {
        const newPayload = {
            role: payload.role,
            name: payload.name,
            password: payload.password
        }
        isExistUser.set(newPayload);
        const res = await isExistUser.save();
        // console.log("Res : ", res)
        if (!res) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
        }
        createUser = isExistUser;
        message = "User already exist! Please verify your account";
    } else {
        createUser = await UserModel.create(payload);
        if (!createUser) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
        }
        message = 'User created successfully';
    }

    //send email
    const otp = generateOTP();
    const values = {
        name: createUser.name,
        otp: otp,
        email: createUser.email!
    };

    const createAccountTemplate = emailTemplate.createAccount(values);
    emailHelper.sendEmail(createAccountTemplate);

    //save to DB
    const authentication = {
        oneTimeCode: otp,
        expireAt: new Date(Date.now() + 3 * 60000),
    };

    await UserModel.findOneAndUpdate(
        { _id: createUser._id },
        { $set: { authentication } }
    );

    return {
        message,
        data: createUser
    };
};

// retrieve profile
const retrieveProfileFromDB = async (user: JwtPayload): Promise<Partial<IUser>> => {
    const { id } = user;

    const cachedUser = await redis.get(`user:${id}`);
    if (cachedUser) {
        return JSON.parse(cachedUser);
    }

    const isExistUser: any = await UserModel.findById(id).lean();
    if (!isExistUser) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }

    // Cache user in Redis for future requests
    await redis.set(`user:${id}`, JSON.stringify(isExistUser), 'EX', 60 * 30);

    return isExistUser;
};

// update profile
const updateProfileToDB = async (user: JwtPayload, payload: Partial<IUser>): Promise<{ data: Partial<IUser | null> }> => {
    const { id } = user;
    const isExistUser = await UserModel.isExistUserById(id);
    if (!isExistUser) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }

    //unlink file here
    if (payload.profile && isExistUser.profile) {
        // console.log("Profile image : ", isExistUser.profile, payload.profile)
        unlinkFile(isExistUser.profile);
    }
    if (payload.imgFront && isExistUser.imgFront) {
        unlinkFile(isExistUser.imgFront);
    }
    if (payload.imgBack && isExistUser.imgBack) {
        unlinkFile(isExistUser.imgBack);
    }

    const newPayload = {
        ...payload,
        accountInfo: {
            ...isExistUser.accountInfo,
            ...payload.accountInfo
        }
    };

    const updateDoc = await UserModel.findOneAndUpdate(
        { _id: id },
        newPayload,
        { new: true }
    );

    if (!updateDoc) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update user');
    }

    await redis.del(`user:${id}`);

    //create track room for tracking.
    const track = await TrackService.createTrackToDB({
        courier: id,
        location: updateDoc.address,
        coordinates: updateDoc.coordinates
    });

    if (!track) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create track');
    }
    return {
        data: updateDoc
    };
};

// get all users
const getAllUsersFromDB = async (query: FilterQuery<IUser>): Promise<any> => {

    const builder = new QueryBuilder<IUser>(UserModel.find(), query);

    const usersQuery = builder
        .search(['name', 'email', 'phoneNumber', 'address'])
        .filter()
        .sort(['-createdAt'])
        .paginate()
        .fields();

    const [data, meta] = await Promise.all([
        usersQuery.modelQuery.lean().exec(),
        builder.getPaginationInfo()
    ]);

    return { data, meta };
};

// soft delete user
const deleteUserFromDB = async (userId: string): Promise<any> => {
    const user = await UserModel.findById(userId);

    if (!user) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }

    user.isDeleted = true;
    await user.save();

    return user;
};

// approve user
const approveUserToDB = async (userId: string): Promise<any> => {
    const user = await UserModel.findById(userId);

    if (!user) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }

    user.approved = true;
    await user.save();

    return user;
};

// decline user
const declineUserFromDB = async (userId: string): Promise<any> => {
    const user = await UserModel.findByIdAndDelete(userId);

    if (!user) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }

    return user;
};

// active or block user
const activeBlockUserFromDB = async (userId: string): Promise<any> => {
    const user = await UserModel.findById(userId);

    if (!user) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }

    user.isActive = !user.isActive;
    await user.save();

    return {
        data: user,
        message: user.isActive ? 'User activated successfully' : 'User blocked successfully'
    };
};

// corn job: Delete unverified accounts older than the grace period
const deleteUnverifiedAccount = async () => {
    const GRACE_PERIOD_MINUTES = 1;
    // Calculate the cutoff date (5 minutes ago)
    const cutoffDate = new Date(Date.now() - GRACE_PERIOD_MINUTES * 60 * 1000);

    // Delete unverified accounts older than the grace period
    const result = await UserModel.deleteMany({
        verified: false,
        createdAt: { $lt: cutoffDate }
    });

    logger.info(`Deleted ${result.deletedCount} unverified accounts.`);
};


//withdraw amount to provider account from admin account
const withdrawFromDB = async (user: JwtPayload) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const User = await UserModel.findById(user.id)
            .select("+accountInfo")
            .session(session)
            .lean();

        if (!User) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Withdraw - User not found");
        }

        // ✅ CASE 1: Account ready to withdraw
        if (
            User?.accountInfo?.accountId &&
            User?.accountInfo?.accountUrl &&
            User?.accountInfo?.status
        ) {
            const userBalance = User.balance || 0;

            const balance = await stripe.balance.retrieve();
            const availableBalance = balance.available?.[0]?.amount || 0;

            if (availableBalance < userBalance * 100) {
                throw new ApiError(StatusCodes.BAD_REQUEST, "Insufficient platform funds to make transfer.");
            }

            const transfer = await stripe.transfers.create({
                amount: userBalance * 100,
                currency: "chf",
                destination: User?.accountInfo?.accountId,
            });

            if (!transfer) {
                throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to transfer funds to connected account.");
            }

            await UserModel.updateOne(
                { _id: user.id },
                { $set: { balance: 0 } },
                { session }
            );

            await session.commitTransaction();
            session.endSession();

            return {
                message: `${userBalance} CHF transferred to Stripe account successfully!`,
            };
        }

        // ✅ CASE 2: Account exists but not ready
        if (
            User?.accountInfo?.accountId &&
            User?.accountInfo?.accountUrl &&
            !User?.accountInfo?.status
        ) {

            const accountLink = await stripe.accountLinks.create({
                account: User.accountInfo.accountId!,
                refresh_url: "https://nk6567-dashboard.vercel.app/account-create-failed",
                return_url: "https://nk6567-dashboard.vercel.app/account-create-successful",
                type: "account_onboarding",
                // collect: 'eventually_due', // optional
            });

            if (!accountLink.url) {
                throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create Stripe onboarding link.");
            }

            await UserModel.findByIdAndUpdate(
                user.id,
                {
                    $set: {
                        "accountInfo.accountUrl": accountLink.url,
                    },
                },
                { session }
            );

            await session.commitTransaction();
            session.endSession();

            return {
                message: "Created Stripe connected account onboarding link!",
                url: accountLink.url,
            };
        }

        // ✅ CASE 3: No Stripe account yet → create one
        const createAccount = await stripe.accounts.create({
            type: "express",
            country: "US",
            email: User?.email,
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            },
            business_profile: {
                name: User?.name!,
                support_email: User?.email!,
                support_phone: User?.countryCode! + User?.phoneNumber!,
                url: "https://nk6567-dashboard.vercel.app",
            },
            business_type: "individual",
            individual: {
                first_name: User?.name,
                email: User?.email!,
            },
        });

        const accountLink = await stripe.accountLinks.create({
            account: createAccount.id,
            refresh_url: "https://nk6567-dashboard.vercel.app/account-create-failed",
            return_url:
                "https://nk6567-dashboard.vercel.app/account-create-successful",
            type: "account_onboarding",
        });

        if (!accountLink.url) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                "Failed to create Stripe onboarding link."
            );
        }

        await UserModel.findByIdAndUpdate(
            user.id,
            {
                $set: {
                    "accountInfo.accountId": createAccount.id,
                    "accountInfo.accountUrl": accountLink.url,
                    "accountInfo.status": false,
                },
            },
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        return {
            message: "Created new Stripe connected account!",
            url: accountLink.url,
        };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("withdrawFromDB error:", error);
        throw error;
    }
};

export const UserService = {
    createUserToDB,
    retrieveProfileFromDB,
    updateProfileToDB,
    deleteUnverifiedAccount,
    getAllUsersFromDB,
    deleteUserFromDB,
    activeBlockUserFromDB,
    approveUserToDB,
    declineUserFromDB,
    withdrawFromDB
};