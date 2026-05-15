import { serve } from '@hono/node-server';
import worker from './dist/server/index.js';

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

console.log(`Starting Node.js server on port ${port}...`);

serve({
  fetch: worker.default ? worker.default.fetch : worker.fetch,
  port: port
});
