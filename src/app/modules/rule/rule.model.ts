import { Schema, model } from 'mongoose';
import { IRule } from './rule.interface'; // Adjust the path as necessary

const RuleSchema = new Schema<IRule>(
  {
    privacyPolicy: {
      type: String,
      default: '',
    },
    termsAndConditions: {
      type: String,
      default: '',
    },
  },
  { timestamps: true },
);

// Create the model
const RuleModel = model<IRule>('rule', RuleSchema);

export default RuleModel;
