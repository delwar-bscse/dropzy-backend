import mongoose, { Model } from 'mongoose';

export type IFavList = {
  userId:  mongoose.Types.ObjectId;
  parcelIds:  [mongoose.Types.ObjectId];
};

export type IFavListModal = Model<IFavList>;