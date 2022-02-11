/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * This is the main entrypoint for the sample REST server, which is responsible
 * for connecting to the Fabric network and setting up a job queue for
 * processing submit transactions
 */

import * as config from './config';
import {
  createGateway,
  createIdentity,
  createSigner,
  getContracts,
  getMetadata,
} from './fabric';
import {
  initJobQueue,
  initJobQueueScheduler,
  initJobQueueWorker,
} from './jobs';
import { logger } from './logger';
import { createServer } from './server';
import { isMaxmemoryPolicyNoeviction } from './redis';
import { Queue, QueueScheduler, Worker } from 'bullmq';
import { createGrpcConnection } from './grpc';

let jobQueue: Queue | undefined;
let jobQueueWorker: Worker | undefined;
let jobQueueScheduler: QueueScheduler | undefined;

async function main() {
  logger.info('Checking Redis config');
  if (!(await isMaxmemoryPolicyNoeviction())) {
    throw new Error(
      'Invalid redis configuration: redis instance must have the setting maxmemory-policy=noeviction'
    );
  }

  logger.info('Creating REST server');
  const app = await createServer();

  logger.info('Connecting to Fabric network with org1 mspid');
  const clientOrg1 = await createGrpcConnection(
    config.tlsRootCertificateOrg1,
    config.peerAddressOrg1,
    config.peerAliasOrg1
  );

  const identityOrg1 = createIdentity(config.mspIdOrg1, config.certificateOrg1);
  const signerOrg1 = createSigner(config.privateKeyOrg1);
  const gatewayOrg1 = createGateway(identityOrg1, signerOrg1, clientOrg1);

  // const networkOrg1 = getNetwork(gatewayOrg1);
  const contractsOrg1 = getContracts(gatewayOrg1);

  app.locals[config.mspIdOrg1] = contractsOrg1;

  logger.info('Connecting to Fabric network with org2 mspid');
  const clientOrg2 = await createGrpcConnection(
    config.tlsRootCertificateOrg2,
    config.peerAddressOrg2,
    config.peerAliasOrg2
  );

  const identityOrg2 = createIdentity(config.mspIdOrg1, config.certificateOrg1);
  const signerOrg2 = createSigner(config.privateKeyOrg1);
  const gatewayOrg2 = createGateway(identityOrg2, signerOrg2, clientOrg2);
  // const networkOrg2 = getNetwork(gatewayOrg2);
  const contractsOrg2 = getContracts(gatewayOrg2);

  app.locals[config.mspIdOrg2] = contractsOrg2;

  logger.info('Validating chaincode metadata');
  // TODO compare metadata from both orgs to ensure it matches?!
  // Optionally compare metadata to expected metadata in config?
  const metadataOrg1 = JSON.parse(await getMetadata(contractsOrg1.contract));
  const metadataOrg2 = JSON.parse(await getMetadata(contractsOrg2.contract));

  logger.debug({ metadataOrg1, metadataOrg2 }, 'Got chaincode metadata');
  app.locals.ccmetadata = metadataOrg2;

  logger.info('Initialising submit job queue');
  jobQueue = initJobQueue();
  jobQueueWorker = initJobQueueWorker(app);
  if (config.submitJobQueueScheduler === true) {
    logger.info('Initialising submit job queue scheduler');
    jobQueueScheduler = initJobQueueScheduler();
  }
  app.locals.jobq = jobQueue;

  logger.info('Starting REST server');
  app.listen(config.port, () => {
    logger.info('REST server started on port: %d', config.port);
  });
}

main().catch(async (err) => {
  logger.error({ err }, 'Unxepected error');

  if (jobQueueScheduler != undefined) {
    logger.debug('Closing job queue scheduler');
    await jobQueueScheduler.close();
  }

  if (jobQueueWorker != undefined) {
    logger.debug('Closing job queue worker');
    await jobQueueWorker.close();
  }

  if (jobQueue != undefined) {
    logger.debug('Closing job queue');
    await jobQueue.close();
  }
});
