import {Player} from '@minecraft/server';
import {InitialData} from 'index';

export type InitialDataType = typeof InitialData;
export type Key = keyof InitialDataType;
export type Value = InitialDataType[Key];

export function Database(player: Player): InitialDataType {
  return new Proxy(InitialData, {
    get(_, key: Key) {
      return player.getDynamicProperty(key) ?? InitialData[key];
    },
    set(_, key: Key, value: Value) {
      player.setDynamicProperty(
        key,
        typeof value == 'number' ? (isFinite(value) ? value : 'N/A') : value
      );
      return true;
    },
  });
}
