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

export const deleteOfficer = (query: FilterQuery<Officer>) => {
  return OfficerModel.deleteOne(query);
};
