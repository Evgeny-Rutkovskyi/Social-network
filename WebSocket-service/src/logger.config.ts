import * as winston from 'winston';
import * as LogstashTransport from 'winston-logstash/lib/winston-logstash-latest.js';

const logstashTransport = new LogstashTransport({
  host: 'logstash',
  port: 5000,
  max_connect_retries: -1
});

const transports = [
  logstashTransport,  
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, context, trace }) => {
        return `${timestamp} [${context}] ${level}: ${message}${trace ? `\n${trace}` : ''}`;
      }),
    ),
  }),
];

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports,
});
