import { Types } from 'mongoose';

export const isValidObjectId = (id: string): boolean => {
  return Types.ObjectId.isValid(id);
};

export const toObjectId = (id: string): Types.ObjectId => {
  return new Types.ObjectId(id);
};