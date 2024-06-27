import { Player } from "@minecraft/server";
import { InitialData, InitialDataType, Key, Value } from "@zpk";

export function Database(player: Player): InitialDataType {
    return new Proxy(InitialData, {
        get(_, key: Key) {
            try {
                return JSON.parse((player.getDynamicProperty(key) ?? InitialData[key]) as string);
            } catch {
                return player.getDynamicProperty(key) ?? InitialData[key];
            }
        },
        set(_, key: Key, value) {
            try {
                player.setDynamicProperty(key, typeof value == "number" ? (isFinite(value) ? value : "N/A") : value);
            } catch {
                player.setDynamicProperty(key, JSON.stringify(value));
            }
            return true
        },
    });
}