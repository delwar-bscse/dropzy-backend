"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleConnectedAccount = void 0;
const stripe_1 = __importDefault(require("../config/stripe"));
const user_model_1 = require("../app/modules/user/user.model");
const redisClient_1 = __importDefault(require("../config/redisClient"));
const handleConnectedAccount = async (data) => {
    var _a, _b;
    try {
        // Find the user by Stripe account ID
        const existingUser = await user_model_1.User.findOne({ 'stripeAccountInfo.stripeAccountId': data.id });
        if (!existingUser) {
            console.log(`User not found for account ID: ${data.id}`);
            return { success: false };
        }
        // Check if the onboarding is complete
        if (data.charges_enabled) {
            const loginLink = await stripe_1.default.accounts.createLoginLink(data.id);
            // Save Stripe account information to the user record
            await user_model_1.User.findByIdAndUpdate(existingUser === null || existingUser === void 0 ? void 0 : existingUser._id, {
                stripeAccountInfo: {
                    stripeAccountId: data.id,
                    status: true,
                    externalAccountId: (_b = (_a = data.external_accounts) === null || _a === void 0 ? void 0 : _a.data[0]) === null || _b === void 0 ? void 0 : _b.id,
                    currency: data.default_currency,
                    accountUrl: loginLink.url
                }
            });
            await redisClient_1.default.del(`user:${existingUser._id}`);
            return { success: true };
        }
        return { success: false };
    }
    catch (error) {
        console.error("handleConnectedAccount error:", error);
        return { success: false };
    }
};
exports.handleConnectedAccount = handleConnectedAccount;
