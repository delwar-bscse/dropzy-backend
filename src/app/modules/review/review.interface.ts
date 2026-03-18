import mongoose, { Model } from 'mongoose';

export type IReview = {
  from:  mongoose.Types.ObjectId;
  to:  mongoose.Types.ObjectId;
  parcel: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
};

export type IReviewModal = Model<IReview>;