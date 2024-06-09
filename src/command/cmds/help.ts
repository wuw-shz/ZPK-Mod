import {CommandInfo, Server, print} from '@lib/minecraft';
import {registerCommand, cmdPrefix} from 'index';

const regInfo: CommandInfo = {
  name: 'help',
  description: 'Displays a list and info of available commands.',
  aliases: ['h', '?'],
};

registerCommand(regInfo, player => {
  const cmdsInfo = Server.command
    .getAllRegistation()
    .map(cmd => {
      return `  §l§8${cmdPrefix}§f${cmd.name} §r§7[${cmd.aliases.join(', ')}] - §o§h${cmd.description}`;
    })
    .join('§r§l\n');
  print(
    `\n§l§e● Commands Information §o§8(Prefix: "${cmdPrefix}")§r\n` + cmdsInfo + '\n\n',
    player
  );
});
