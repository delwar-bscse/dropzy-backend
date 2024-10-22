import { Model, Types } from "mongoose";

export type IReview = {
    employer: Types.ObjectId;
    provider: Types.ObjectId;
    comment: string;
    rating: number;
}

export type ReviewModel = Model<IReview>;