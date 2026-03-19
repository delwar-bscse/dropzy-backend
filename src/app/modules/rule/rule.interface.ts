import { Document } from 'mongoose';

// Define the interface for your settings
export interface IRule extends Document {
  privacyPolicy: string;
  termsAndConditions: string;
}