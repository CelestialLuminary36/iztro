import type { Astrolabe, Config, ConfigBrightness, ConfigMutagens } from '../data/types';
import type { IFunctionalPalace } from '../astro/FunctionalPalace';
import type { IFunctionalStar } from '../star/FunctionalStar';
import type {
  AstrolabeReply,
  Config as ConfigProto,
  Palace as PalaceProto,
  Star as StarProto,
} from '@weigh-ai/proto/iztro';

const toStarProto = (star: IFunctionalStar): StarProto => ({
  name: String(star.name),
  type: String(star.type),
  scope: String(star.scope),
  brightness: star.brightness != null ? String(star.brightness) : undefined,
  mutagen: star.mutagen != null ? String(star.mutagen) : undefined,
});

const toPalaceProto = (palace: IFunctionalPalace): PalaceProto => ({
  index: palace.index,
  name: String(palace.name),
  isBodyPalace: palace.isBodyPalace,
  isOriginalPalace: palace.isOriginalPalace,
  heavenlyStem: String(palace.heavenlyStem),
  earthlyBranch: String(palace.earthlyBranch),
  majorStars: (palace.majorStars ?? []).map(toStarProto),
  minorStars: (palace.minorStars ?? []).map(toStarProto),
  adjectiveStars: (palace.adjectiveStars ?? []).map(toStarProto),
  changsheng12: String(palace.changsheng12 ?? ''),
  boshi12: String(palace.boshi12 ?? ''),
  jiangqian12: String(palace.jiangqian12 ?? ''),
  suiqian12: String(palace.suiqian12 ?? ''),
  decadal: palace.decadal
    ? {
        range: palace.decadal.range,
        heavenlyStem: String(palace.decadal.heavenlyStem),
        earthlyBranch: String(palace.decadal.earthlyBranch),
      }
    : undefined,
  ages: palace.ages ?? [],
});

export const toAstrolabeReply = (a: Astrolabe): AstrolabeReply => ({
  gender: a.gender,
  solarDate: a.solarDate,
  lunarDate: a.lunarDate,
  chineseDate: a.chineseDate,
  time: a.time,
  timeRange: a.timeRange,
  sign: a.sign,
  zodiac: a.zodiac,
  earthlyBranchOfSoulPalace: String(a.earthlyBranchOfSoulPalace),
  earthlyBranchOfBodyPalace: String(a.earthlyBranchOfBodyPalace),
  soul: String(a.soul),
  body: String(a.body),
  fiveElementsClass: String(a.fiveElementsClass),
  palaces: a.palaces.map(toPalaceProto),
  copyright: a.copyright,
});

const stringListToValues = (list?: { values: string[] }): string[] => list?.values ?? [];

export const fromConfigProto = (cfg?: ConfigProto): Config | undefined => {
  if (!cfg) return undefined;

  const mutagens: ConfigMutagens = {};
  for (const [key, list] of Object.entries(cfg.mutagens ?? {})) {
    (mutagens as Record<string, string[]>)[key] = stringListToValues(list);
  }

  const brightness: ConfigBrightness = {};
  for (const [key, list] of Object.entries(cfg.brightness ?? {})) {
    (brightness as Record<string, string[]>)[key] = stringListToValues(list);
  }

  return {
    mutagens: Object.keys(mutagens).length ? mutagens : undefined,
    brightness: Object.keys(brightness).length ? brightness : undefined,
    yearDivide: cfg.yearDivide as Config['yearDivide'],
    horoscopeDivide: cfg.horoscopeDivide as Config['horoscopeDivide'],
    ageDivide: cfg.ageDivide as Config['ageDivide'],
    dayDivide: cfg.dayDivide as Config['dayDivide'],
    algorithm: cfg.algorithm as Config['algorithm'],
  };
};

export const toConfigProto = (cfg: ReturnType<typeof import('../astro').getConfig>): ConfigProto => {
  const mutagens: Record<string, { values: string[] }> = {};
  for (const [key, value] of Object.entries(cfg.mutagens ?? {})) {
    mutagens[key] = { values: (value ?? []).map((v) => String(v)) };
  }
  const brightness: Record<string, { values: string[] }> = {};
  for (const [key, value] of Object.entries(cfg.brightness ?? {})) {
    brightness[key] = { values: (value ?? []).map((v) => String(v)) };
  }
  return {
    mutagens,
    brightness,
    yearDivide: cfg.yearDivide,
    horoscopeDivide: cfg.horoscopeDivide,
    ageDivide: cfg.ageDivide,
    dayDivide: cfg.dayDivide,
    algorithm: cfg.algorithm,
  };
};
