/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Queue } from 'bullmq';
import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import {
  addTransactionJob,
  getAllJobs,
  getJob,
  JobNotFoundError,
} from './jobs';
import { logger } from './logger';

const { ACCEPTED, BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND, OK } =
  StatusCodes;

export const jobsRouter = express.Router();

jobsRouter.get('/', async (req: Request, res: Response) => {
  logger.debug('Get all jobs request received');

  try {
    const mspId = req.user as string;
    const submitQueue = req.app.locals.jobq as Queue;

    const allJobsSummary = await getAllJobs(mspId, submitQueue);

    return res.status(OK).json(allJobsSummary);
  } catch (err) {
    logger.error({ err }, 'Error processing get all jobs request');
    return res.status(INTERNAL_SERVER_ERROR).json({
      status: getReasonPhrase(INTERNAL_SERVER_ERROR),
      timestamp: new Date().toISOString(),
    });
  }
});

jobsRouter.get('/:jobId', async (req: Request, res: Response) => {
  const jobId = req.params.jobId;
  logger.debug('Read request received for job ID %s', jobId);

  try {
    const mspId = req.user as string;
    const submitQueue = req.app.locals.jobq as Queue;

    const jobSummary = await getJob(mspId, submitQueue, jobId);

    return res.status(OK).json(jobSummary);
  } catch (err) {
    logger.error({ err }, 'Error processing read request for job ID %s', jobId);

    if (err instanceof JobNotFoundError) {
      return res.status(NOT_FOUND).json({
        status: getReasonPhrase(NOT_FOUND),
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(INTERNAL_SERVER_ERROR).json({
      status: getReasonPhrase(INTERNAL_SERVER_ERROR),
      timestamp: new Date().toISOString(),
    });
  }
});

// TODO validate transaction and args against metadata!!
// TODO add transient data and endorsing orgs... https://hyperledger.github.io/fabric-gateway/main/api/node/interfaces/ProposalOptions.html
jobsRouter.post(
  '/',
  body().isObject().withMessage('body must contain TBC'),
  body('transaction', 'must be a string').notEmpty(),
  body('submit', 'must be a boolean').isBoolean(),
  body('arguments', 'must be an array').isArray({ min: 0 }), // TODO check array only contains strings!!
  async (req: Request, res: Response) => {
    logger.debug(req.body, 'Create asset request received');

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(BAD_REQUEST).json({
        status: getReasonPhrase(BAD_REQUEST),
        reason: 'VALIDATION_ERROR',
        message: 'Invalid request body',
        timestamp: new Date().toISOString(),
        errors: errors.array(),
      });
    }

    const mspId = req.user as string;

    try {
      const submitQueue = req.app.locals.jobq as Queue;
      const jobId = await addTransactionJob(
        submitQueue,
        mspId,
        req.body.transaction,
        req.body.submit,
        ...req.body.arguments
      );

      return res.status(ACCEPTED).json({
        status: getReasonPhrase(ACCEPTED),
        jobId: jobId,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      logger.error({ err }, 'Error processing create job request');

      return res.status(INTERNAL_SERVER_ERROR).json({
        status: getReasonPhrase(INTERNAL_SERVER_ERROR),
        timestamp: new Date().toISOString(),
      });
    }
  }
);
