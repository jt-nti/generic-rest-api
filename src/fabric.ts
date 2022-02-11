/*
 * SPDX-License-Identifier: Apache-2.0
 */

import * as grpc from '@grpc/grpc-js';
import * as crypto from 'crypto';
import {
  connect,
  ConnectOptions,
  Contract,
  Gateway,
  Identity,
  ProposalOptions,
  Signer,
  signers,
} from '@hyperledger/fabric-gateway';
import * as config from './config';
import { logger } from './logger';
import { handleError } from './errors';
import {
  commitStatusOptions,
  endorseOptions,
  evaluateOptions,
  submitOptions,
} from './grpc';

const utf8Encoder = new TextEncoder();
const utf8Decoder = new TextDecoder();

export const createIdentity = (
  mspId: string,
  certificate: string
): Identity => {
  const credentials = utf8Encoder.encode(certificate);
  return { mspId, credentials };
};

export const createSigner = (privateKey: string): Signer => {
  const key = crypto.createPrivateKey(privateKey);
  return signers.newPrivateKeySigner(key);
};

/**
 * Create a Gateway connection
 *
 * Gateway instances can and should be reused rather than connecting to submit every transaction
 */
export const createGateway = (
  identity: Identity,
  signer: Signer,
  client: grpc.Client
): Gateway => {
  const options: ConnectOptions = {
    identity: identity,
    signer: signer,
    client: client,
    evaluateOptions: evaluateOptions,
    endorseOptions: endorseOptions,
    submitOptions: submitOptions,
    commitStatusOptions: commitStatusOptions,
  };

  const gateway = connect(options);

  return gateway;
};

/**
 * Get the network which the asset transfer sample chaincode is running on
 *
 * In addion to getting the contract, the network will also be used to
 * start a block event listener
 */
// export const getNetwork = (gateway: Gateway): Network => {
//   const network = gateway.getNetwork(config.channelName);
//   return network;
// };

/**
 * Get the asset transfer sample contract and the qscc system contract
 *
 * The system contract is used for the liveness REST endpoint
 */
export const getContracts = (
  gateway: Gateway
): { contract: Contract; qsccContract: Contract } => {
  const network = gateway.getNetwork(config.channelName);
  const contract = network.getContract(config.chaincodeName);
  const qsccContract = network.getContract('qscc');
  return { contract, qsccContract };
};

/**
 * Evaluate a transaction and handle any errors
 */
export const evatuateTransaction = async (
  contract: Contract,
  transactionName: string,
  ...transactionArgs: string[]
): Promise<Uint8Array> => {
  const options: ProposalOptions = {
    arguments: transactionArgs,
  };
  const proposal = contract.newProposal(transactionName, options);
  const transactionId = proposal.getTransactionId();
  logger.trace(
    { contract, transactionName, transactionArgs },
    'Evaluating transaction'
  );

  try {
    const result = await proposal.evaluate();
    logger.trace(
      { transactionId, result },
      'Evaluate transaction response received'
    );
    return result;
  } catch (err) {
    throw handleError(transactionId, err);
  }
};

/**
 * Submit a transaction and handle any errors
 *
 * TODO handle resubmitting same transaction ID!!!
 */
export const submitTransaction = async (
  contract: Contract,
  transactionName: string,
  ...transactionArgs: string[]
): Promise<Uint8Array> => {
  logger.trace(
    { contract, transactionName, transactionArgs },
    'Submitting transaction'
  );

  const options: ProposalOptions = {
    arguments: transactionArgs,
  };
  const proposal = contract.newProposal(transactionName, options);
  const transactionId = proposal.getTransactionId();

  try {
    const transaction = await proposal.endorse();
    const commit = await transaction.submit();

    const result = transaction.getResult();
    const status = await commit.getStatus();

    logger.trace(
      { transactionId, result, status },
      'Submit transaction response received'
    );
    return result;
  } catch (err) {
    throw handleError(transactionId, err);
  }
};

/**
 * Get the validation code of the specified transaction
 */
export const getTransactionValidationCode = async (
  _qsccContract: Contract,
  transactionId: string
): Promise<string> => {
  // const data = await evatuateTransaction(
  //   qsccContract,
  //   'GetTransactionByID',
  //   config.channelName,
  //   transactionId
  // );

  // TODO new gateway?!
  // const processedTransaction = protos.protos.ProcessedTransaction.decode(data);
  // const validationCode =
  //   protos.protos.TxValidationCode[processedTransaction.validationCode];
  const validationCode = 'TODO';

  logger.debug({ transactionId }, 'Validation code: %s', validationCode);
  return validationCode;
};

/**
 * Get the current block height
 *
 * This example of using a system contract is used for the liveness REST
 * endpoint
 */
export const getBlockHeight = async (
  qscc: Contract
): Promise<number | Long.Long> => {
  const data = await qscc.evaluateTransaction(
    'GetChainInfo',
    config.channelName
  );
  // const info = protos.common.BlockchainInfo.decode(data);
  // const blockHeight = info.height;

  // logger.debug('Current block height: %d', blockHeight);
  // return blockHeight;
  logger.debug('Chain info data: %s', data);
  return 0;
};

/**
 * Get the chaincode metadata
 */
export const getMetadata = async (contract: Contract): Promise<string> => {
  logger.info('Getting chaincode metadata');

  const result = await evatuateTransaction(
    contract,
    'org.hyperledger.fabric:GetMetadata'
  );
  const metadata = utf8Decoder.decode(result);

  return metadata;
};
