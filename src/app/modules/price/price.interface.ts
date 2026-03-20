import { Model } from "mongoose";


export interface IPrice  {
  basePrice: number;
  freeWeight: number;
  freeDimension: number;
  weightRate: number;
  dimensionRate: number;
}

export type TPriceModel = Model<IPrice>