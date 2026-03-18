
import { model, Schema } from 'mongoose';
import { IReview, IReviewModal } from './review.interface';

const reviewSchema = new Schema<IReview, IReviewModal>(
  {
    from: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    parcel: {
      type: Schema.Types.ObjectId,
      ref: 'Parcel',
    },
    rating: {
      type: Number,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);


export const ReviewModel = model<IReview, IReviewModal>('Review', reviewSchema);
