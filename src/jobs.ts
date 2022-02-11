/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * This sample uses BullMQ jobs to process submit transactions, which includes
 * retry support for failing jobs
 */

import { Contract } from '@hyperledger/fabric-gateway';
import { ConnectionOptions, Job, Queue, QueueScheduler, Worker } from 'bullmq';
import { Application } from 'express';
import * as config from './config';
import { getRetryAction, RetryAction } from './errors';
import { evatuateTransaction, submitTransaction } from './fabric';
import { logger } from './logger';

export type JobData = {
  mspId: string;
  transactionName: string;
  submit: boolean;
  transactionArgs: string[];
  transactionState?: Buffer;
  transactionIds: string[];
};

export type JobResult = {
  transactionPayload?: string;
  transactionError?: string;
};

export type JobSummary = {
  jobId: string;
  name: string;
  state: string;
  attempts: number;
  transactionIds: string[];
  result?: JobResult;
};

export class JobNotFoundError extends Error {
  jobId: string;

  constructor(message: string, jobId: string) {
    super(message);
    Object.setPrototypeOf(this, JobNotFoundError.prototype);

    this.name = 'JobNotFoundError';
    this.jobId = jobId;
  }
}

const connection: ConnectionOptions = {
  port: config.redisPort,
  host: config.redisHost,
  username: config.redisUsername,
  password: config.redisPassword,
};

const utf8Decoder = new TextDecoder();

/**
 * Set up the queue for transaction jobs
 */
export const initJobQueue = (): Queue => {
  const jobQueue = new Queue(config.JOB_QUEUE_NAME, {
    connection,
    defaultJobOptions: {
      attempts: config.submitJobAttempts,
      backoff: {
        type: config.submitJobBackoffType,
        delay: config.submitJobBackoffDelay,
      },
      removeOnComplete: config.maxCompletedSubmitJobs,
      removeOnFail: config.maxFailedSubmitJobs,
    },
  });

  return jobQueue;
};

/**
 * Set up a worker to process transaction jobs on the queue, using the
 * processTransactionJob function below
 */
export const initJobQueueWorker = (app: Application): Worker => {
  const worker = new Worker<JobData, JobResult>(
    config.JOB_QUEUE_NAME,
    async (job): Promise<JobResult> => {
      return await processTransactionJob(app, job);
    },
    { connection, concurrency: config.submitJobConcurrency }
  );

  worker.on('failed', (job) => {
    logger.warn({ job }, 'Job failed');
  });

  // Important: need to handle this error otherwise worker may stop
  // processing jobs
  worker.on('error', (err) => {
    logger.error({ err }, 'Worker error');
  });

  if (logger.isLevelEnabled('debug')) {
    worker.on('completed', (job) => {
      logger.debug({ job }, 'Job completed');
    });
  }

  return worker;
};

/**
 * Process a transaction request from the job queue
 *
 * The job will be retried if this function throws an error
 */
export const processTransactionJob = async (
  app: Application,
  job: Job<JobData, JobResult>
): Promise<JobResult> => {
  logger.debug({ jobId: job.id, jobName: job.name }, 'Processing job');

  const contract = app.locals[job.data.mspId]?.contract as Contract;
  if (contract === undefined) {
    logger.error(
      { jobId: job.id, jobName: job.name },
      'Contract not found for MSP ID %s',
      job.data.mspId
    );

    // Retrying will never work without a contract, so give up with an
    // empty job result
    return {
      transactionError: undefined,
      transactionPayload: undefined,
    };
  }

  const args = job.data.transactionArgs;
  // let transaction: Transaction;

  if (job.data.transactionState) {
    const savedState = job.data.transactionState;
    logger.debug(
      {
        jobId: job.id,
        jobName: job.name,
        savedState,
      },
      'Reusing previously saved transaction state'
    );

    // TODO how does this work in new gateway?!
    // transaction = contract.deserializeTransaction(savedState);
  } else {
    logger.debug(
      {
        jobId: job.id,
        jobName: job.name,
      },
      'Using new transaction'
    );

    // TODO how does this work in new gateway?!
    // transaction = contract.createTransaction(job.data.transactionName);
    // await updateJobData(job, transaction);
  }

  logger.debug(
    {
      jobId: job.id,
      jobName: job.name,
      transactionId: 'TODO!!!!',
    },
    'Processing transaction'
  );

  try {
    let result: Uint8Array;
    if (job.data.submit) {
      result = await submitTransaction(
        contract,
        job.data.transactionName,
        ...args
      );
    } else {
      result = await evatuateTransaction(
        contract,
        job.data.transactionName,
        ...args
      );
    }

    return {
      transactionError: undefined,
      transactionPayload: utf8Decoder.decode(result),
    };
  } catch (err) {
    const retryAction = getRetryAction(err);

    if (retryAction === RetryAction.None) {
      logger.error(
        { jobId: job.id, jobName: job.name, err },
        'Fatal transaction error occurred'
      );

      // Not retriable so return a job result with the error details
      return {
        transactionError: `${err}`,
        transactionPayload: undefined,
      };
    }

    logger.warn(
      { jobId: job.id, jobName: job.name, err },
      'Retryable transaction error occurred'
    );

    if (retryAction === RetryAction.WithNewTransactionId) {
      logger.debug(
        { jobId: job.id, jobName: job.name },
        'Clearing saved transaction state'
      );
      // await updateJobData(job, undefined);
    }

    // Rethrow the error to keep retrying
    throw err;
  }
};

