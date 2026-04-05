import { Router } from "express";
import { createJob, deleteJob, getJobById, listJobs, updateJob } from "../controllers/job.controller";

export const jobRouter = Router();

jobRouter.get("/", listJobs);
jobRouter.get("/:id", getJobById);
jobRouter.post("/", createJob);
jobRouter.put("/:id", updateJob);
jobRouter.delete("/:id", deleteJob);

