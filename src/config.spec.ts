/*
 * SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable @typescript-eslint/no-var-requires */

describe('Config values', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(async () => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  describe('logLevel', () => {
    it('defaults to "info"', () => {
      const config = require('./config');
      expect(config.logLevel).toBe('info');
    });

    it('can be configured using the "LOG_LEVEL" environment variable', () => {
      process.env.LOG_LEVEL = 'debug';
      const config = require('./config');
      expect(config.logLevel).toBe('debug');
    });

    it('throws an error when the "LOG_LEVEL" environment variable has an invalid log level', () => {
      process.env.LOG_LEVEL = 'ludicrous';
      expect(() => {
        require('./config');
      }).toThrow(
        'env-var: "LOG_LEVEL" should be one of [fatal, error, warn, info, debug, trace, silent]'
      );
    });
  });

  describe('port', () => {
    it('defaults to "3000"', () => {
      const config = require('./config');
      expect(config.port).toBe(3000);
    });

    it('can be configured using the "PORT" environment variable', () => {
      process.env.PORT = '8000';
      const config = require('./config');
      expect(config.port).toBe(8000);
    });

    it('throws an error when the "PORT" environment variable has an invalid port number', () => {
      process.env.PORT = '65536';
      expect(() => {
        require('./config');
      }).toThrow(
        'env-var: "PORT" cannot assign a port number greater than 65535. An example of a valid value would be: 3000'
      );
    });
  });

  describe('submitJobBackoffType', () => {
    it('defaults to "fixed"', () => {
      const config = require('./config');
      expect(config.submitJobBackoffType).toBe('fixed');
    });

    it('can be configured using the "SUBMIT_JOB_BACKOFF_TYPE" environment variable', () => {
      process.env.SUBMIT_JOB_BACKOFF_TYPE = 'exponential';
      const config = require('./config');
      expect(config.submitJobBackoffType).toBe('exponential');
    });

    it('throws an error when the "LOG_LEVEL" environment variable has an invalid log level', () => {
      process.env.SUBMIT_JOB_BACKOFF_TYPE = 'jitter';
      expect(() => {
        require('./config');
      }).toThrow(
        'env-var: "SUBMIT_JOB_BACKOFF_TYPE" should be one of [fixed, exponential]'
      );
    });
  });

  describe('submitJobBackoffDelay', () => {
    it('defaults to "3000"', () => {
      const config = require('./config');
      expect(config.submitJobBackoffDelay).toBe(3000);
    });

    it('can be configured using the "SUBMIT_JOB_BACKOFF_DELAY" environment variable', () => {
      process.env.SUBMIT_JOB_BACKOFF_DELAY = '9999';
      const config = require('./config');
      expect(config.submitJobBackoffDelay).toBe(9999);
    });

    it('throws an error when the "SUBMIT_JOB_BACKOFF_DELAY" environment variable has an invalid number', () => {
      process.env.SUBMIT_JOB_BACKOFF_DELAY = 'short';
      expect(() => {
        require('./config');
      }).toThrow(
        'env-var: "SUBMIT_JOB_BACKOFF_DELAY" should be a valid integer. An example of a valid value would be: 3000'
      );
    });
  });

  describe('submitJobAttempts', () => {
    it('defaults to "5"', () => {
      const config = require('./config');
      expect(config.submitJobAttempts).toBe(5);
    });

    it('can be configured using the "SUBMIT_JOB_ATTEMPTS" environment variable', () => {
      process.env.SUBMIT_JOB_ATTEMPTS = '9999';
      const config = require('./config');
      expect(config.submitJobAttempts).toBe(9999);
    });

    it('throws an error when the "SUBMIT_JOB_ATTEMPTS" environment variable has an invalid number', () => {
      process.env.SUBMIT_JOB_ATTEMPTS = 'lots';
      expect(() => {
        require('./config');
      }).toThrow(
        'env-var: "SUBMIT_JOB_ATTEMPTS" should be a valid integer. An example of a valid value would be: 5'
      );
    });
  });

  describe('submitJobConcurrency', () => {
    it('defaults to "5"', () => {
      const config = require('./config');
      expect(config.submitJobConcurrency).toBe(5);
    });

    it('can be configured using the "SUBMIT_JOB_CONCURRENCY" environment variable', () => {
      process.env.SUBMIT_JOB_CONCURRENCY = '9999';
      const config = require('./config');
      expect(config.submitJobConcurrency).toBe(9999);
    });

    it('throws an error when the "SUBMIT_JOB_CONCURRENCY" environment variable has an invalid number', () => {
      process.env.SUBMIT_JOB_CONCURRENCY = 'lots';
      expect(() => {
        require('./config');
      }).toThrow(
        'env-var: "SUBMIT_JOB_CONCURRENCY" should be a valid integer. An example of a valid value would be: 5'
      );
    });
  });

  describe('maxCompletedSubmitJobs', () => {
    it('defaults to "1000"', () => {
      const config = require('./config');
      expect(config.maxCompletedSubmitJobs).toBe(1000);
    });

    it('can be configured using the "MAX_COMPLETED_SUBMIT_JOBS" environment variable', () => {
      process.env.MAX_COMPLETED_SUBMIT_JOBS = '9999';
      const config = require('./config');
      expect(config.maxCompletedSubmitJobs).toBe(9999);
    });

    it('throws an error when the "MAX_COMPLETED_SUBMIT_JOBS" environment variable has an invalid number', () => {
      process.env.MAX_COMPLETED_SUBMIT_JOBS = 'lots';
      expect(() => {
        require('./config');
      }).toThrow(
        'env-var: "MAX_COMPLETED_SUBMIT_JOBS" should be a valid integer. An example of a valid value would be: 1000'
      );
    });
  });

  describe('maxFailedSubmitJobs', () => {
    it('defaults to "1000"', () => {
      const config = require('./config');
      expect(config.maxFailedSubmitJobs).toBe(1000);
    });

    it('can be configured using the "MAX_FAILED_SUBMIT_JOBS" environment variable', () => {
      process.env.MAX_FAILED_SUBMIT_JOBS = '9999';
      const config = require('./config');
      expect(config.maxFailedSubmitJobs).toBe(9999);
    });

    it('throws an error when the "MAX_FAILED_SUBMIT_JOBS" environment variable has an invalid number', () => {
      process.env.MAX_FAILED_SUBMIT_JOBS = 'lots';
      expect(() => {
        require('./config');
      }).toThrow(
        'env-var: "MAX_FAILED_SUBMIT_JOBS" should be a valid integer. An example of a valid value would be: 1000'
      );
    });
  });

  describe('submitJobQueueScheduler', () => {
    it('defaults to "true"', () => {
      const config = require('./config');
      expect(config.submitJobQueueScheduler).toBe(true);
    });

    it('can be configured using the "SUBMIT_JOB_QUEUE_SCHEDULER" environment variable', () => {
      process.env.SUBMIT_JOB_QUEUE_SCHEDULER = 'false';
      const config = require('./config');
      expect(config.submitJobQueueScheduler).toBe(false);
    });

    it('throws an error when the "SUBMIT_JOB_QUEUE_SCHEDULER" environment variable has an invalid boolean value', () => {
      process.env.SUBMIT_JOB_QUEUE_SCHEDULER = '11';
      expect(() => {
        require('./config');
      }).toThrow(
        'env-var: "SUBMIT_JOB_QUEUE_SCHEDULER" should be either "true", "false", "TRUE", or "FALSE". An example of a valid value would be: true'
      );
    });
  });

  describe('mspIdOrg1', () => {
    it('defaults to "Org1MSP"', () => {
      const config = require('./config');
      expect(config.mspIdOrg1).toBe('Org1MSP');
    });

    it('can be configured using the "HLF_MSP_ID_ORG1" environment variable', () => {
      process.env.HLF_MSP_ID_ORG1 = 'Test1MSP';
      const config = require('./config');
      expect(config.mspIdOrg1).toBe('Test1MSP');
    });
  });

  describe('mspIdOrg2', () => {
    it('defaults to "Org2MSP"', () => {
      const config = require('./config');
      expect(config.mspIdOrg2).toBe('Org2MSP');
    });

    it('can be configured using the "HLF_MSP_ID_ORG2" environment variable', () => {
      process.env.HLF_MSP_ID_ORG2 = 'Test2MSP';
      const config = require('./config');
      expect(config.mspIdOrg2).toBe('Test2MSP');
    });
  });

  describe('channelName', () => {
    it('defaults to "mychannel"', () => {
      const config = require('./config');
      expect(config.channelName).toBe('mychannel');
    });

    it('can be configured using the "HLF_CHANNEL_NAME" environment variable', () => {
      process.env.HLF_CHANNEL_NAME = 'testchannel';
      const config = require('./config');
      expect(config.channelName).toBe('testchannel');
    });
  });

  describe('chaincodeName', () => {
    it('defaults to "basic"', () => {
      const config = require('./config');
      expect(config.chaincodeName).toBe('basic');
    });

    it('can be configured using the "HLF_CHAINCODE_NAME" environment variable', () => {
      process.env.HLF_CHAINCODE_NAME = 'testcc';
      const config = require('./config');
      expect(config.chaincodeName).toBe('testcc');
    });
  });

  describe('commitTimeout', () => {
    it('defaults to "300"', () => {
      const config = require('./config');
      expect(config.commitTimeout).toBe(300);
    });

    it('can be configured using the "HLF_COMMIT_TIMEOUT" environment variable', () => {
      process.env.HLF_COMMIT_TIMEOUT = '9999';
      const config = require('./config');
      expect(config.commitTimeout).toBe(9999);
    });

    it('throws an error when the "HLF_COMMIT_TIMEOUT" environment variable has an invalid number', () => {
      process.env.HLF_COMMIT_TIMEOUT = 'short';
      expect(() => {
        require('./config');
      }).toThrow(
        'env-var: "HLF_COMMIT_TIMEOUT" should be a valid integer. An example of a valid value would be: 300'
      );
    });
  });

  describe('endorseTimeout', () => {
    it('defaults to "30"', () => {
      const config = require('./config');
      expect(config.endorseTimeout).toBe(30);
    });

    it('can be configured using the "HLF_ENDORSE_TIMEOUT" environment variable', () => {
      process.env.HLF_ENDORSE_TIMEOUT = '9999';
      const config = require('./config');
      expect(config.endorseTimeout).toBe(9999);
    });

    it('throws an error when the "HLF_ENDORSE_TIMEOUT" environment variable has an invalid number', () => {
      process.env.HLF_ENDORSE_TIMEOUT = 'short';
      expect(() => {
        require('./config');
      }).toThrow(
        'env-var: "HLF_ENDORSE_TIMEOUT" should be a valid integer. An example of a valid value would be: 30'
      );
    });
  });

  describe('queryTimeout', () => {
    it('defaults to "3"', () => {
      const config = require('./config');
      expect(config.queryTimeout).toBe(3);
    });

    it('can be configured using the "HLF_QUERY_TIMEOUT" environment variable', () => {
      process.env.HLF_QUERY_TIMEOUT = '9999';
      const config = require('./config');
      expect(config.queryTimeout).toBe(9999);
    });

    it('throws an error when the "HLF_QUERY_TIMEOUT" environment variable has an invalid number', () => {
      process.env.HLF_QUERY_TIMEOUT = 'long';
      expect(() => {
        require('./config');
      }).toThrow(
        'env-var: "HLF_QUERY_TIMEOUT" should be a valid integer. An example of a valid value would be: 3'
      );
    });
  });

  describe('peerAddressOrg1', () => {
    it('throws an error when the "HLF_PEER_ADDRESS_ORG1" environment variable is not set', () => {
      delete process.env.HLF_PEER_ADDRESS_ORG1;
      expect(() => {
        require('./config');
      }).toThrow(
        'env-var: "HLF_PEER_ADDRESS_ORG1" is a required variable, but it was not set. An example of a valid value would be: localhost:7051'
      );
    });

    it('can be configured using the "HLF_PEER_ADDRESS_ORG1" environment variable', () => {
      process.env.HLF_PEER_ADDRESS_ORG1 = 'peer0.org1.example.com';
      const config = require('./config');
      expect(config.peerAddressOrg1).toBe('peer0.org1.example.com');
    });
  });

  describe('peerAliasOrg1', () => {
    it('has no default value', () => {
      const config = require('./config');
      expect(config.peerAliasOrg1).toBeUndefined();
    });

    it('can be configured using the "HLF_PEER_ALIAS_ORG1" environment variable', () => {
      process.env.HLF_PEER_ALIAS_ORG1 = 'peer0.org1.example.com';
      const config = require('./config');
      expect(config.peerAliasOrg1).toBe('peer0.org1.example.com');
    });
  });

  describe('tlsRootCertificateOrg1', () => {
    it('throws an error when the "HLF_TLS_ROOT_CERTIFICATE_ORG1" environment variable is not set', () => {
      delete process.env.HLF_TLS_ROOT_CERTIFICATE_ORG1;
      expect(() => {
        require('./config');
      }).toThrow(
        'env-var: "HLF_TLS_ROOT_CERTIFICATE_ORG1" is a required variable, but it was not set. An example of a valid value would be: "-----BEGIN CERTIFICATE-----\\n...\\n-----END CERTIFICATE-----\\n"'
      );
    });

    it('can be configured using the "HLF_TLS_ROOT_CERTIFICATE_ORG1" environment variable', () => {
      process.env.HLF_TLS_ROOT_CERTIFICATE_ORG1 = 'ORG1TLSROOTCERT';
      const config = require('./config');
      expect(config.tlsRootCertificateOrg1).toBe('ORG1TLSROOTCERT');
    });
  });

  describe('certificateOrg1', () => {
    it('throws an error when the "HLF_CERTIFICATE_ORG1" environment variable is not set', () => {
      delete process.env.HLF_CERTIFICATE_ORG1;
      expect(() => {
        require('./config');
      }).toThrow(
        'env-var: "HLF_CERTIFICATE_ORG1" is a required variable, but it was not set. An example of a valid value would be: "-----BEGIN CERTIFICATE-----\\n...\\n-----END CERTIFICATE-----\\n"'
      );
    });

    it('can be configured using the "HLF_CERTIFICATE_ORG1" environment variable', () => {
      process.env.HLF_CERTIFICATE_ORG1 = 'ORG1CERT';
      const config = require('./config');
      expect(config.certificateOrg1).toBe('ORG1CERT');
    });
  });

  describe('privateKeyOrg1', () => {
    it('throws an error when the "HLF_PRIVATE_KEY_ORG1" environment variable is not set', () => {
      delete process.env.HLF_PRIVATE_KEY_ORG1;
      expect(() => {
        require('./config');
      }).toThrow(
        'env-var: "HLF_PRIVATE_KEY_ORG1" is a required variable, but it was not set. An example of a valid value would be: "-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"'
      );
    });

    it('can be configured using the "HLF_PRIVATE_KEY_ORG1" environment variable', () => {
      process.env.HLF_PRIVATE_KEY_ORG1 = 'ORG1PK';
      const config = require('./config');
      expect(config.privateKeyOrg1).toBe('ORG1PK');
    });
  });

  describe('peerAddressOrg2', () => {
    it('throws an error when the "HLF_PEER_ADDRESS_ORG2" environment variable is not set', () => {
      delete process.env.HLF_PEER_ADDRESS_ORG2;
      expect(() => {
        require('./config');
      }).toThrow(
        'env-var: "HLF_PEER_ADDRESS_ORG2" is a required variable, but it was not set. An example of a valid value would be: localhost:9051'
      );
    });

    it('can be configured using the "HLF_PEER_ADDRESS_ORG2" environment variable', () => {
      process.env.HLF_PEER_ADDRESS_ORG2 = 'peer0.org2.example.com';
      const config = require('./config');
      expect(config.peerAddressOrg2).toBe('peer0.org2.example.com');
    });
  });

  describe('peerAliasOrg2', () => {
    it('has no default value', () => {
      const config = require('./config');
      expect(config.peerAliasOrg2).toBeUndefined();
    });

    it('can be configured using the "HLF_PEER_ALIAS_ORG2" environment variable', () => {
      process.env.HLF_PEER_ALIAS_ORG2 = 'peer0.org2.example.com';
      const config = require('./config');
      expect(config.peerAliasOrg2).toBe('peer0.org2.example.com');
    });
  });

  describe('tlsRootCertificateOrg2', () => {
    it('throws an error when the "HLF_TLS_ROOT_CERTIFICATE_ORG2" environment variable is not set', () => {
      delete process.env.HLF_TLS_ROOT_CERTIFICATE_ORG2;
      expect(() => {
        require('./config');
      }).toThrow(
        'env-var: "HLF_TLS_ROOT_CERTIFICATE_ORG2" is a required variable, but it was not set. An example of a valid value would be: "-----BEGIN CERTIFICATE-----\\n...\\n-----END CERTIFICATE-----\\n"'
      );
    });

    it('can be configured using the "HLF_TLS_ROOT_CERTIFICATE_ORG2" environment variable', () => {
      process.env.HLF_TLS_ROOT_CERTIFICATE_ORG2 = 'ORG2TLSROOTCERT';
      const config = require('./config');
      expect(config.tlsRootCertificateOrg2).toBe('ORG2TLSROOTCERT');
    });
  });

  describe('certificateOrg2', () => {
    it('throws an error when the "HLF_CERTIFICATE_ORG2" environment variable is not set', () => {
      delete process.env.HLF_CERTIFICATE_ORG2;
      expect(() => {
        require('./config');
      }).toThrow(
        'env-var: "HLF_CERTIFICATE_ORG2" is a required variable, but it was not set. An example of a valid value would be: "-----BEGIN CERTIFICATE-----\\n...\\n-----END CERTIFICATE-----\\n"'
      );
    });

    it('can be configured using the "HLF_CERTIFICATE_ORG2" environment variable', () => {
      process.env.HLF_CERTIFICATE_ORG2 = 'ORG2CERT';
      const config = require('./config');
      expect(config.certificateOrg2).toBe('ORG2CERT');
    });
  });

  describe('privateKeyOrg2', () => {
    it('throws an error when the "HLF_PRIVATE_KEY_ORG2" environment variable is not set', () => {
      delete process.env.HLF_PRIVATE_KEY_ORG2;
      expect(() => {
        require('./config');
      }).toThrow(
        'env-var: "HLF_PRIVATE_KEY_ORG2" is a required variable, but it was not set. An example of a valid value would be: "-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"'
      );
    });

    it('can be configured using the "HLF_PRIVATE_KEY_ORG2" environment variable', () => {
      process.env.HLF_PRIVATE_KEY_ORG2 = 'ORG2PK';
      const config = require('./config');
      expect(config.privateKeyOrg2).toBe('ORG2PK');
    });
  });

  describe('redisHost', () => {
    it('defaults to "localhost"', () => {
      const config = require('./config');
      expect(config.redisHost).toBe('localhost');
    });

    it('can be configured using the "REDIS_HOST" environment variable', () => {
      process.env.REDIS_HOST = 'redis.example.org';
      const config = require('./config');
      expect(config.redisHost).toBe('redis.example.org');
    });
  });

  describe('redisPort', () => {
    it('defaults to "6379"', () => {
      const config = require('./config');
      expect(config.redisPort).toBe(6379);
    });

    it('can be configured with a valid port number using the "REDIS_PORT" environment variable', () => {
      process.env.REDIS_PORT = '9736';
      const config = require('./config');
      expect(config.redisPort).toBe(9736);
    });

    it('throws an error when the "REDIS_PORT" environment variable has an invalid port number', () => {
      process.env.REDIS_PORT = '65536';
      expect(() => {
        require('./config');
      }).toThrow(
        'env-var: "REDIS_PORT" cannot assign a port number greater than 65535. An example of a valid value would be: 6379'
      );
    });
  });

  describe('redisUsername', () => {
    it('has no default value', () => {
      const config = require('./config');
      expect(config.redisUsername).toBeUndefined();
    });

    it('can be configured using the "REDIS_USERNAME" environment variable', () => {
      process.env.REDIS_USERNAME = 'test';
      const config = require('./config');
      expect(config.redisUsername).toBe('test');
    });
  });

  describe('redisPassword', () => {
    it('has no default value', () => {
      const config = require('./config');
      expect(config.redisPassword).toBeUndefined();
    });

    it('can be configured using the "REDIS_PASSWORD" environment variable', () => {
      process.env.REDIS_PASSWORD = 'testpw';
      const config = require('./config');
      expect(config.redisPassword).toBe('testpw');
    });
  });

  describe('org1ApiKey', () => {
    it('throws an error when the "ORG1_APIKEY" environment variable is not set', () => {
      delete process.env.ORG1_APIKEY;
      expect(() => {
        require('./config');
      }).toThrow(
        'env-var: "ORG1_APIKEY" is a required variable, but it was not set. An example of a valid value would be: 123'
      );
    });

    it('can be configured using the "ORG1_APIKEY" environment variable', () => {
      process.env.ORG1_APIKEY = 'org1ApiKey';
      const config = require('./config');
      expect(config.org1ApiKey).toBe('org1ApiKey');
    });
  });

  describe('org2ApiKey', () => {
    it('throws an error when the "ORG1_APIKEY" environment variable is not set', () => {
      delete process.env.ORG2_APIKEY;
      expect(() => {
        require('./config');
      }).toThrow(
        'env-var: "ORG2_APIKEY" is a required variable, but it was not set. An example of a valid value would be: 456'
      );
    });

    it('can be configured using the "ORG1_APIKEY" environment variable', () => {
      process.env.ORG2_APIKEY = 'org2ApiKey';
      const config = require('./config');
      expect(config.org2ApiKey).toBe('org2ApiKey');
    });
  });
});
