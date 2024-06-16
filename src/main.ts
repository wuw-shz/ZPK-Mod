import {world, system, Player} from '@minecraft/server';
import {Database, settingUI, zpkModOn, print} from './index';

world.afterEvents.entitySpawn.subscribe(({entity}) => {
  const item = entity.getComponent('item').itemStack;
  item.nameTag = `§e${item.amount}x§r ${item.nameTag}`;
});

/*Toggle ZPK Mod*/

world.beforeEvents.itemUse.subscribe(data => {
  if (!zpkModOn) return;
  const player = data.source as Player;
  const item = data.itemStack;
  const db = Database(player);
  if (!(player instanceof Player)) return;
  if (item.typeId === 'minecraft:compass' && player.isSneaking) {
    if (!db.toggleZPKMod) db.toggleZPKMod = true;
    else db.toggleZPKMod = false;
  } else if (item.typeId === 'minecraft:compass') {
    settingUI(player);
  }
});

system.runInterval(() => {
  if (!zpkModOn) return;

  for (const player of world.getAllPlayers()) {
    const db = Database(player);
    if (!db.toggleZPKMod) {
      switch (db.idx) {
        case 1:
          player.onScreenDisplay.setTitle('&!');
          db.idx = 2;
          break;
        case 2:
          player.onScreenDisplay.setTitle('!&');
          db.idx = 1;
          break;
      }
      continue;
    }
    let pos = player.location;
    let rot = player.getRotation();
    let vel = player.getVelocity();
    let isonground = player.isOnGround;
    let fullvel = Math.sqrt(vel.x ** 2 + vel.z ** 2);
    if (rot.y != db.beforetfac) {
      db.lastturning = rot.y - db.beforetfac;
      db.beforetfac = rot.y;
    }
    if (isonground && !db.beforetland) {
      db.landx = pos.x - vel.x;
      db.landy = pos.y - vel.y;
      db.landz = pos.z - vel.z;
      db.hitx = pos.x;
      db.hity = pos.y;
      db.hitz = pos.z;
      db.hita = rot.y;
      db.tier = 0;
      db.beforetland = true;
    }
    if (!isonground) {
      if (db.beforetland) {
        db.tier = 10;
      } else {
        db.tier -= 1;
      }
      db.beforetland = false;
    }
    if (db.tier == 10) {
      db.ja = rot.y;
    }
    if (
      pos.y <= db.lby &&
      vel.y <= 0 &&
      pos.y - vel.y > db.lby &&
      -Math.abs(pos.x - db.lbx - 0.5) + 0.8 >= -1 &&
      -Math.abs(pos.z - db.lbz - 0.5) + 0.8 >= -1 &&
      !db.beforelandlb &&
      db.lbon
    ) {
      db.beforelandlb = true;
      db.osx = -Math.abs(pos.x - vel.x - db.lbx - 0.5) + 0.8;
      db.osz = -Math.abs(pos.z - vel.z - db.lbz - 0.5) + 0.8;
      db.os =
        Math.sqrt(db.osx ** 2 + db.osz ** 2) *
        ([db.osx, db.osz].some(os => os < 0) ? -1 : 1);
      db.sendos &&
        print(
          `§${db.tc1}${db.prefix} §${db.tc2}Offset: ${db.os.toFixed(db.pTF)}`,
          player
        );
      db.sendosx &&
        print(
          `§${db.tc1}${db.prefix} §${
            db.tc2
          }Offset X: ${db.osx.toFixed(db.pTF)}`,
          player
        );
      db.sendosz &&
        print(
          `§${db.tc1}${db.prefix} §${
            db.tc2
          }Offset Z: ${db.osz.toFixed(db.pTF)}`,
          player
        );
      if (db.osx > db.pbx || !isFinite(db.pbx)) {
        db.pbx = db.osx;
        db.sendpbx &&
          print(
            `§${db.tc1}${db.prefix} §${db.tc2}New pb! X: ${db.pbx.toFixed(db.pTF)}`,
            player
          );
      }
      if (db.osz > db.pbz || !isFinite(db.pbz)) {
        db.pbz = db.osz;
        db.sendpbz &&
          print(
            `§${db.tc1}${db.prefix} §${db.tc2}New pb! Z: ${db.pbz.toFixed(db.pTF)}`,
            player
          );
      }
      if (db.os > db.pb || !isFinite(db.pb)) {
        db.pb = db.os;
        db.sendpb &&
          print(
            `§${db.tc1}${db.prefix} §${db.tc2}New pb!: ${db.pb.toFixed(db.pTF)}`,
            player
          );
      }
    }
    if (pos.y > db.lby && db.beforelandlb && !isonground) {
      db.beforelandlb = false;
    }
    const NA = (value: string | Number) =>
      typeof value == 'number'
        ? isFinite(value)
          ? value.toFixed(db.pTF)
          : 'N/A'
        : value;
    type GUI = {
      main: {labels: string[]; conditions: boolean[]};
      utils: {labels: string[]; conditions: boolean[]};
    };
    const gui: GUI = {
      main: {
        labels: [
          `§${db.tc1}X §${db.tc2}${pos.x.toFixed(db.pTF)} §${db.tc1}Y §${db.tc2}${pos.y.toFixed(db.pTF)} §${db.tc1}Z §${db.tc2}${pos.z.toFixed(db.pTF)}`,
          `${db.showpit ? `§${db.tc1}P §${db.tc2}${rot.x.toFixed(db.rTF)}` : ''}${db.showpit && db.showfac ? ' ' : ''}${db.showfac ? `§${db.tc1}F §${db.tc2}${rot.y.toFixed(db.rTF)}` : ''}`,
        ],
        conditions: [db.showpos, db.showpit || db.showfac],
      },

      utils: {
        labels: [
          `§${db.tc1}JA §${db.tc2}${db.ja.toFixed(db.rTF)} `,
          `§${db.tc1}Hit Angle §${db.tc2}${db.hita.toFixed(db.rTF)}`,
          `\n`,
          `§${db.tc1}Speed (b/t) §8[§${db.tc2}${vel.x.toFixed(db.pTF)}§8, §${db.tc2}${vel.y.toFixed(db.pTF)}§8, §${db.tc2}${vel.z.toFixed(db.pTF)}§8]`,
          `§${db.tc1}Total Speed (X&Z) §${db.tc2}${fullvel.toFixed(db.pTF)}`,
          `§${db.tc1}Tier §${db.tc2}${db.tier}`,
          `§${db.tc1}Last landing §8[§${db.tc2}${db.landx.toFixed(db.pTF)}§8, §${db.tc2}${db.landy.toFixed(db.pTF)}§8, §${db.tc2}${db.landz.toFixed(db.pTF)}§8]`,
          `§${db.tc1}Hit §8[§${db.tc2}${db.hitx.toFixed(db.pTF)}§8, §${db.tc2}${db.hity.toFixed(db.pTF)}§${db.tc1}§8, §${db.tc2}${db.hitz.toFixed(db.pTF)}§8]`,
          `§${db.tc1}Offset §${db.tc2}${NA(db.os)} §${db.tc1}(X, Z) §8[§${db.tc2}${NA(db.osx)}§${db.tc1}§8, §${db.tc2}${NA(db.osz)}§8]`,
          `§${db.tc1}PB §${db.tc2}${NA(db.pb)} §${db.tc1}(X, Z) §8[§${db.tc2}${NA(db.pbx)}§8, §${db.tc2}${NA(db.pbz)}§8]`,
          `§${db.tc1}Last Turning §${db.tc2}${db.lastturning.toFixed(db.rTF)}`,
        ],
        conditions: [
          db.showja,
          db.showhita,
          db.separateGui
            ? db.showja || db.showhita
            : db.showpos ||
              db.showpit ||
              db.showfac ||
              db.showja ||
              db.showhita,
          db.showspeed,
          db.showttspeed,
          db.showtier,
          db.showland,
          db.showhit,
          db.showos,
          db.showpb,
          db.showturn,
        ],
      },
    };
    if (db.separateGui) {
      switch (db.idx) {
        case 1:
          db.idx = 2;
          player.onScreenDisplay.setTitle(
            '!&§r§f' +
              gui.main.labels
                .filter((l, i) => gui.main.conditions[i] && l)
                .join('\n')
          );
          break;
        case 2:
          db.idx = 1;
          player.onScreenDisplay.setTitle(
            '&!§r§f' +
              gui.utils.labels
                .filter((l, i) => gui.utils.conditions[i] && l)
                .join('\n')
          );
          break;
      }
    } else {
      player.onScreenDisplay.setTitle('!&');
      player.onScreenDisplay.setTitle(
        '&!§r§f' +
          gui.main.labels
            .concat(gui.utils.labels)
            .filter(
              (l, i) => gui.main.conditions.concat(gui.utils.conditions)[i] && l
            )
            .join('\n')
      );
    }
  }
});

// system.runInterval(() => {
//   world.getAllPlayers().forEach(pl => {
//     const movement = pl.getComponent('movement');
//     movement.setCurrentValue(0.12999999523162842);
//     pl.getVelocity().x = 0;
//     pl.onScreenDisplay.setActionBar(
//       movement.currentValue + '\n' + pl.isSprinting + '\n\n\n\n\n'
//     );
//   });
// });
