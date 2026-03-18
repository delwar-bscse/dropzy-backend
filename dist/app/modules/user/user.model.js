"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const user_1 = require("../../../enums/user");
const bcrypt_1 = __importDefault(require("bcrypt"));
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const http_status_codes_1 = require("http-status-codes");
const config_1 = __importDefault(require("../../../config"));
const userSchema = new mongoose_1.Schema({
    role: {
        type: String,
        enum: Object.values(user_1.USER_ROLES),
        required: true,
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
    verified: {
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
}, {
    timestamps: true
});
// userSchema.post("findOne", function (user: IUser) {
//     if (user && user?.profile && !user?.profile.startsWith('http')) {
//         user.profile = `http://${config.ip_address}:${config.port}${user.profile}`;
//     }
// })
//exist user check
userSchema.statics.isExistUserById = async (id) => {
    const isExist = await exports.UserModel.findById(id);
    return isExist;
};
userSchema.statics.isExistUserByEmail = async (email) => {
    const isExist = await exports.UserModel.findOne({ email });
    return isExist;
};
//account check
userSchema.statics.isAccountCreated = async (id) => {
    const isUserExist = await exports.UserModel.findById(id);
    return isUserExist.accountInformation.status;
};
//is match password
userSchema.statics.isMatchPassword = async (password, hashPassword) => {
    return await bcrypt_1.default.compare(password, hashPassword);
};
//check user
userSchema.pre('save', async function (next) {
    //check user
    if (this.email) {
        const isExist = await exports.UserModel.findOne({ email: this.email, _id: { $ne: this._id } });
        if (isExist) {
            throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Email already exist!');
        }
    }
    // if (this.role === USER_ROLES.SENDER) {
    //     this.accountInfo = {
    //         status: false
    //     };
    // }
    //password hash
    if (this.password) {
        this.password = await bcrypt_1.default.hash(this.password, Number(config_1.default.bcrypt_salt_rounds));
    }
    next();
});
exports.UserModel = (0, mongoose_1.model)("User", userSchema);
