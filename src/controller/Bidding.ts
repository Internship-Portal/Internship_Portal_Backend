import { Response, Request } from "express";
import userModel from "../models/User";
import projectModel from "../models/Project";
import BiddingModel from "../models/Bidding";
import { askForSampleMail } from "../config/SES";
import { userInterface } from "../interfaces/User";

export const addBidding = async (req: Request, res: Response) => {
  try {
    const { price, userId, projectId } = req.body;

    const user = await userModel.findById(userId);

    const project = await projectModel.findById(projectId);

    if (!user || !project) {
      return res.status(400).json({ message: "User or Project not found" });
    } else {
      if (
        project.closeBid === true ||
        new Date(project.visibility_time) <= new Date()
      ) {
        return res.status(400).json({ message: "Bid is closed" });
      }

      const bidding = await BiddingModel.create({
        price: price,
        userId: userId,
        projectId: projectId,
      });

      project.bidding_ids.push(bidding._id);
      await projectModel.findByIdAndUpdate(projectId, {
        bidding_ids: project.bidding_ids,
      });

      return res.status(200).json({
        message: "Bidding added successfully",
        bidding: bidding,
        project: project,
      });
    }
  } catch (e) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const askForSampleController = async (req: Request, res: Response) => {
  try {
    const { _id, biddingId } = req.body;

    const user = await userModel.findById(_id);

    const bidding = await BiddingModel.findById(biddingId)
      .populate("userId")
      .exec();

    if (!user || !bidding) {
      return res.status(400).json({ message: "User or Bidding not found" });
    } else {
      const userId = bidding.userId as userInterface | { email: "" };
      askForSampleMail({
        templateName: "askForSampleTemplate",
        recipientEmail: userId?.email,
        link: `${process.env.FRONTEND_URL}/user/${user.username}`,
      }).then(async (data) => {
        const project = await projectModel.findById(bidding.projectId);

        if (!project) {
          return res.status(400).json({ message: "Project not found" });
        } else {
          project.samples.push(bidding._id);
          bidding.askForSample = true;
          bidding.sampleAskedDate = new Date();
          await project.save();
          await bidding.save();
          return res.status(200).json({
            message: "Sample asked successfully",
            bidding: bidding,
          });
        }
      });
    }
  } catch (e) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
