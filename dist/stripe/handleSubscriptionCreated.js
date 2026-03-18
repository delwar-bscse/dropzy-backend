"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSubscriptionCreated = void 0;
const stripe_1 = __importDefault(require("../config/stripe"));
const user_model_1 = require("../app/modules/user/user.model");
const plan_model_1 = require("../app/modules/plan/plan.model");
const subscription_model_1 = require("../app/modules/subscription/subscription.model");
const redisClient_1 = __importDefault(require("../config/redisClient"));
const handleSubscriptionCreated = async (data) => {
    var _a, _b;
    try {
        // Retrieve subscription
        const subscription = await stripe_1.default.subscriptions.retrieve(data.id);
        // Retrieve customer
        const customer = (await stripe_1.default.customers.retrieve(subscription.customer));
        // Extract priceId
        const productId = (_b = (_a = subscription.items.data[0]) === null || _a === void 0 ? void 0 : _a.price) === null || _b === void 0 ? void 0 : _b.product;
        // Retrieve invoice
        const invoice = await stripe_1.default.invoices.retrieve(subscription.latest_invoice);
        const trxId = invoice.payment_intent;
        const amountPaid = (invoice === null || invoice === void 0 ? void 0 : invoice.total) / 100;
        if (!(customer === null || customer === void 0 ? void 0 : customer.email)) {
            console.error("No email found for customer", customer.id);
            return { success: false, message: "No email for customer" };
        }
        const existingUser = await user_model_1.User.findOne({ email: customer.email });
        if (!existingUser) {
            console.error("User not found:", customer.email);
            return { success: false, message: "User not found" };
        }
        const plan = await plan_model_1.Plan.findOne({ productId });
        if (!plan) {
            console.error("Plan not found:", productId);
            return { success: false, message: "Plan not found" };
        }
        const currentActiveSubscription = await subscription_model_1.Subscription.findOne({
            user: existingUser._id,
            status: "active",
        });
        // Get the current period start and end dates (Unix timestamps). Convert to human-readable date
        const currentPeriodStart = new Date(subscription.current_period_start * 1000).toISOString();
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
        // Create new subscription
        const newSubscription = new subscription_model_1.Subscription({
            user: existingUser._id,
            customerId: customer.id,
            plan: plan._id,
            price: amountPaid,
            subscriptionId: data.id,
            trxId,
            currentPeriodStart,
            currentPeriodEnd,
        });
        if (currentActiveSubscription) {
            await subscription_model_1.Subscription.findOneAndUpdate({
                user: existingUser._id,
            }, {
                plan: plan._id,
                price: amountPaid,
                subscriptionId: data.id,
                trxId,
                currentPeriodStart,
                currentPeriodEnd,
            }, { new: true });
            await redisClient_1.default.del(`subscription:${existingUser._id}`);
            return { success: true };
        }
        else {
            await newSubscription.save();
            // Update user
            await user_model_1.User.findByIdAndUpdate(existingUser._id, {
                isSubscribed: true,
                hasAccess: true,
            });
            await redisClient_1.default.del(`subscription:${existingUser._id}`);
            return { success: true };
        }
    }
    catch (error) {
        console.error("handleSubscriptionCreated error:", error);
        return { success: false, error: error.message };
    }
};
exports.handleSubscriptionCreated = handleSubscriptionCreated;
