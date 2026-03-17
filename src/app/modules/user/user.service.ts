import { IUser } from "./user.interface";
import { JwtPayload } from 'jsonwebtoken';
import { UserModel } from "./user.model";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import generateOTP from "../../../util/generateOTP";
import { emailTemplate } from "../../../shared/emailTemplate";
import { emailHelper } from "../../../helpers/emailHelper";
import {unlinkFile} from "../../../shared/unlinkFile";
import redis from "../../../config/redisClient";
import { TrackService } from "../track/track.service";

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

export const UserService = {
    createUserToDB,
    retrieveProfileFromDB,
    updateProfileToDB
};