import { JwtPayload } from "jsonwebtoken";
import { ISubscription } from "./subscription.interface";
import { Subscription } from "./subscription.model";
import stripe from "../../../config/stripe";
import { User } from "../user/user.model";
import { FilterQuery } from "mongoose";
import QueryBuilder from "../../../helpers/QueryBuilder";
import ApiError from "../../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";
import redis from "../../../config/redisClient";


const subscriptionDetailsFromDB = async (user: JwtPayload): Promise<ISubscription> => {

    const cachedSubscription = await redis.get(`subscription:${user.id}`);
    if (cachedSubscription) {
        return JSON.parse(cachedSubscription);
    }

    const subscription = await Subscription.findOne({ user: user.id }).populate("plan", "title price").lean();
    if (!subscription) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Subscription not found');
    }

    const subscriptionFromStripe = await stripe.subscriptions.retrieve(subscription.subscriptionId);

    // Check subscription status and update database accordingly
    if (subscriptionFromStripe?.status !== "active") {
        await Promise.all([
            User.findByIdAndUpdate(user.id, { isSubscribed: false }, { new: true }),
            Subscription.findOneAndUpdate({ user: user.id }, { status: "expired" }, { new: true }),
        ]);
        await redis.del(`subscription:${user.id}`);
    }

    await redis.set(`subscription:${user.id}`, JSON.stringify(subscription), 'EX', 60 * 30);

    return subscription;
};


const subscriptionsFromDB = async (query: FilterQuery<ISubscription>): Promise<{subscriptions: ISubscription[], pagination: any}> => {

    const subscriptionQuery = new QueryBuilder(
        Subscription.find(query).lean().exec(),
        query
    ).paginate().filter();

    const [subscriptions, pagination] = await Promise.all([
        subscriptionQuery.queryModel.populate("plan", "title price").populate("user", "name profile email"),
        subscriptionQuery.getPaginationInfo()
    ]);

    return { subscriptions, pagination };
}

export const SubscriptionService = {
    subscriptionDetailsFromDB,
    subscriptionsFromDB
}