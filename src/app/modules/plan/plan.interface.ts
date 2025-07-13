import { Model, Types } from "mongoose";

export type IPlan = {
    _id?: Types.ObjectId;
    name: String;
    description: String;
    price: Number;
    duration: '1 month' | '3 months' | '6 months' | '1 year'; 
    paymentType: 'Monthly' | 'Yearly';
    productId?: String;
    paymentLink?: string;
    status: 'Active' | 'Delete'
}

export type PlanModel = Model<IPlan, Record<string, unknown>>;