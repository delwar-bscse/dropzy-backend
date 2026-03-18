import { StatusCodes } from 'http-status-codes';
import { ReviewModel } from './review.model';
import { IReview } from './review.interface';
import { UserModel } from '../user/user.model';
import ApiError from '../../../errors/ApiErrors';
import { ParcelModel } from '../parcel/parcel.model';
import { ParcelStatus } from '../../../enums/parcel';
import { Types } from 'mongoose';


//create contact support
const createReviewToDB = async (from: string, payload: Partial<IReview>): Promise<any> => {

  const sender = await UserModel.findById(from);
  if (!sender) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Sender doesn't exist!");
  }

  const parcel = await ParcelModel.findOne({
    _id: payload.parcel,
    sender: from,
    status: ParcelStatus.DELIVERED
  })

  if (!parcel) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Parcel doesn't exist!");
  }

  const user = await UserModel.findById(parcel.courier);
  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Courier doesn't exist!");
  }

  const isExistReview = await ReviewModel.findOne({ from: from, to: parcel.courier, parcel: payload.parcel });
  if (isExistReview) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "You already reviewed to this courier!");
  }

  const newReview = {
    from: from,
    to: parcel.courier,
    parcel: payload.parcel,
    rating: payload.rating,
    comment: payload.comment,
  }

  const res = await ReviewModel.create(newReview);

  if (!res) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Review to Provider failed!");
  }

  return { data: res };
};

//create contact support
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