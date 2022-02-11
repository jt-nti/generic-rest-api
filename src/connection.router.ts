/*
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import { logger } from './logger';

const { INTERNAL_SERVER_ERROR, OK } = StatusCodes;

export const connectionRouter = express.Router();

connectionRouter.get('/', async (req: Request, res: Response) => {
  logger.debug('Get connection request received');

  try {
    return res.status(OK);
  } catch (err) {
    logger.error({ err }, 'Error processing get connection request');
    return res.status(INTERNAL_SERVER_ERROR).json({
      status: getReasonPhrase(INTERNAL_SERVER_ERROR),
      timestamp: new Date().toISOString(),
    });
  }
});
