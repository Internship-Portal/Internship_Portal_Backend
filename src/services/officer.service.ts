import {
  DocumentDefinition,
  FilterQuery,
  UpdateQuery,
  QueryOptions,
} from "mongoose";
import OfficerModel, { Officer } from "../models/officer";

export const createOfficer = (input: DocumentDefinition<Officer>) => {
  return OfficerModel.create(input);
};

export const findOfficer = (
  query: FilterQuery<Officer>,
  options: QueryOptions = { lean: true }
) => {
  return OfficerModel.find(query, {}, options);
};

export function findAndUpdate(
  query: FilterQuery<Officer>,
  update: UpdateQuery<Officer>,
  options: QueryOptions
) {
  return OfficerModel.findOneAndUpdate(query, update, options);
}

export const deleteOfficer = (query: FilterQuery<Officer>) => {
  return OfficerModel.deleteOne(query);
};
