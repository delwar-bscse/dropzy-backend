import { model, Schema } from "mongoose";
import { ISubscription, SubscriptionModel } from "./subscription.interface";


const subscriptionSchema = new Schema<ISubscription, SubscriptionModel>(
    {
        price: {
            type: Number,
            required: true
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        plan: {
            type: Schema.Types.ObjectId,
            ref: "Plan",
            required: true
        },
        subscriptionId: {
            type: String,
            required: true
        },
        currentPeriodStart: {
            type: String,
            required: true
        },
        currentPeriodEnd: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ["expired", "active", "cancel"],
            default: "active",
            required: true
        },

    },
    {
        timestamps: true
    }
)

subscriptionSchema.index({ user: 1 });
subscriptionSchema.index({ status: 1 });

export const Subscription = model<ISubscription, SubscriptionModel>("Subscription", subscriptionSchema)