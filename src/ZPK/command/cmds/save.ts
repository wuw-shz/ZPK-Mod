import { CommandInfo } from "@lib/minecraft";
import * as server from "@minecraft/server";
import * as ui from "@minecraft/server-ui";
import { DatabaseOJR, text } from "@oj-realm";
import { registerCommand } from "@zpk";

export enum Mode {
  "practiceData" = "practiceData",
  "coordinatorConfig" = "coordinatorConfig",
  "coordinatorToggle" = "coordinatorToggle",
  "coordinatorNotificationToggle" = "coordinatorNotificationToggle",
  "saves" = "saves",
}

const system = server.system

const isMoving = (pl: server.Player) => {
  const v = pl.getVelocity();
  const speed = Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2);
  return speed >= 0.01;
};
const isClimbing = (pl: server.Player) => {
  return pl.isClimbing && !pl.isOnGround;
};
const isOnGround = (pl: server.Player) => {
  return pl.isOnGround;
};
const regInfo: { [key: string]: CommandInfo } = {
  save: {
    name: "save",
    description: "save",
    usage: [{ name: "name", type: "string", default: "" }],
  },
  saves: { name: "saves", description: "saves" },
};

registerCommand(regInfo.save, (player, msg, args) => {
  const db = new DatabaseOJR(player);
  let name = args.get("name");
  if (name == "") name = "Unnamed";
  if (isMoving(player) || isClimbing(player) || !isOnGround(player))
    return player.sendMessage(text.saveCommand.notification.wrong);
  if (db.get(Mode.practiceData).toggle) return player.sendMessage(text.saveCommand.notification.inPracticeMode);
  const loc = player.location; // join world to test
  const rot = player.getRotation()// fuck do u mean? oh k
  const saves = db.get(Mode.saves);
  if (saves[name]) {
    const originalName = name;
    let i = 0;
    while (saves[name]) {
      i++;
      name = `${originalName} [${i}]`;
    }
  }
  db.set(Mode.saves, JSON.stringify({ ...saves, [name]: { location: loc, rotation: rot } }));
  player.sendMessage(
    text.saveCommand.notification.save(Math.floor(loc.x), Math.floor(loc.y), Math.floor(loc.z), name)
  );
  server.system.run(() => {
    player.teleport({ x: 0.5, y: 50, z: 0.5 }, { rotation: { x: 0, y: 0 } });
  });
});

registerCommand(regInfo.saves, (player, msg, args) => {
  const db = new DatabaseOJR(player);
  const saves = db.get(Mode.saves);
  if (Object.keys(saves).length === 0) return player.sendMessage(text.saveCommand.notification.noSavesLocation);
  const uiText = text.saveCommand.ui;
  server.system.run(() => {
    player.sendMessage(text.saveCommand.notification.closeChat);
    const form = new ui.ActionFormData().title(uiText.title).body(uiText.body);
    for (const key of Object.keys(saves).sort()) {
      const values = saves[key];
      form.button(
        uiText.savesButton(
          key,
          Math.floor(values.location.x),
          Math.floor(values.location.y),
          Math.floor(values.location.z)
        )
      );
    }
    form.button(uiText.clearAllButton);
    (async () => {
      while (true) {
        const response = await form.show(player);
        if (response.cancelationReason !== ui.FormCancelationReason.UserBusy) {
          return response;
        }
      }
    })().then((res) => {
      const selection = res.selection as number;
      if (selection === undefined) return;
      if (selection === Object.keys(saves).length) {
        new ui.MessageFormData()
          .title(uiText.clearAllUI.title)
          .body(uiText.clearAllUI.body)
          .button1(uiText.clearAllUI.button1)
          .button2(uiText.clearAllUI.button2)
          .show(player)
          .then((res) => {
            if (res.selection === 0 || res.canceled) return;
            db.clear(Mode.saves);
            player.sendMessage(text.saveCommand.notification.clearAllSaves);
          });
      } else {
        const name = Object.keys(saves).sort()[selection];
        const values = saves[name];
        server.system.run(() => {
          player.teleport(values.location, { dimension: player.dimension, rotation: values.rotation });
        });
        player.applyDamage;
        player.sendMessage(
          text.saveCommand.notification.teleport(
            Math.floor(values.location.x),
            Math.floor(values.location.y),
            Math.floor(values.location.z),
            name
          )
        );
        delete saves[name];
        db.set(Mode.saves, JSON.stringify(saves));
      }
    });
  });
});
