import {CommandInfo, Server, Thread} from '@lib/minecraft';
import {Player} from '@minecraft/server';
import { zpkModOn } from 'index';

export function registerCommand(
  registerInformation: CommandInfo,
  callback: (player: Player, msg: string, args: Map<string, any>) => void
) {
  zpkModOn && Server.command.register(registerInformation, (player, msg, args) => {
    const thread = new Thread();
    thread.start(
      function* (player, msg, args) {
        callback(player, msg, args);
      },
      player,
      msg,
      args
    );
    return thread;
  });
}
