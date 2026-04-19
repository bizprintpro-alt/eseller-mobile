/**
 * Per-aimag delivery windows — remote override first, PRD §6.5 defaults
 * second. Gives components a single line to call instead of every site
 * having to know that `PROVINCES[].days` is remote-overridable.
 *
 *   const days = useProvinceDays('AKH')  //  "7-10"
 *   <Text>{days} хоног</Text>
 */

import {
  useAimagDeliveryOverride,
  getAimagDeliveryOverride,
} from '../../config/remoteFlags';
import { PROVINCES } from './constants';

function fallback(code: string | null | undefined): string | undefined {
  if (!code) return undefined;
  return PROVINCES.find((p) => p.code === code.toUpperCase())?.days;
}

export function useProvinceDays(code: string | null | undefined): string | undefined {
  const remote = useAimagDeliveryOverride(code);
  return remote ?? fallback(code);
}

export function getProvinceDays(code: string | null | undefined): string | undefined {
  return getAimagDeliveryOverride(code) ?? fallback(code);
}
