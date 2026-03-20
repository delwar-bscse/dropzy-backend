import { Model, Types } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';

interface IAccountInfo {
    status?: boolean;
    accountId?: string;
    externalAccountId?: string;
    accountUrl?: string;

    accountHolderName?: string;
    iban?: string;
    landOfBank?: string;
    bankName?: string;
    currency?: string;
    cardNumber?: string;
    twintNumber?: string;
}

interface IAuthenticationProps {
    isResetPassword: boolean;
    oneTimeCode: number;
    expireAt: Date;
}

export type IUser = {
    _id?: Types.ObjectId;
    role: USER_ROLES;
    name: string;
    email: string;
    password: string;
    phoneNumber?: string;
    countryCode?: string;
    profile?: string;
    imgFront?: string;
    imgBack?: string;
    dob?: Date;
    address?: string;
    coordinates?:[number, number];
    landRegion?: string;
    city?: string;
    zipCode?: string;
    c_rides?: number;
    c_rating?: number;
    s_rides?: number;
    s_rating?: number;
    verified?: boolean;
    approved?: boolean;     
    isActive?: boolean;
    isDeleted?: boolean;
    appId?: string;
    fcmToken?: string[];
    authentication?: IAuthenticationProps;
    accountInfo?: IAccountInfo;
}

export type TUserModal = {
    isExistUserById(id: string): any;
    isExistUserByEmail(email: string): any;
    isAccountCreated(id: string): any;
    isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IUser>;