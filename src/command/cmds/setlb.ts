import {CommandInfo, print, Server} from '@lib/minecraft';
import {registerCommand, Database, cmdPrefix} from 'index';

const regInfo: CommandInfo = {
  name: 'setlb',
  description: 'Set lb.',
  aliases: ['slb', 'sb'],
  usage: [{name: 'target', type: 'string', default: ''}],
};

registerCommand(regInfo, (player, msg, args) => {
  const db = Database(player);
  if (['target', 'tg'].includes(args.get('target') as string)) {
    const target = player.getBlockFromViewDirection().block;
    db.lbon = true;
    db.lbx = Math.floor(target.x);
    db.lby = Math.floor(target.y + 1);
    db.lbz = Math.floor(target.z);
    Server.command.callCommand(player, 'clearpb');
    print(
      `§l§a✔ Set lb target block! at (${db.lbx}, ${db.lby}, ${db.lbz})`,
      player
    );
  } else if (args.get('target') === '') {
    const pos = player.location;
    db.lbon = true;
    db.lbx = Math.floor(pos.x);
    db.lby = pos.y
    db.lbz = Math.floor(pos.z)
    Server.command.callCommand(player, 'clearpb');
    print(`§l§a✔ Set lb here! at (${db.lbx}, ${db.lby}, ${db.lbz})`, player);
  } else {
    print(
      `§l§c✘ Invalid target input! Using "${cmdPrefix}setlb [target, tg]"`,
      player
    );
  }
});
