import { Model, Types } from "mongoose";


export type IService = {
    _id?: Types.ObjectId;
    author: Types.ObjectId;
    title: String;
    category: Types.ObjectId;
    image: String;
    price: Number;
    description: String;
    rating: Number;
    status: "Active" | "Inactive";
    totalRating: Number;
}

export type ServiceModel = Model<IService, Record<string, unknown>>;