/**
 * Set up a scheduler for the submit job queue
 *
 * This manages stalled and delayed jobs and is required for retries with backoff
 */
export const initJobQueueScheduler = (): QueueScheduler => {
  const queueScheduler = new QueueScheduler(config.JOB_QUEUE_NAME, {
    connection,
  });

  queueScheduler.on('failed', (jobId, failedReason) => {
    logger.error({ jobId, failedReason }, 'Queue sceduler failure');
  });

  return queueScheduler;
};

/**
 * Helper to add a new submit transaction job to the queue
 */
export const addTransactionJob = async (
  jobQueue: Queue<JobData, JobResult>,
  mspId: string,
  transactionName: string,
  submit: boolean,
  ...transactionArgs: string[]
): Promise<string> => {
  const jobName = `${transactionName} transaction`;
  const job = await jobQueue.add(jobName, {
    mspId,
    transactionName,
    submit,
    transactionArgs: transactionArgs,
    transactionIds: [],
  });

  if (job?.id === undefined) {
    throw new Error('Job ID not available');
  }

  return job.id;
};

/**
 * Helper to update the data for an existing job
 */
// export const updateJobData = async (
//   job: Job<JobData, JobResult>,
//   transaction: Transaction | undefined
// ): Promise<void> => {
//   const newData = { ...job.data };

//   if (transaction != undefined) {
//     const transationIds = ([] as string[]).concat(
//       newData.transactionIds,
//       transaction.getTransactionId()
//     );
//     newData.transactionIds = transationIds;

//     newData.transactionState = transaction.serialize();
//   } else {
//     newData.transactionState = undefined;
//   }

//   await job.update(newData);
// };

/**
 * Get all the jobs
 */
export const getAllJobs = async (mspId: string, queue: Queue): Promise<any> => {
  // TODO fix return type!
  const jobs = await queue.getJobs([
    'active',
    'completed',
    'delayed',
    'failed',
    'paused',
    'repeat',
    'wait',
    'waiting',
    'waiting-children',
  ]);

  const jobReport = await Promise.all(
    jobs
      .filter((job) => {
        if (job.data && job.data.mspId === mspId) {
          return true;
        }

        return false;
      })
      .map(async (job) => {
        // const state = await job.getState();
        // const summary = {
        //   id: job.id || 'unknown',
        //   name: job.name,
        //   state,
        // };

        // return summary;

        return await getJobSummary(job);
      })
  );

  logger.debug({ jobReport }, 'Jobs');

  return jobReport;
};

/**
 * Gets a job summary
 *
 * This function is used for the jobs REST endpoint
 */
export const getJob = async (
  mspId: string,
  queue: Queue,
  jobId: string
): Promise<JobSummary> => {
  const job: Job<JobData, JobResult> | undefined = await queue.getJob(jobId);
  logger.debug({ job }, 'Got job');

  if (!(job && job.id != undefined)) {
    throw new JobNotFoundError(`Job ${jobId} not found`, jobId);
  }

  if (job?.data?.mspId != mspId) {
    throw new JobNotFoundError(`Job ${jobId} not found`, jobId);
  }

  return await getJobSummary(job);
};

/**
 * Gets a job summary
 *
 * This function is used for the jobs REST endpoint
 */
const getJobSummary = async (
  job: Job<JobData, JobResult>
): Promise<JobSummary> => {
  const state = await job.getState();

  let transactionIds: string[];
  if (job.data && job.data.transactionIds) {
    transactionIds = job.data.transactionIds;
  } else {
    transactionIds = [];
  }

  const jobSummary: JobSummary = {
    jobId: job.id || 'unknown',
    name: job.name,
    state,
    attempts: job.attemptsMade,
    transactionIds,
  };

  if ((await job.isCompleted()) || (await job.isFailed())) {
    jobSummary.result = job.returnvalue;
  }

  return jobSummary;
};

/**
 * Get the current job counts
 *
 * This function is used for the liveness REST endpoint
 */
export const getJobCounts = async (
  queue: Queue
): Promise<{ [index: string]: number }> => {
  const jobCounts = await queue.getJobCounts(
    'active',
    'completed',
    'delayed',
    'failed',
    'waiting'
  );
  logger.debug({ jobCounts }, 'Current job counts');

  return jobCounts;
};
