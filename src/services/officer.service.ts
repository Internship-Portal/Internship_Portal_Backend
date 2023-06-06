import {
  DocumentDefinition,
  FilterQuery,
  UpdateQuery,
  QueryOptions,
} from "mongoose";
import OfficerModel, { Officer } from "../models/officer";

// Create Officer Service
export const createOfficer = (input: DocumentDefinition<Officer>) => {
  return OfficerModel.create(input);
};

// Find Officer Service
export const findOfficer = (
  query: FilterQuery<Officer>,
  options: QueryOptions = { lean: true }
) => {
  return OfficerModel.find(query, {}, options);
};

// Find and Update Officer Service
export function findAndUpdate(
  query: FilterQuery<Officer>,
  update: UpdateQuery<Officer>,
  options: QueryOptions
) {
  return OfficerModel.findOneAndUpdate(query, update, options);
}

// Delete Officer Service
export const deleteOfficer = (query: FilterQuery<Officer>) => {
  return OfficerModel.deleteOne(query);
};
