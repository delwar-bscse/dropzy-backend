import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../../../config';
import ApiError from '../../../errors/ApiErrors';
import { emailHelper } from '../../../helpers/emailHelper';
import { jwtHelper } from '../../../helpers/jwtHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import {
    IAuthResetPassword,
    IChangePassword,
    ILoginData,
    IVerifyEmail
} from '../../../types/auth';
import cryptoToken from '../../../util/cryptoToken';
import generateOTP from '../../../util/generateOTP';
import { ResetToken } from '../resetToken/resetToken.model';
import { UserModel } from '../user/user.model';
import { USER_ROLES } from '../../../enums/user';
import { sendNotifications } from '../../../helpers/notificationHelper';
import { Notification_Type } from '../../../enums/notification';

//login
const loginUserFromDB = async (payload: ILoginData) => {

    const { email, password, role } = payload;

    const isExistUser: any = await UserModel.findOne({ email }).select('+password');
    if (!isExistUser) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }

    if (isExistUser.isDeleted) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'This user is deleted! Please contact to admin');
    }

    //check verified and status
    if (!isExistUser.verified) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Please verify your account, then try to login again');
    }

    //check match password
    if (password && !(await UserModel.isMatchPassword(password, isExistUser.password))) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is incorrect!');
    }

    if (role) {
        const res = await UserModel.findOneAndUpdate({ email }, { role }, { new: true });
        if (res) {
            isExistUser.role = res.role;
        }
    }

    //create token
    const accessToken = jwtHelper.createToken(
        { id: isExistUser._id, role: isExistUser.role, email: isExistUser.email },
        config.jwt.jwt_secret as Secret,
        config.jwt.jwt_expire_in as string
    );

    //create token
    const refreshToken = jwtHelper.createToken(
        { id: isExistUser._id, role: isExistUser.role, email: isExistUser.email },
        config.jwt.jwtRefreshSecret as Secret,
        config.jwt.jwtRefreshExpiresIn as string
    );

    return { accessToken, refreshToken, role: isExistUser.role };
};

//forget password
const forgetPasswordToDB = async (email: string) => {

    const isExistUser = await UserModel.isExistUserByEmail(email);
    if (!isExistUser) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }

    //send mail
    const otp = generateOTP();
    const value = {
        otp,
        email: isExistUser.email
    };

    const forgetPassword = emailTemplate.resetPassword(value);
    emailHelper.sendEmail(forgetPassword);

    //save to DB
    const authentication = {
        oneTimeCode: otp,
        expireAt: new Date(Date.now() + 3 * 60000)
    };
    await UserModel.findOneAndUpdate({ email }, { $set: { authentication } });
};

//verify email
const verifyEmailToDB = async (payload: IVerifyEmail): Promise<any> => {
    const superAdmin = await UserModel.findOne({ role: USER_ROLES.SUPER_ADMIN });

    const { email, oneTimeCode } = payload;
    const isExistUser = await UserModel.findOne({ email }).select('+authentication');
    if (!isExistUser) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }

    if (!oneTimeCode) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Please give the otp, check your email we send a code');
    }

    if (isExistUser.authentication?.oneTimeCode !== oneTimeCode) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'You provided wrong otp');
    }

    const date = new Date();
    if (date > isExistUser.authentication?.expireAt) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Otp already expired, Please try again');
    }

    let message;
    let data;

    if (!isExistUser.verified) {
        await UserModel.findOneAndUpdate(
            { _id: isExistUser._id },
            { verified: true, authentication: { oneTimeCode: null, expireAt: null } }
        );
        sendNotifications({
            type: Notification_Type.NEW_USER,
            title: 'New user registered in your platform',
            receiver: superAdmin!._id,
            sender: isExistUser._id,
            referenceId: isExistUser._id,
        });
        message = 'Email verified successfully';
    } else {
        await UserModel.findOneAndUpdate(
            { _id: isExistUser._id },
            {
                authentication: {
                    isResetPassword: true,
                    oneTimeCode: null,
                    expireAt: null,
                }
            }
        );

        //create token ;
        const createToken = cryptoToken();
        await ResetToken.create({
            user: isExistUser._id,
            token: createToken,
            expireAt: new Date(Date.now() + 5 * 60000),
        });
        message = 'Verification Successful: Please securely store and utilize this code for reset password';
        data = createToken;
    }
    return { data, message };
};

