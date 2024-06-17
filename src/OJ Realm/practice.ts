import * as server from "@minecraft/server";
import * as ui from "@minecraft/server-ui";
import { Mode, Database, text } from "@oj-realm";

const events = server.world.beforeEvents;
const Items = {
  practiceEnable: {
    typeId: text.practiceMode.item.enable.typeId,
  },
  practiceDisable: {
    typeId: text.practiceMode.item.disable.typeId,
  },
  practiceReturner: {
    typeId: text.practiceMode.item.returner.typeId,
  },
  coordinator: {
    typeId: text.coordinate.item.coordinator.typeId,
  },
  lobbyReturner: {
    typeId: text.lobby.item.returner.typeId,
  },
};
const getInv = (
  inv: server.Container,
  itemType: (typeof Items)[keyof typeof Items]
) =>
  [...Array(inv.size).keys()]
    .map((i) => inv.getItem(i))
    .map((it, slot) =>
      !it ? null : { typeId: it.typeId, name: it.nameTag, slot: slot }
    )
    .filter((it) => it !== null && it.typeId == itemType.typeId);
const clearPracItem = (pl: server.Player) => {
  const inv = (<server.EntityInventoryComponent>pl.getComponent("inventory"))
    .container;
  if (!inv) return;
  const items = getInv(inv, Items["practiceEnable"]);
  items.forEach((it) => (it ? inv.setItem(it.slot) : void 0));
  const rtn = getInv(inv, Items["practiceReturner"]);
  rtn.forEach((it) => (it ? inv.setItem(it.slot) : void 0));
  const dis = getInv(inv, Items["practiceDisable"]);
  dis.forEach((it) => (it ? inv.setItem(it.slot) : void 0));
};
const isMoving = (pl: server.Player) => {
  const v = pl.getVelocity();
  const speed = Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2);
  return speed > 0.01;
};
const isClimbing = (pl: server.Player) => {
  return pl.isClimbing && !pl.isOnGround;
};
const isOnGround = (pl: server.Player) => {
  return pl.isOnGround;
};
events.itemUse.subscribe((data) => {
  const pl = data.source;
  if (!(pl instanceof server.Player)) return;
  const it = data.itemStack;
  const db = new Database(pl);
  const practiceData = db.get(Mode.practiceData) as {location: server.Vector3, rotation: server.Vector2, toggle: boolean} | undefined;
  const inv = (<server.EntityInventoryComponent>pl.getComponent("inventory"))
    .container;
  if (!inv) return;
  const checkItem = (ItemType: { typeId: any }) => it.typeId == ItemType.typeId;
  if (!practiceData.toggle && checkItem(Items.practiceEnable)) {
    server.system.run(() => {
      if (isMoving(pl) || isClimbing(pl) || !isOnGround(pl))
        return pl.sendMessage(text.practiceMode.notification.wrong);
      pl.sendMessage(text.practiceMode.notification.enable);
      pl.addTag("practice");
      const rot = pl.getRotation();
      const pracData = { toggle: true, location: pl.location, rotation: rot };
      db.set(Mode.practiceData, JSON.stringify(pracData));
      clearPracItem(pl);
      const disable = new server.ItemStack(Items.practiceDisable.typeId);
      disable.nameTag = text.practiceMode.item.disable.nameTag;
      inv.setItem(pl.selectedSlotIndex, disable);
      const returner = new server.ItemStack(Items.practiceReturner.typeId);
      disable.nameTag = text.practiceMode.item.disable.nameTag;
      returner.nameTag = text.practiceMode.item.returner.nameTag;
      inv.setItem(pl.selectedSlotIndex, disable);
      inv.setItem(4, returner);
      for (let i = 0; i < inv.size; i++) {
        const item = inv.getItem(i);
        if (!item || item.typeId !== text.lobby.item.returner.typeId) continue;
        inv.setItem(i);
      }
    });
  } else if (practiceData.toggle && checkItem(Items.practiceDisable)) {
    server.system.run(() => {
      pl.sendMessage(text.practiceMode.notification.disable);
      pl.removeTag("practice");
      const cp = practiceData;
      if (!cp)
        return pl.sendMessage(
          text.practiceMode.notification.checkpointNotFound
        );
      pl.teleport(cp.location, {
        dimension: pl.dimension,
        rotation: cp.rotation,
      });
      db.set(
        Mode.practiceData,
        JSON.stringify({ toggle: false, location: null, rotation: null })
      );
      clearPracItem(pl);
      const enable = new server.ItemStack(Items.practiceEnable.typeId);
      enable.nameTag = text.practiceMode.item.enable.nameTag;
      inv.setItem(pl.selectedSlotIndex, enable);
      const lobbyReturner = new server.ItemStack(
        text.lobby.item.returner.typeId
      );
      lobbyReturner.nameTag = text.lobby.item.returner.nameTag;
      inv.setItem(4, lobbyReturner);
    });
  } else if (practiceData.toggle && checkItem(Items.practiceReturner)) {
    const cp = practiceData;
    if (!cp)
      return pl.sendMessage(text.practiceMode.notification.checkpointNotFound);
    server.system.run(() => {
      pl.teleport(cp.location, {
        dimension: pl.dimension,
        rotation: cp.rotation,
      });
    });
  } else if (checkItem(Items.coordinator)) {
    if (pl.isSneaking) {
      if (!db.has(Mode.coordinatorConfig))
        db.set(
          Mode.coordinatorConfig,
          JSON.stringify({ positional: 5, rotational: 5 })
        );
      if (!db.has(Mode.coordinatorNotificationToggle))
        db.set(Mode.coordinatorNotificationToggle, true);
      server.system.run(() => {
        const uiText = text.coordinate.ui;
        new ui.ModalFormData()
          .title(uiText.title)
          .slider(
            uiText.decimalDigits.label +
              "\n§r" +
              uiText.decimalDigits.slider.positional.join("\n"),
            0,
            14,
            1,
            db.get(Mode.coordinatorConfig).positional ?? 5
          )
          .slider(
            uiText.decimalDigits.slider.rotational.join("\n"),
            0,
            14,
            1,
            db.get(Mode.coordinatorConfig).rotational ?? 5
          )
          .toggle(
            uiText.notification.label +
              "\n§r" +
              uiText.notification.toggle.label +
              (db.get(Mode.coordinatorNotificationToggle)
                ? uiText.notification.toggle.on
                : uiText.notification.toggle.off),
            db.get(Mode.coordinatorNotificationToggle) ?? true
          )
          .show(pl)
          .then((res) => {
            const config = res.formValues;
            if (!config) return;
            db.set(
              Mode.coordinatorConfig,
              JSON.stringify({
                positional: res.formValues[0],
                rotational: res.formValues[1],
              })
            );
            db.set(Mode.coordinatorNotificationToggle, res.formValues[2]);
            if (db.get(Mode.coordinatorNotificationToggle))
              pl.sendMessage(text.coordinate.notification.update);
          });
      });
    } else if (db.get(Mode.coordinatorToggle)) {
      db.set(Mode.coordinatorToggle, false);
      if (db.get(Mode.coordinatorNotificationToggle))
        pl.sendMessage(text.coordinate.notification.disable);
    } else {
      db.set(Mode.coordinatorToggle, true);
      if (db.get(Mode.coordinatorNotificationToggle))
        pl.sendMessage(text.coordinate.notification.enable);
    }
  }
});
(async () => {
  await new Promise((resolve) =>
    server.world.afterEvents.worldInitialize.subscribe(() => resolve(void 0))
  );
  server.system.runInterval(() => {
    server.world.getAllPlayers().forEach((pl) => {
      const db = new Database(pl);
      const actionbarLine: string[] = [];
      const pushAcLine = (line: string) => actionbarLine.push(line);
      const updateAc = () =>
        pl.onScreenDisplay.setActionBar(actionbarLine.join("\n"));
      const inv = (<server.EntityInventoryComponent>(
        pl.getComponent("inventory")
      )).container;
      if (!inv) return;
      const handItem = inv.getItem(pl.selectedSlotIndex);
      db.get(Mode.coordinatorToggle)
        ? (() => {
            const pos = (() => {
              const pos = Object.values(pl.location).map((pos) =>
                pos.toFixed(db.get(Mode.coordinatorConfig).positional ?? 5)
              );
              return {
                x: pos[0] as string,
                y: pos[1] as string,
                z: pos[2] as string,
              };
            })();
            const rot = {
              x: pl
                .getRotation()
                .x.toFixed(db.get(Mode.coordinatorConfig).rotational ?? 5),
              y: pl
                .getRotation()
                .y.toFixed(db.get(Mode.coordinatorConfig).rotational ?? 5),
            };
            pushAcLine(
              text.coordinate.actionbar.positional(pos.x, pos.y, pos.z)
            );
            pushAcLine(text.coordinate.actionbar.rotational(rot.x, rot.y));
            handItem?.typeId == Items.coordinator.typeId
              ? (() => {
                  pushAcLine(text.coordinate.actionbar.interaction.disable);
                  pushAcLine(text.coordinate.actionbar.interaction.config);
                })()
              : void 0;
            db.get(Mode.practiceData).toggle
              ? pushAcLine(text.practiceMode.actionbar.enable)
              : handItem?.typeId === Items.practiceEnable.typeId
              ? isClimbing(pl)
                ? pushAcLine(`§7Can't practice mode [Climbing]`)
                : isMoving(pl) || !isOnGround(pl)
                ? pushAcLine(`§7Can't practice mode [Moving]`)
                : pushAcLine("§7[Hold] to enable practice mode")
              : void 0;
            updateAc();
          })()
        : (() => {
            handItem?.typeId == Items.coordinator.typeId
              ? (() => {
                  pushAcLine(text.coordinate.actionbar.disable);
                  pushAcLine(text.coordinate.actionbar.interaction.enable);
                  pushAcLine(text.coordinate.actionbar.interaction.config);
                })()
              : void 0;
            db.get(Mode.practiceData).toggle
              ? pushAcLine(text.practiceMode.actionbar.enable)
              : handItem?.typeId === Items.practiceEnable.typeId
              ? isClimbing(pl)
                ? pushAcLine(`§7Can't practice mode [Climbing]`)
                : isMoving(pl) || !isOnGround(pl)
                ? pushAcLine(`§7Can't practice mode [Moving]`)
                : pushAcLine("§7[Hold] to enable practice mode")
              : void 0;
            updateAc();
          })();
    });
  });
})();
