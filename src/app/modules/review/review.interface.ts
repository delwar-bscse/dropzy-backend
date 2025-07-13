import { Model, Types } from "mongoose";

export type IReview = {
    _id?: Types.ObjectId;
    user: Types.ObjectId;
    service: Types.ObjectId;
    comment: string;
    rating: number;
}

export type ReviewModel = Model<IReview>;