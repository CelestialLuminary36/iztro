import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { ChannelCredentials, type Server } from '@grpc/grpc-js';
import { bootstrap } from '../server';
import {
  type AstrolabeReply,
  type ConfigReply,
  IztroServiceClient,
} from '@weigh-ai/proto/iztro';

let server: Server;
let client: IztroServiceClient;
let port: number;

beforeAll(async () => {
  const result = await bootstrap('127.0.0.1:0');
  server = result.server;
  port = result.port;
  client = new IztroServiceClient(`127.0.0.1:${port}`, ChannelCredentials.createInsecure());
});

afterAll(async () => {
  client.close();
  await new Promise<void>((resolve) => server.tryShutdown(() => resolve()));
});

const callBySolar = (req: Parameters<IztroServiceClient['bySolar']>[0]) =>
  new Promise<AstrolabeReply>((resolve, reject) => {
    client.bySolar(req, (err, reply) => (err ? reject(err) : resolve(reply)));
  });

const callByLunar = (req: Parameters<IztroServiceClient['byLunar']>[0]) =>
  new Promise<AstrolabeReply>((resolve, reject) => {
    client.byLunar(req, (err, reply) => (err ? reject(err) : resolve(reply)));
  });

const callWithOptions = (req: Parameters<IztroServiceClient['withOptions']>[0]) =>
  new Promise<AstrolabeReply>((resolve, reject) => {
    client.withOptions(req, (err, reply) => (err ? reject(err) : resolve(reply)));
  });

const callGetConfig = () =>
  new Promise<ConfigReply>((resolve, reject) => {
    client.getConfig({}, (err, reply) => (err ? reject(err) : resolve(reply)));
  });

describe('IztroService gRPC', () => {
  test('BySolar returns 12 palaces with core fields populated', async () => {
    const reply = await callBySolar({
      solarDate: '2000-8-16',
      timeIndex: 2,
      gender: 'male',
      language: 'zh-CN',
    });
    expect(reply.palaces).toHaveLength(12);
    expect(reply.solarDate).toBe('2000-8-16');
    expect(reply.copyright).toContain('iztro');
    expect(reply.gender).toBeTruthy();
    expect(reply.soul).toBeTruthy();
    expect(reply.body).toBeTruthy();
    expect(reply.palaces[0].majorStars).toBeDefined();
  });

  test('ByLunar produces matching output', async () => {
    const reply = await callByLunar({
      lunarDate: '2000-7-17',
      timeIndex: 2,
      gender: 'female',
      language: 'zh-CN',
    });
    expect(reply.palaces).toHaveLength(12);
    expect(reply.lunarDate).toBeTruthy();
  });

  test('WithOptions supports per-request config and astroType', async () => {
    const reply = await callWithOptions({
      type: 'solar',
      dateStr: '2000-8-16',
      timeIndex: 2,
      gender: 'male',
      language: 'zh-CN',
      astroType: 'heaven',
      config: {
        mutagens: {},
        brightness: {},
        algorithm: 'default',
        yearDivide: 'normal',
        horoscopeDivide: 'normal',
        ageDivide: 'normal',
        dayDivide: 'forward',
      },
    });
    expect(reply.palaces).toHaveLength(12);
    expect(reply.fiveElementsClass).toBeTruthy();
  });

  test('GetConfig returns readable defaults', async () => {
    const reply = await callGetConfig();
    expect(reply.config).toBeDefined();
    expect(reply.config?.algorithm).toBe('default');
  });
});
