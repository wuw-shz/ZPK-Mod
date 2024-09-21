import * as server from "@minecraft/server";
import { Mode } from "@oj-realm";

export class DatabaseOJR {
  player: server.Player;
  constructor(player: server.Player) {
    this.player = player;
  }
  set(identifier: string, value: string | number | boolean): void {
    this.player.setDynamicProperty(identifier, value);
  }
  get(identifier: string): any {
    if (!this.has(identifier)) return this.player.setDynamicProperty(identifier, "{}")
    const data = this.player.getDynamicProperty(identifier);
    return identifier === Mode.coordinatorToggle || identifier === Mode.coordinatorNotificationToggle
      ? Boolean(data)
      : JSON.parse(String(data));
  }
  has(identifier: string): boolean {
    try {
      const data = this.player.getDynamicProperty(identifier);
      if (data === undefined) return false;
      return true;
    } catch (e) {
      return false;
    }
  }
  clear(identifier: string): void {
    return this.set(identifier, JSON.stringify({}));
  }
}