//forget password
const resetPasswordToDB = async (token: string, payload: IAuthResetPassword) => {

    const { newPassword, confirmPassword } = payload;

    //isExist token
    const isExistToken = await ResetToken.isExistToken(token);
    if (!isExistToken) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized');
    }

    //user permission check
    const isExistUser = await UserModel.findById(isExistToken.user).select('+authentication');
    if (!isExistUser?.authentication?.isResetPassword) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "You don't have permission to change the password. Please click again to 'Forgot Password'");
    }

    //validity check
    const isValid = await ResetToken.isExpireToken(token);
    if (!isValid) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Token expired, Please click again to the forget password');
    }

    //check password
    if (newPassword !== confirmPassword) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "New password and Confirm password doesn't match!");
    }

    const hashPassword = await bcrypt.hash(newPassword, Number(config.bcrypt_salt_rounds));

    const updateData = {
        password: hashPassword,
        authentication: {
            isResetPassword: false,
        }
    };

    await UserModel.findOneAndUpdate(
        { _id: isExistToken.user },
        updateData,
        { new: true }
    );
};

//change password
const changePasswordToDB = async (user: JwtPayload, payload: IChangePassword) => {

    const { currentPassword, newPassword, confirmPassword } = payload;
    const isExistUser = await UserModel.findById(user.id).select('+password');
    if (!isExistUser) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }

    //current password match
    if (currentPassword && !(await UserModel.isMatchPassword(currentPassword, isExistUser.password))) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is incorrect');
    }

    //newPassword and current password
    if (currentPassword === newPassword) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Please give different password from current password');
    }

    //new password and confirm password check
    if (newPassword !== confirmPassword) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Password and Confirm password doesn't matched");
    }

    isExistUser.set({ password: newPassword });
    await isExistUser.save();
};

//new access token
const newAccessTokenToUser = async (token: string) => {
    // Check if the token is provided
    if (!token) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Token is required!');
    }


    const verifyUser = jwtHelper.verifyToken(
        token,
        config.jwt.jwtRefreshSecret as Secret
    );

    const isExistUser = await UserModel.findById(verifyUser?.id);
    if (!isExistUser) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized access")
    }

    //create token
    const accessToken = jwtHelper.createToken(
        { id: isExistUser._id, role: isExistUser.role, email: isExistUser.email },
        config.jwt.jwt_secret as Secret,
        config.jwt.jwt_expire_in as string
    );

    return { accessToken, role: isExistUser.role };
}

// resend otp to email
const resendVerificationEmailToDB = async (email: string) => {

    // Find the user by ID
    const existingUser: any = await UserModel.findOne({ email: email }).lean();

    if (!existingUser) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'User with this email does not exist!',);
    }

    if (existingUser?.isVerified) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'User is already verified!');
    }

    // Generate OTP and prepare email
    const otp = generateOTP();
    const emailValues = {
        name: existingUser.firstName,
        otp,
        email: existingUser.email,
    };

    const accountEmailTemplate = emailTemplate.resendOtp(emailValues);
    emailHelper.sendEmail(accountEmailTemplate);

    // Update user with authentication details
    const authentication = {
        oneTimeCode: otp,
        expireAt: new Date(Date.now() + 3 * 60000),
    };

    await UserModel.findOneAndUpdate(
        { email: email },
        { $set: { authentication } },
        { new: true }
    );
};

// swap user role
const swapUserRoleFromDB = async (id: string) => {

    const isExistUser: any = await UserModel.findById(id);
    if (!isExistUser) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }

    if (isExistUser.isDeleted) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'This user is deleted! Please contact to admin');
    }

    isExistUser.role = isExistUser.role === USER_ROLES.SENDER ? USER_ROLES.COURIER : USER_ROLES.SENDER;
    await isExistUser.save();

    //create token
    const accessToken = jwtHelper.createToken(
        { id: isExistUser._id, role: isExistUser.role, email: isExistUser.email },
        config.jwt.jwt_secret as Secret,
        config.jwt.jwt_expire_in as string
    );

    //create token
    const refreshToken = jwtHelper.createToken(
        { id: isExistUser._id, role: isExistUser.role, email: isExistUser.email },
        config.jwt.jwtRefreshSecret as Secret,
        config.jwt.jwtRefreshExpiresIn as string
    );

    return { accessToken, refreshToken, role: isExistUser.role };
};

// soft delete user
const deleteUserFromDB = async (user: JwtPayload, password: string) => {

    const isExistUser = await UserModel.findById(user.id).select('+password').lean();
    if (!isExistUser) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }

    //check match password
    if (password && !(await UserModel.isMatchPassword(password, isExistUser.password))) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is incorrect');
    }

    const updateUser = await UserModel.findByIdAndUpdate(user.id, { isDeleted: true }, { new: true }).lean();
    if (!updateUser) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    return;
};

export const AuthService = {
    verifyEmailToDB,
    loginUserFromDB,
    forgetPasswordToDB,
    resetPasswordToDB,
    changePasswordToDB,
    newAccessTokenToUser,
    resendVerificationEmailToDB,
    deleteUserFromDB,
    swapUserRoleFromDB
};