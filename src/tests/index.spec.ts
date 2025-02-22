import tap from 'tap';
import sinon from 'sinon';
import pino, { PinoLambdaLogger } from '../index';

sinon.useFakeTimers(Date.UTC(2016, 11, 1, 6, 0, 0, 0));

tap.test('should log a simple info message', (t) => {
  const [log, output] = createLogger();

  log.info('Simple message');
  t.matchSnapshot(output.buffer);
  t.end();
});

tap.test('should log an info message with data', (t) => {
  const [log, output] = createLogger();

  log.info({ data: { stuff: 'unicorns' } }, 'Message with data');
  t.matchSnapshot(output.buffer);
  t.end();
});

tap.test('should log an info message with requestId', (t) => {
  const [log, output] = createLogger();

  log.withRequest({}, { awsRequestId: '12345' });
  log.info('Message with request ID');
  t.matchSnapshot(output.buffer);
  t.end();
});

tap.test('should log an error message with requestId', (t) => {
  const [log, output] = createLogger();

  log.withRequest({}, { awsRequestId: '12345' });
  log.error('Message with request ID');
  t.matchSnapshot(output.buffer);
  t.end();
});

tap.test('should log an error message with apiRequestId', (t) => {
  const [log, output] = createLogger();

  log.withRequest({ requestContext: { requestId: '59996' } }, { awsRequestId: '12345' });
  log.error('Message with apiRequestId');
  t.matchSnapshot(output.buffer);
  t.end();
});

tap.test('should add tags with a child logger', (t) => {
  const [log, output] = createLogger();
  const childLogger = log.child({ userId: 12 });

  log.withRequest({}, { awsRequestId: '9048989' });
  childLogger.info('Message with userId');
  t.matchSnapshot(output.buffer);
  t.end();
});

/**
 * Creates a test logger and output buffer for assertions
 * Returns the logger and the buffer
 */
function createLogger(): [PinoLambdaLogger, { buffer: string }] {
  const output = {
    buffer: 'undefined',
  };

  const logger = pino({
    streamWriter: (str: string | Uint8Array): boolean => {
      output.buffer = (str as string).trim();
      return true;
    },
    base: null,
  });

  return [logger, output];
}
