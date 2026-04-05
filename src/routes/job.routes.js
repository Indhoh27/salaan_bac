"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobRouter = void 0;
const express_1 = require("express");
const job_controller_1 = require("../controllers/job.controller");
exports.jobRouter = (0, express_1.Router)();
exports.jobRouter.get("/", job_controller_1.listJobs);
exports.jobRouter.get("/:id", job_controller_1.getJobById);
exports.jobRouter.post("/", job_controller_1.createJob);
exports.jobRouter.put("/:id", job_controller_1.updateJob);
exports.jobRouter.delete("/:id", job_controller_1.deleteJob);
//# sourceMappingURL=job.routes.js.map