/*
 * SPDX-License-Identifier: Apache-2.0
 */

import * as grpc from '@grpc/grpc-js';

// const utf8Encoder = new TextEncoder();

// TODO does this work when there is no peerhost alias?!
export const createGrpcConnection = async (
  tlsRootCert: string,
  peerEndpoint: string,
  peerHostAlias?: string
): Promise<grpc.Client> => {
  const tlsCredentials = grpc.credentials.createSsl(Buffer.from(tlsRootCert));
  return new grpc.Client(peerEndpoint, tlsCredentials, {
    'grpc.ssl_target_name_override': peerHostAlias,
  });
};

// TODO use config for timeouts!

export const evaluateOptions = (): grpc.CallOptions => {
  return { deadline: Date.now() + 5000 }; // 5 seconds
};

export const endorseOptions = (): grpc.CallOptions => {
  return { deadline: Date.now() + 15000 }; // 15 seconds
};

export const submitOptions = (): grpc.CallOptions => {
  return { deadline: Date.now() + 5000 }; // 5 seconds
};

export const commitStatusOptions = (): grpc.CallOptions => {
  return { deadline: Date.now() + 60000 }; // 1 minute
};
