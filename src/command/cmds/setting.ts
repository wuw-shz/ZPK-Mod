import {CommandInfo} from '@lib/minecraft';
import {registerCommand, settingUI} from 'index';

const regInfo: CommandInfo = {
  name: 'setting',
  description: 'Open ZPK Mod Setting GUI.',
  aliases: ['st'],
};

registerCommand(regInfo, player => {
  settingUI(player);
});
