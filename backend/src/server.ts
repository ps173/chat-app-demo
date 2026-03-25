import http from 'http';
import { createApp } from './app';
import { config } from './config';
import { logger } from './utils/logger';
import { initSocketServer } from './sockets';

const app = createApp();
const server = http.createServer(app);

initSocketServer(server);

server.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
});

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled Rejection');
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught Exception');
  process.exit(1);
});
