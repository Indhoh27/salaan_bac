import type { Request, Response } from "express";
export declare function listJobs(_req: Request, res: Response): Promise<void>;
export declare function getJobById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function createJob(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function updateJob(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function deleteJob(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=job.controller.d.ts.map