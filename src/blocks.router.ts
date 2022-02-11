/*
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import { logger } from './logger';

const { INTERNAL_SERVER_ERROR, OK } = StatusCodes;

export const blocksRouter = express.Router();

blocksRouter.get('/', async (req: Request, res: Response) => {
  logger.debug('Get all blocks request received');

  try {
    return res.status(OK);
  } catch (err) {
    logger.error({ err }, 'Error processing get all blocks request');
    return res.status(INTERNAL_SERVER_ERROR).json({
      status: getReasonPhrase(INTERNAL_SERVER_ERROR),
      timestamp: new Date().toISOString(),
    });
  }
});
