import { Player, system } from "@minecraft/server";
import * as ui from "@minecraft/server-ui";
import { DatabaseZPK, Key } from "@zpk";
import { Mode, DatabaseOJR, text } from "@oj-realm";
import { tests } from "vscode";

/*Setting UI*/

export function settingUI(player: Player) {
  run(() => {
    const menu = new ui.ActionFormData();
    menu.title("§lZPK Mod Setting");
    menu.button("GUI");
    menu.button("Texts");
    menu.button("Other");
    forceShow(player, menu).then((menu) => {
      if (menu.canceled) return;
      [GUIUI, TextsUI, OtherUI][menu.selection](player);
      if (DatabaseZPK(player).notification) player.sendMessage(text.setting.notification.update);
    });
  });
}

/*GUI UI*/

export function GUIUI(player: Player) {
  run(() => {
    const dbZPK = DatabaseZPK(player);
    const gui = new ui.ModalFormData();
    gui.title("GUI Setting");
    // gui.slider("Pos Precition", 2, 20, 1, dbZPK.pTF);
    // gui.slider("Rot Precision", 0, 20, 1, dbZPK.rTF);
    gui.toggle(`Separate GUI\n${dbZPK.separateGui ? "§8(§7yes§8/no)" : "§8(yes/§7no§8)"}`, dbZPK.separateGui);
    const def = (def: boolean) => (def ? "§8(§7show§8/hide)" : "§8(show/§7hide§8)");
    gui.toggle(`Position\n${def(dbZPK.showpos)}`, dbZPK.showpos);
    gui.toggle(`Rotation\n${def(dbZPK.showrot)}`, dbZPK.showrot);
    gui.toggle(`Jump Angle\n${def(dbZPK.showja)}`, dbZPK.showja);
    gui.toggle(`Hit Angle\n${def(dbZPK.showhita)}`, dbZPK.showhita);
    gui.toggle(`Speed\n${def(dbZPK.showspeed)}`, dbZPK.showspeed);
    gui.toggle(`Total Speed\n${def(dbZPK.showttspeed)}`, dbZPK.showttspeed);
    gui.toggle(`Tier\n${def(dbZPK.showtier)}`, dbZPK.showtier);
    gui.toggle(`Last Landing\n${def(dbZPK.showland)}`, dbZPK.showland);
    gui.toggle(`Hit\n${def(dbZPK.showhit)}`, dbZPK.showhit);
    gui.toggle(`Offset\n${def(dbZPK.showos)}`, dbZPK.showos);
    gui.toggle(`PB\n${def(dbZPK.showpb)}`, dbZPK.showpb);
    gui.toggle(`Last Turning\n${def(dbZPK.showLastTurning)}`, dbZPK.showLastTurning);
    gui.toggle(`Last Timing\n${def(dbZPK.showLastTiming)}`, dbZPK.showLastTiming);
    forceShow(player, gui).then((gui) => {
      if (gui.canceled) return settingUI(player);
      gui.formValues.forEach((value, idx) => {
        const w = [
          "separateGui",
          "showpos",
          "showrot",
          "showja",
          "showhita",
          "showspeed",
          "showttspeed",
          "showtier",
          "showland",
          "showhit",
          "showos",
          "showpb",
          "showLastTurning",
          "showLastTiming",
        ][idx];
        dbZPK[w] = value as Key[number];
      });
    });
  });
}

/*Texts UI*/

export function TextsUI(player: Player) {
  run(() => {
    const dbZPK = DatabaseZPK(player);
    const uiText = text.setting.ui;
    const texts = new ui.ModalFormData();
    texts.title("Text Setting");
    texts
      .slider(
        uiText.decimalDigits.label + "\n§r" + uiText.decimalDigits.slider.positional.join("\n"),
        0,
        100,
        1,
        dbZPK.pTF ?? 5
      )
      .slider(uiText.decimalDigits.slider.rotational.join("\n"), 0, 100, 1, dbZPK.rTF ?? 5);
    texts.textField("Labels Color\n§o§8(0-9/a-u)", "0-9/a-u", dbZPK.tc1);
    texts.textField("Value Color\n§o§8(0-9/a-u)", "0-9/a-u", dbZPK.tc2);
    texts.textField("Prefix", "<ZPK>", dbZPK.prefix);
    texts.toggle("Labels Shadow", dbZPK.shadowLabels);
    texts.toggle("Send Total offset in chat", dbZPK.sendos);
    texts.toggle("Send offset x in chat", dbZPK.sendosx);
    texts.toggle("Send offset z in chat", dbZPK.sendosz);
    texts.toggle("Send Total PB in chat", dbZPK.sendpb);
    texts.toggle("Send PB x in chat", dbZPK.sendpbx);
    texts.toggle("Send PB z in chat", dbZPK.sendpbz);
    forceShow(player, texts).then((texts) => {
      if (texts.canceled) return settingUI(player);
      texts.formValues.forEach((value, idx) => {
        const w = [
          "pTF",
          "rTF",
          "tc1",
          "tc2",
          "prefix",
          "shadowLabels",
          "sendos",
          "sendosx",
          "sendosz",
          "sendpb",
          "sendpbx",
          "sendpbz",
        ][idx];
        dbZPK[w] = value as Key[number];
      });
    });
  });
}

/*Other UI*/

export function OtherUI(player: Player) {
  run(() => {
    const dbZPK = DatabaseZPK(player);
    const uiText = text.setting.ui;
    const other = new ui.ModalFormData();
    other.title("Other Setting");
    other.slider("Offset limit", 0.1, 1.5, 0.1, dbZPK.os);
    other.textField("Custom Text", "text", dbZPK.customText);
    other.toggle(
      uiText.notification.label +
        "\n§r" +
        uiText.notification.toggle.label +
        (dbZPK.notification ? uiText.notification.toggle.on : uiText.notification.toggle.off),
      dbZPK.notification ?? true
    );
    forceShow(player, other).then((other) => {
      if (other.canceled) return settingUI(player);
      other.formValues.forEach((value, idx) => {
        const w = ["os", "customText", "notification"][idx];
        dbZPK[w] = value as Key[number];
      });
    });
  });
}

const run = (callback: () => void) => system.run(callback);

async function forceShow(player: Player, form: ui.ModalFormData): Promise<ui.ModalFormResponse>;
async function forceShow(player: Player, form: ui.ActionFormData): Promise<ui.ActionFormResponse>;
async function forceShow(player: Player, form: ui.MessageFormData): Promise<ui.MessageFormResponse>;
async function forceShow(player: Player, form: ui.ModalFormData | ui.ActionFormData | ui.MessageFormData) {
  while (true) {
    const response = await form.show(player);
    if (response.cancelationReason !== ui.FormCancelationReason.UserBusy) {
      return response;
    }
  }
}
