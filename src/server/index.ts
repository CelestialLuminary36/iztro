import { Server, ServerCredentials } from '@grpc/grpc-js';
import { fileURLToPath } from 'node:url';
import { realpathSync } from 'node:fs';
import { IztroServiceService } from '@weigh-ai/proto/iztro';
import { handlers } from './handlers';

export const createServer = (): Server => {
  const server = new Server();
  server.addService(IztroServiceService, handlers);
  return server;
};

export const bootstrap = async (addr = process.env.IZTRO_GRPC_ADDR ?? '0.0.0.0:50051'): Promise<{
  server: Server;
  port: number;
}> => {
  const server = createServer();
  const port = await new Promise<number>((resolve, reject) => {
    server.bindAsync(addr, ServerCredentials.createInsecure(), (err, boundPort) => {
      if (err) reject(err);
      else resolve(boundPort);
    });
  });
  return { server, port };
};

const isMain = (() => {
  // CJS 路径（tsup 打包后 / node 直接跑 .cjs）
  if (typeof require !== 'undefined' && typeof module !== 'undefined') {
    try {
      return require.main === module;
    } catch {
      /* fallthrough */
    }
  }
  // ESM 路径（tsx watch / node --loader）
  try {
    const entry = process.argv[1] ? realpathSync(process.argv[1]) : '';
    const self = realpathSync(fileURLToPath(import.meta.url));
    return entry === self;
  } catch {
    return false;
  }
})();

if (isMain) {
  bootstrap()
    .then(({ port }) => {
      console.log(`iztro grpc listening on 0.0.0.0:${port}`);
    })
    .catch((err) => {
      console.error('failed to start iztro grpc server', err);
      process.exit(1);
    });
}
