import { StatusCodes } from 'http-status-codes';
import { ReviewModel } from './review.model';
import { IReview } from './review.interface';
import { UserModel } from '../user/user.model';
import ApiError from '../../../errors/ApiErrors';
import { ParcelModel } from '../parcel/parcel.model';
import { ParcelStatus } from '../../../enums/parcel';
import mongoose, { Types } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';


// create review to db
const createReviewToDB = async (from: string, payload: any): Promise<any> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const reviewFrom = await UserModel.findById(from).session(session);
    if (!reviewFrom) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Review sender doesn't exist!");
    }

    const reviewTo = await UserModel.findById(payload.to).session(session);
    if (!reviewTo) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Review receiver doesn't exist!");
    }

    const parcel = await ParcelModel.findOne({
      _id: payload.parcel,
      status: ParcelStatus.DELIVERED
    }).session(session);

    if (!parcel) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Parcel doesn't exist or not delivered!");
    }

    const isExistReview = await ReviewModel.findOne({
      parcel: payload.parcel,
      from: reviewFrom._id,
      to: reviewTo._id
    }).session(session);

    if (isExistReview) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Review already exists for this parcel!");
    }

    const [newReview] = await ReviewModel.create([{
      from: reviewFrom._id,
      to: reviewTo._id,
      parcel: parcel._id,
      rating: payload.rating,
      comment: payload.comment,
    }], { session });

    const updateField =
      payload.sender_role === USER_ROLES.SENDER
        ? { c_rides: 1, c_rating: Number(payload.rating) }
        : { s_rides: 1, s_rating: Number(payload.rating) };

    await UserModel.findByIdAndUpdate(
      payload.to,
      { $inc: updateField },
      { session }
    );

    await session.commitTransaction();

    return { data: newReview };

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// get review from db
const getReviewFromDB = async (
  id: string,
  page: number = 1,
  limit: number = 10
): Promise<any> => {
  const skip = (page - 1) * limit;

  const result = await ReviewModel.aggregate([
    {
      $match: {
        to: new Types.ObjectId(id)
      }
    },
    {
      $facet: {
        data: [
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: limit }
        ],
        totalReview: [
          { $count: "count" }
        ],
        averageRating: [
          {
            $group: {
              _id: null,
              avg: { $avg: "$rating" }
            }
          }
        ]
      }
    }
  ]);

  const formatted = result[0];

  const total = formatted.totalReview[0]?.count || 0;
  const avg = formatted.averageRating[0]?.avg || 0;
  const totalPage = Math.ceil(total / limit)

  return {
    meta: {
      page,
      limit,
      total,
      totalPage
    },
    data: {
      reviews: formatted.data,
      averageRating: avg,
      totalReview: total
    }
  };
};

export const ReviewService = {
  createReviewToDB,
  getReviewFromDB
};