import {world, system, Player} from '@minecraft/server';
import {zpkModOn} from 'config';
import {Database} from 'database';
import {settingUI} from 'ui';

world.beforeEvents.itemUse.subscribe(data => {
  const item = data.itemStack;
  if (item.typeId !== 'minecraft:nether_star') return;
  data.cancel = true;
  world.sendMessage(`§6------------ZPK Mod V6.0.0 Info------------
§7-§dAuthor: §fZetaser_jtz (zsccjtz9136)
§7-§dContributor: §f! wuw.shz (wuw.sh)
§7-§aSend "!setlb" to set lb (stand on the
edge of the landingblock)
§7-§aSend "!clearpb" to clear pb and offset
§7-§8[ §fHold Compass §8] §ato open setting
§7-§8[ §fSneak + Compass §8] §ato toggle ZPK GUI
§7-§bIf you can't see the full text, plaese
open 'Settings>Video' then set GUI Scale Modifier
to -1
§7-§4You can modify this Addon, but please 
indicate the original author!`);
});

/*Toggle ZPK*/

world.beforeEvents.itemUse.subscribe(data => {
  const player = data.source as Player;
  const item = data.itemStack;
  const db = Database(player);
  if (!(player instanceof Player)) return;
  if (item.typeId === 'minecraft:compass' && player.isSneaking) {
    if (!db.toggleZPK) db.toggleZPK = true;
    else db.toggleZPK = false;
  } else {
    settingUI(player);
  }
});

