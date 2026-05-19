import { status as GrpcStatus, type ServerUnaryCall, type sendUnaryData } from '@grpc/grpc-js';
import { withOptions, getConfig } from '../astro';
import type { GenderName } from '../i18n';
import type { AstroType, Language, Option } from '../data/types';
import type {
  AstrolabeReply,
  BySolarRequest,
  ByLunarRequest,
  ConfigReply,
  GetConfigRequest,
  IztroServiceServer,
  OptionsRequest,
} from '@weigh-ai/proto/iztro';
import { fromConfigProto, toAstrolabeReply, toConfigProto } from './mappers';

type UnaryCall<Req, Res> = ServerUnaryCall<Req, Res>;
type UnaryCallback<Res> = sendUnaryData<Res>;

const grpcError = (err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  return {
    code: GrpcStatus.INVALID_ARGUMENT,
    message,
  };
};

export const handlers: IztroServiceServer = {
  bySolar(call: UnaryCall<BySolarRequest, AstrolabeReply>, callback: UnaryCallback<AstrolabeReply>) {
    try {
      const req = call.request;
      // 走 withOptions 而非全局 config()，保持每请求隔离
      const result = withOptions({
        type: 'solar',
        dateStr: req.solarDate,
        timeIndex: req.timeIndex,
        gender: req.gender as GenderName,
        fixLeap: req.fixLeap ?? true,
        language: req.language as Language | undefined,
        config: fromConfigProto(req.config),
      } satisfies Option);

      callback(null, toAstrolabeReply(result));
    } catch (err) {
      callback(grpcError(err), null);
    }
  },

  byLunar(call: UnaryCall<ByLunarRequest, AstrolabeReply>, callback: UnaryCallback<AstrolabeReply>) {
    try {
      const req = call.request;
      const result = withOptions({
        type: 'lunar',
        dateStr: req.lunarDate,
        timeIndex: req.timeIndex,
        gender: req.gender as GenderName,
        isLeapMonth: req.isLeapMonth ?? false,
        fixLeap: req.fixLeap ?? true,
        language: req.language as Language | undefined,
        config: fromConfigProto(req.config),
      } satisfies Option);

      callback(null, toAstrolabeReply(result));
    } catch (err) {
      callback(grpcError(err), null);
    }
  },

  withOptions(call: UnaryCall<OptionsRequest, AstrolabeReply>, callback: UnaryCallback<AstrolabeReply>) {
    try {
      const req = call.request;
      const type = (req.type === 'lunar' ? 'lunar' : 'solar') satisfies Option['type'];
      const result = withOptions({
        type,
        dateStr: req.dateStr,
        timeIndex: req.timeIndex,
        gender: req.gender as GenderName,
        isLeapMonth: req.isLeapMonth ?? false,
        fixLeap: req.fixLeap ?? true,
        language: req.language as Language | undefined,
        astroType: req.astroType as AstroType | undefined,
        config: fromConfigProto(req.config),
      } satisfies Option);

      callback(null, toAstrolabeReply(result));
    } catch (err) {
      callback(grpcError(err), null);
    }
  },

  getConfig(_call: UnaryCall<GetConfigRequest, ConfigReply>, callback: UnaryCallback<ConfigReply>) {
    try {
      callback(null, { config: toConfigProto(getConfig()) });
    } catch (err) {
      callback(
        {
          code: GrpcStatus.INTERNAL,
          message: err instanceof Error ? err.message : String(err),
        },
        null,
      );
    }
  },
};

// 仅供 i18n 副作用：handlers 不主动改全局 language；调用方若需要切换，需通过外层调用 setLanguage。
// 这里保留导出以方便 server 启动时配置默认语言。
export { setLanguage } from '../i18n';
