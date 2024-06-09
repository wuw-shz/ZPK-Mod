import {CommandInfo, print} from '@lib/minecraft';
import {registerCommand, cmdPrefix, version} from 'index';

const regInfo: CommandInfo = {
  name: 'about',
  description: 'About the ZPK Mod',
  aliases: ['ab'],
};

registerCommand(regInfo, player => {
  print(
    `
§l§6● ZPK Mod (${version}) About
  §7-§dAuthor: §fZetaser_jtz (zsccjtz9136)
  §7-§dContributor: §f! wuw.shz (wuw.sh)
  §7-§aSend §f"${cmdPrefix}help" §afor commands information
  §7-§8[ §fHold Compass §8] §ato open ZPK Mod setting
  §7-§8[ §fSneak + Hold Compass §8] §ato toggle ZPK Mod GUI
  §7-§bIf you can't see the full text, plaese
  open 'Settings>Video' then set GUI Scale Modifier
  to -1
  §7-§4You can modify this Addon, but please 
  indicate the original author!

`,
    player
  );
});