system.runInterval(() => {
  zpkModOn &&
    (() => {
      for (const player of world.getPlayers()) {
        const db = Database(player);
        if (!db.toggleZPK) continue;
        let pos = player.location;
        let rot = player.getRotation();
        let vel = player.getVelocity();
        let isonground = player.isOnGround;
        let fullvel = Math.sqrt(vel.x ** 2 + vel.z ** 2);
        let beforety = pos.y - vel.y;
        if (+rot.y.toFixed(db.rTF) != db.beforetfac) {
          db.lastturning = +rot.y.toFixed(db.rTF) - db.beforetfac;
          db.beforetfac = +rot.y.toFixed(db.rTF);
        }
        if (isonground && !db.beforetland) {
          db.landx = pos.x - vel.x;
          db.landz = pos.z - vel.z;
          db.landy = pos.y - vel.y;
          db.hitx = pos.x;
          db.hity = pos.y;
          db.hitz = pos.z;
          db.hita = rot.y;
          db.beforetland = true;
        }
        if (!isonground) {
          if (db.beforetland) {
            db.tier = 10;
          }
          if (!db.beforetland) {
            db.tier = db.tier - 1;
          }
          db.beforetland = false;
        }
        if (db.tier == 10) {
          db.ja = rot.y;
        }
        if (pos.y <= +db.lby && beforety > +db.lby) {
          db.landtolbx = pos.x - vel.x;
          db.landtolbz = pos.z - vel.z;
          db.osxx = db.landtolbx - +db.lbx;
          db.oszz = db.landtolbz - +db.lbz;
          if (
            db.oszz > -db.oslimit &&
            db.oszz < +db.oslimit &&
            db.osxx > -db.oslimit &&
            db.osxx < +db.oslimit
          ) {
            db.osx = db.landtolbx - +db.lbx;
            db.osz = db.landtolbz - +db.lbz;
            if (db.osz < 0) {
              db.sqosz = db.osz ** 2 * -1;
            } else {
              db.sqosz = db.osz ** 2;
            }
            if (db.osx < 0) {
              db.sqosx = db.osx ** 2 * -1;
            } else {
              db.sqosx = db.osx ** 2;
            }
            if (db.osx >= 0 && db.osz < 0) {
              db.sqos = db.sqosz;
            } else if (db.osx < 0 && db.osz >= 0) {
              db.sqos = db.sqosx;
            } else {
              db.sqos = db.sqosx + db.sqosz;
            }
            if (db.sqos < 0) {
              db.os = Math.sqrt(db.sqos * -1) * -1;
            } else {
              db.os = Math.sqrt(db.sqos);
            }
            if (db.sendos) {
              world.sendMessage({
                rawtext: [
                  {
                    text: `§${db.tc1}§l${db.prefix}§${
                      db.tc2
                    }Offset: ${db.os.toFixed(db.pTF)}`,
                  },
                ],
              });
            }
            if (db.sendosx) {
              world.sendMessage({
                rawtext: [
                  {
                    text: `§${db.tc1}§l${db.prefix}§${
                      db.tc2
                    }Offset X: ${db.osx.toFixed(db.pTF)}`,
                  },
                ],
              });
            }
            if (db.sendosz) {
              world.sendMessage({
                rawtext: [
                  {
                    text: `§${db.tc1}§l${db.prefix}§${
                      db.tc2
                    }Offset Z: ${db.osz.toFixed(db.pTF)}`,
                  },
                ],
              });
            }
            if (+db.osx > +db.pbx && db.sendpbx) {
              db.pbx = +db.osx.toFixed(db.pTF);
              world.sendMessage({
                rawtext: [
                  {
                    text: `§${db.tc1}§l${db.prefix}§${db.tc2}New pb! X: ${db.pbx}`,
                  },
                ],
              });
            }
            if (+db.osz > +db.pbz && db.sendpbz) {
              db.pbz = +db.osz.toFixed(db.pTF);
              world.sendMessage({
                rawtext: [
                  {
                    text: `§${db.tc1}§l${db.prefix}§${db.tc2}New pb! Z: ${db.pbz}`,
                  },
                ],
              });
            }
            if (+db.os > +db.pb && db.sendpb) {
              db.pb = +db.os.toFixed(db.pTF);
              world.sendMessage({
                rawtext: [
                  {
                    text: `§${db.tc1}§l${db.prefix}§${db.tc2}New pb!: ${db.pb}`,
                  },
                ],
              });
            }
          }
        }
        // world.sendMessage(JSON.stringify(db.tc1))
        const labels = [
          `§${db.tc1}X §${db.tc2}${pos.x.toFixed(db.pTF)} §${db.tc1}Y §${db.tc2}${pos.y.toFixed(db.pTF)} §${db.tc1}Z §${db.tc2}${pos.z.toFixed(db.pTF)}`,
          `§${db.tc1}P §${db.tc2}${rot.x.toFixed(db.rTF)} `,
          `§${db.tc1}F §${db.tc2}${rot.y.toFixed(db.rTF)} `,
          `§${db.tc1}JA §${db.tc2}${db.ja.toFixed(db.rTF)} `,
          `§${db.tc1}Hit Angle §${db.tc2}${(+db.hita).toFixed(db.rTF)}`,
          `\n`,
          `§${db.tc1}Speed (b/t) §8[§${db.tc2}${vel.x.toFixed(db.pTF)}§8, §${db.tc2}${vel.y.toFixed(db.pTF)}§8, §${db.tc2}${vel.z.toFixed(db.pTF)}§8]`,
          `§${db.tc1}Total Speed (X&Z) §${db.tc2}${fullvel.toFixed(db.pTF)}`,
          `§${db.tc1}Tier §${db.tc2}${db.tier}`,
          `§${db.tc1}Tier §${db.tc2}${db.tier}`,
          `§${db.tc1}Last landing §8[§${db.tc2}${db.landx.toFixed(db.pTF)}§8, §${db.tc2}${db.landy.toFixed(db.pTF)}§8, §${db.tc2}${db.landz.toFixed(db.pTF)}§8]`,
          `§${db.tc1}Hit §8[§${db.tc2}${db.hitx.toFixed(db.pTF)}§8, §${db.tc2}${db.hity.toFixed(db.pTF)}§${db.tc1}§8, §${db.tc2}${db.hitz.toFixed(db.pTF)}§8]`,
          `§${db.tc1}Offset §${db.tc2}${db.os.toFixed(db.pTF)} §${db.tc1}(X, Z) §8[§${db.tc2}${db.osx.toFixed(db.pTF)}§${db.tc1}§8, §${db.tc2}${db.osz.toFixed(db.pTF)}§8]`,
          `§${db.tc1}PB §${db.tc2}${db.pb} §${db.tc1}(X, Z) §8[§${db.tc2}${db.pbx}§8, §${db.tc2}${db.pbz}§8]`,
          `§${db.tc1}Last Turning §${db.tc2}${db.lastturning.toFixed(db.rTF)}`,
        ];
        const conditions = [
          db.showpos,
          db.showpit,
          db.showfac,
          db.showja,
          db.showhita,
          db.showpit || db.showfac || db.showja || db.showhita,
          db.showspeed,
          db.showttspeed,
          db.showtier && db.showttspeed,
          db.showtier && !db.showttspeed,
          db.showland,
          db.showhit,
          db.showos,
          db.showpb,
          db.showturn,
        ];
        player.onScreenDisplay.setActionBar(
          labels.filter((l, i) => conditions[i] && l).join('\n')
        );
      }
    })();
});
