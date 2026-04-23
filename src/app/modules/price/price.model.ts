import { Schema, model } from 'mongoose';
import { IPrice, TPriceModel } from './price.interface'; // Adjust the path as necessary

const PriceSchema = new Schema<IPrice, TPriceModel>(
  {
    companyCharge: {
      type: Number,
      default: 0,
    },
    basePrice: {
      type: Number,
      default: 0,
    },
    freeWeight: {
      type: Number,
      default: 0,
    },
    freeDimension: {
      type: Number,
      default: 0,
    },
    weightRate: {
      type: Number,
      default: 0,
    },
    dimensionRate: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

// Create the model
export const PriceModel = model<IPrice, TPriceModel>('price', PriceSchema);
