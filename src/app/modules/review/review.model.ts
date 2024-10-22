import { model, Schema } from "mongoose";
import { IReview, ReviewModel } from "./review.interface";

const reviewSchema = new Schema<IReview, ReviewModel>(
    {
        provider: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        employer: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        comment: {
            type: String,
            required: true
        },
        rating: {
            type: Number,
            required: true
        },

    },
    {timestamps: true}
);

export const Review = model<IReview, ReviewModel>("Review", reviewSchema);