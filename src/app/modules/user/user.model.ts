import { model, Schema } from "mongoose";
import { USER_ROLES } from "../../../enums/user";
import { IUser, TUserModal } from "./user.interface";
import bcrypt from "bcrypt";
import ApiError from "../../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";
import config from "../../../config";

const userSchema = new Schema<IUser, TUserModal>(
    {
        role: {
            type: String,
            enum: Object.values(USER_ROLES),
            required: true,
        },
        balance: {
            type: Number,
            default: 0,
        },
        name: {
            type: String,
            required: false,
        },
        email: {
            type: String,
            required: false,
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: false,
            select: 0,
            minlength: 4,
        },
        phoneNumber: {
            type: String,
            required: false,
        },
        countryCode: {
            type: String,
            required: false,
        },
        profile: {
            type: String,
            default: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1750680842/avatars/user_itpwmf.jpg"
        },
        imgFront: {
            type: String,
            required: false,
        },
        imgBack: {
            type: String,
            required: false,
        },
        dob: {
            type: Date,
            required: false,
        },
        address: {
            type: String,
            required: false,
        },
        coordinates: {
            type: [Number],
            required: false,
        },
        landRegion: {
            type: String,
            required: false,
        },
        city: {
            type: String,
            required: false,
        },
        zipCode: {
            type: String,
            required: false,
        },
        s_rides: {
            type: Number,
            default: 0,
        },
        s_rating: {
            type: Number,
            default: 0,
        },
        c_rides: {
            type: Number,
            default: 0,
        },
        c_rating: {
            type: Number,
            default: 0,
        },
        verified: {
            type: Boolean,
            default: false,
        },
        approved: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        appId: {
            type: String,
            required: false,
        },
        fcmToken: { type: [String], required: false },
        authentication: {
            type: {
                isResetPassword: {
                    type: Boolean,
                    default: false,
                },
                oneTimeCode: {
                    type: Number,
                    default: null,
                },
                expireAt: {
                    type: Date,
                    default: null,
                },
            },
            select: 0
        },
        accountInfo: {
            status: {
                type: Boolean
            },
            accountId: {
                type: String,
            },
            externalAccountId: {
                type: String,
            },
            currency: {
                type: String,
            },
            accountUrl: {
                type: String,
            },

            accountHolderName: {
                type: String,
            },
            iban: {
                type: String,
            },
            landOfBank: {
                type: String,
            },
            bankName: {
                type: String,
            },
            cardNumber: {
                type: String,
            },
            twintNumber: {
                type: String,
            },
        }
    },
    {
        timestamps: true
    }
);

//exist user check
userSchema.statics.isExistUserById = async (id: string) => {
    const isExist = await UserModel.findById(id);
    return isExist;
};

userSchema.statics.isExistUserByEmail = async (email: string) => {
    const isExist = await UserModel.findOne({ email });
    return isExist;
};

//account check
userSchema.statics.isAccountCreated = async (id: string) => {
    const isUserExist: any = await UserModel.findById(id);
    return isUserExist.accountInformation.status;
};

//is match password
userSchema.statics.isMatchPassword = async (password: string, hashPassword: string): Promise<boolean> => {
    return await bcrypt.compare(password, hashPassword);
};

//check user
userSchema.pre('save', async function (next) {

    //check user
    if (this.email) {
        const isExist = await UserModel.findOne({ email: this.email, _id: { $ne: this._id } });
        if (isExist) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already exist!');
        }
    }

    //password hash
    if (this.password) {
        this.password = await bcrypt.hash(this.password, Number(config.bcrypt_salt_rounds));
    }
    next();
});

export const UserModel = model<IUser, TUserModal>("User", userSchema);