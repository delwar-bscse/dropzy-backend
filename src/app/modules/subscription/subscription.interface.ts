import { Model, Types } from 'mongoose';

export type ISubscription = {
    price: number;
    user: Types.ObjectId;
    plan: Types.ObjectId;
    subscriptionId: string;
    status: 'expired' | 'active' | 'cancel';
    currentPeriodStart: string;
    currentPeriodEnd: string;
};

export type SubscriptionModel = Model<ISubscription, Record<string, unknown>>;