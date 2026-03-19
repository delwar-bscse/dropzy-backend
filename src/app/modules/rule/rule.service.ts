import RuleModel from './rule.model';
import { IRule } from './rule.interface.js';
import { StatusCodes } from 'http-status-codes';
import colors from 'colors';
import ApiError from '../../../errors/ApiErrors';

// Function to add rule
const addRuleToDB = async (): Promise<void> => {

  const data = {
    privacyPolicy: '',
    providerUsagePolicy: '',
    termsAndConditions: '',
  };

  const isExistRule = await RuleModel.findOne({}).lean();
  if (isExistRule) {
    return;
  } else {
    const result = await RuleModel.create(data);

    if (!result) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to add rules');
    } else {
      console.log(colors.green('✅ Default rules added to the database'));
    }
  }
};

// Function to get rule
const getRuleFromDB = async (title?: string): Promise<Partial<IRule>> => {
  const rule = await RuleModel.findOne().select(title ? title : '').lean();

  if (!rule) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Rule not found');
  }

  return rule;
};

// Function to update rule
const updateRuleToDB = async (ruleBody: Partial<IRule>): Promise<string> => {

  await RuleModel.findOneAndUpdate({}, ruleBody).lean();

  return `${Object.keys(ruleBody).join(', ')} updated successfully`;
};


export const RuleService = {
  addRuleToDB,
  updateRuleToDB,
  getRuleFromDB,
};




