import {Player} from '@minecraft/server';
import {InitialData} from 'config';

export type InitialDataType = typeof InitialData;
export type Key = keyof InitialDataType;
export type Value = InitialDataType[Key];
export type DataType = Partial<Record<Key, Value>>;

export function Database(player: Player): InitialDataType {
  return new Proxy(InitialData, {
    get: (target: InitialDataType, key: Key) => {
      const data: DataType = target;
      data[key] =
        player.getDynamicProperty(key) !== undefined
          ? (player.getDynamicProperty(key) as InitialDataType[typeof key])
          : InitialData[key];

      return data[key];
    },
    set: (target: InitialDataType, key: Key, value: Value) => {
      const data: DataType = target;
      data[key] = value;
      Object.entries(data).forEach(([key, value]) => {
        player.setDynamicProperty(key, value as Value);
      });
      return true;
    },
  });
}
