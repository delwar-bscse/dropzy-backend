import mongoose from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import { FavListModel } from './favList.model';
import ApiError from '../../../errors/ApiErrors';


// add or remove provider to my fav list
const createFavListToDB = async (userId: string, parcelId: string): Promise<any> => {
  let res = null;

  const isExistFavList = await FavListModel.findOne({ userId: new mongoose.Types.ObjectId(userId) });

  if (isExistFavList) {
    if (isExistFavList.parcelIds.includes(new mongoose.Types.ObjectId(parcelId))) {
      res = await FavListModel.findOneAndUpdate(
        { userId: new mongoose.Types.ObjectId(userId) },
        { $pull: { parcelIds: new mongoose.Types.ObjectId(parcelId) } },
        { new: true }
      );
    } else {
      res = await FavListModel.findOneAndUpdate(
        { userId: new mongoose.Types.ObjectId(userId) },
        { $push: { parcelIds: new mongoose.Types.ObjectId(parcelId) } },
        { new: true }
      );
    }
  } else {
    const payload = {
      userId: new mongoose.Types.ObjectId(userId),
      parcelIds: [new mongoose.Types.ObjectId(parcelId)],
    };
    res = await FavListModel.create(payload);
  }



  return res;
};

// get my fav lists
const getFavListToDB = async (userId: string): Promise<any> => {

  const isExistFavList = await FavListModel.findOne({ userId: new mongoose.Types.ObjectId(userId) });

  if (!isExistFavList) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "FavList doesn't exist!");
  }

  return isExistFavList;
};


// get my single fav
const getFavFromDB = async (
  userId: string,
  parcelId: string
): Promise<{ data: any }> => {

  const isExistFavorite = await FavListModel.exists({ userId, parcelIds: parcelId });


  return { data: isExistFavorite ? true : false };
};

// get my fav lists
const getFavListWithDetailsFromDB = async (
  userId: string
): Promise<{ data: any }> => {

  const favList = await FavListModel.findOne({ userId })
    .populate({
      path: 'parcelIds',
      populate: [
        {
          path: 'sender',
          select: 'name email'
        },
        {
          path: 'courier',
          select: 'name email'
        }
      ]
    })
    .lean();

  return { data: favList };
};


export const FavListService = {
  createFavListToDB,
  getFavListToDB,
  getFavListWithDetailsFromDB,
  getFavFromDB
};
