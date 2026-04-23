import { PriceModel } from './price.model';
import { StatusCodes } from 'http-status-codes';
import colors from 'colors';
import ApiError from '../../../errors/ApiErrors';
import { IPrice } from './price.interface';
import redis from '../../../config/redisClient';

// System: Function to add rule
const addPriceToDB = async (): Promise<void> => {

  const data = {
    companyCharge: 0,
    basePrice: 0,
    freeWeight: 0,
    freeDimension: 0,
    weightRate: 0,
    dimensionRate: 0
  };

  const isExistPrice = await PriceModel.findOne({}).lean();
  if (isExistPrice) {
    return;
  } else {
    const result = await PriceModel.create(data);

    if (!result) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to add price');
    } else {
      console.log(colors.green('Default price added to the database'));
    }
  }
};

// calculate price
const calculatePriceFromDB = async ({ weight, dimension }: { weight: number; dimension: number }): Promise<any> => {
  const isExistPrice = await PriceModel.findOne({}).lean();
  if (!isExistPrice) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Price not found');
  }


  const BASE_CHARGE = isExistPrice.basePrice;
  const FREE_WEIGHT = isExistPrice.freeWeight; // kg
  const FREE_DIMENSION = isExistPrice.freeDimension; // cubic cm

  const WEIGHT_RATE = isExistPrice.weightRate; // per kg
  const DIMENSION_RATE = isExistPrice.dimensionRate; // per cubic cm

  // Calculate extra weight
  const extraWeightKg = Math.max(0, weight - FREE_WEIGHT);
  const extraWeightCharge = extraWeightKg * WEIGHT_RATE;

  // Calculate extra dimension
  const extraDimensionCm = Math.max(0, dimension - FREE_DIMENSION);
  const extraDimensionCharge = extraDimensionCm * DIMENSION_RATE;

  // Total
  const totalCharge =
    BASE_CHARGE + extraWeightCharge + extraDimensionCharge;

  return {
    baseCharge: BASE_CHARGE,
    extraWeightKg,
    extraWeightCharge,
    extraDimensionCm,
    extraDimensionCharge,
    totalCharge,
  };
};

// get price
const getPriceFromDB = async (): Promise<Partial<IPrice>> => {
  const cachedPrice = await redis.get('price123');
  if (cachedPrice) {
    return JSON.parse(cachedPrice);
  }

  const price = await PriceModel.findOne({}).lean();

  if (!price) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Price not found');
  }

  await redis.set('price123', JSON.stringify(price));

  return price;
};

// update price
const updatePriceToDB = async (payload: Partial<IPrice>): Promise<string> => {

  const price = await PriceModel.findOneAndUpdate({}, payload).lean();

  if (!price) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Price update failed');
  }

  // await redis.del('price123');
  await redis.set('price123', JSON.stringify(price));

  return `Price updated successfully`;
};




export const PriceService = {
  addPriceToDB,
  updatePriceToDB,
  getPriceFromDB,
  calculatePriceFromDB,
};