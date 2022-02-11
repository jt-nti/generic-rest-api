/*
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import { logger } from './logger';

const { INTERNAL_SERVER_ERROR, OK } = StatusCodes;

export const metadataRouter = express.Router();

metadataRouter.get('/', async (req: Request, res: Response) => {
  logger.debug('Get metadata request received');

  try {
    const metadata = req.app.locals.ccmetadata;

    return res.status(OK).json(metadata);
  } catch (err) {
    logger.error({ err }, 'Error processing get metadata request');
    return res.status(INTERNAL_SERVER_ERROR).json({
      status: getReasonPhrase(INTERNAL_SERVER_ERROR),
      timestamp: new Date().toISOString(),
    });
  }
});
