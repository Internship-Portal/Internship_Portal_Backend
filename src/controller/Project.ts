import { Response, Request } from "express";
import {
  createProjectStep1Interface,
  createProjectStep2Interface,
} from "../interfaces/Project";
import userModel from "../models/User";
import projectModel, { ProjectSchema } from "../models/Project";

require("dotenv").config();

export const createProjectStep1Controller = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      operation,
      title,
      description,
      quantity,
      startprice,
      endprice,
      expectedDate,
      visibility_time,
    }: createProjectStep1Interface = req.body;

    const { _id } = req.body;

    const user = await userModel.findById({ _id: _id });

    if (!user) {
      // Error: user Not Found
      return res.status(400).json({ message: "User not found" });
    } else {
      if (user.status === 35) {
        // Error: user Not Valid
        return res.status(400).json({ message: "User Profile not created" });
      }

      const currentDate = new Date();
      const visibilityTimeMilliseconds = visibility_time * 60 * 60 * 1000;
      const newVisibilityTime = new Date(
        currentDate.getTime() + visibilityTimeMilliseconds
      );

      // creating new project
      const newProject = await projectModel.create({
        operation: operation,
        title: title.toLowerCase(),
        description: description,
        quantity: quantity,
        startprice: startprice,
        endprice: endprice,
        expectedDate: expectedDate,
        projectCreatorId: _id,
        orgName: user.orgName,
        status: 70,
        drawing: null,
        featureImages: null,
        user_id: user._id,
        pincode: user.pincode,
        visibility_time: newVisibilityTime,
      });

      if (newProject) {
        // saving data in user

        if (user.projects !== undefined) {
          user.projects.push(newProject._id);
        } else {
          return res.status(400).json({ message: "User not valid" });
        }
        const savedUser = await user.save();

        if (savedUser) {
          return res
            .status(200)
            .json({ message: "Project Created", data: newProject._id });
        }
      }
    }
  } catch (err) {
    // Error
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const createProjectStep2Controller = async (
  req: Request,
  res: Response
) => {
  try {
    const { projectId, drawing, featureImages }: createProjectStep2Interface =
      req.body;

    const { _id } = req.body;

    if (!(await userModel.exists({ _id: _id }))) {
      // Error: user Not Found
      return res.status(400).json({ message: "User not found" });
    } else {
      // creating new project
      const updatedProject = await projectModel.findByIdAndUpdate(
        projectId,
        { drawing, featureImages, status: 100 },
        { new: true }
      );

      if (updatedProject) {
        // upadting project
        return res.status(200).json({ message: "Project Created" });
      } else {
        return res.status(400).json({ message: "Project not found in user" });
      }
    }
  } catch (err) {
    // Error
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const checkUniqueTitleController = async (
  req: Request,
  res: Response
) => {
  try {
    const { title, _id }: { title: string; _id: string } = req.body;

    const user = await userModel.findById({ _id: _id });
    if (!user) {
      // Error: user Not Found
      return res.status(400).json({ message: "Invalid Request" });
    } else {
      const project = await projectModel.findOne({
        title: title.toLowerCase(),
      });
      if (!project) {
        // Success
        return res.status(200).json({ message: "Title Not Taken", data: true });
      } else {
        // Error: user Not Found
        return res.status(200).json({ message: "Title taken", data: false });
      }
    }
  } catch (err) {
    // Error
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getProjectByIdController = async (req: Request, res: Response) => {
  try {
    const { projectId }: { projectId: string } = req.body;

    const project = await projectModel
      .findById({ _id: projectId })
      .populate({
        path: "user_id",
        select:
          "username email orgName phoneNumber gstNumber addressLine1 addressLine2 state city pincode representative",
      })
      .populate({
        path: "bidding_ids",
        populate: {
          path: "userId",
          select:
            "username email orgName phoneNumber gstNumber addressLine1 addressLine2 state city pincode representative",
        },
      })
      .populate({
        path: "samples",
        populate: {
          path: "userId",
          select:
            "username email orgName phoneNumber gstNumber addressLine1 addressLine2 state city pincode representative",
        },
      })
      .exec();

    if (!project) {
      // Error: Projects not found
      return res.status(404).json({ message: "Project not found" });
    } else {
      // Success
      return res.status(200).json({ message: "Project", data: project });
    }
  } catch (err) {
    // Error
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getProjectByFiltersController = async (
  req: Request,
  res: Response
) => {
  try {
    const page = parseInt(req.body.page) || 1;
    const limit = parseInt(req.body.limit) || 2;
    const skip = (page - 1) * limit;

    const {
      operation,
      title,
      orgName,
      quantity,
      price,
      expectedDate,
      pincode,
      availableOnly,
    }: {
      operation?: string[];
      title?: string;
      orgName?: string;
      quantity?: number;
      price?: number;
      expectedDate?: Date;
      pincode?: string;
      availableOnly?: boolean;
    } = req.body;

    // Create a filter object based on user input

    const filter: any = {
      status: 100,
      user_id: { $ne: req.body._id },
    };

    if (availableOnly === true) {
      filter.visibility_time = { $gte: new Date() };
      filter.closeBid = false;
    }

    if (pincode !== undefined) {
      filter.pincode = { $regex: pincode, $options: "i" };
    }

    if (operation && operation.length > 0) {
      filter.operation = { $all: operation };
    }

    if (price !== undefined) {
      filter.$and = [
        { startprice: { $lte: price } },
        { endprice: { $gte: price } },
      ];
    }

    if (quantity !== undefined) {
      filter.quantity = { $lte: quantity };
    }

    if (expectedDate !== undefined) {
      filter.expectedDate = { $gte: expectedDate };
    }

    if (title !== undefined) {
      filter.title = { $regex: title, $options: "i" };
    }

    if (orgName !== undefined) {
      filter.orgName = { $regex: orgName, $options: "i" };
    }

    console.log(filter);

    const projects = await projectModel.find(filter).skip(skip).limit(limit);

    if (!projects || projects.length === 0) {
      // Error: Projects not found
      return res.status(200).json({ message: "Projects not found" });
    } else {
      // Success
      return res.status(200).json({ message: "Projects", data: projects });
    }
  } catch (err) {
    // Error
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const closeBiddingController = async (req: Request, res: Response) => {
  try {
    const { projectId }: { projectId: string } = req.body;

    const project = await projectModel.findById({ _id: projectId });

    if (!project) {
      // Error: user Not Found
      return res.status(400).json({ message: "Invalid Request" });
    } else {
      if (project.user_id !== req.body._id) {
        // Error: user Not Found
        return res.status(400).json({ message: "Invalid Request" });
      } else {
        project.closeBid = true;
        const updatedProject = await project.save();
        if (!updatedProject) {
          // Error: user Not Found
          return res.status(400).json({ message: "Invalid Request" });
        } else {
          // Success
          return res.status(200).json({ message: "Project Bidding Closed" });
        }
      }
    }
  } catch (err) {
    // Error
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
