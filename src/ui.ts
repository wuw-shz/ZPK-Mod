import {Player, system} from '@minecraft/server';
import {Database} from 'database';
import * as ui from '@minecraft/server-ui';

/*Setting UI*/

export function settingUI(player: Player) {
  run(() => {
    const menu = new ui.ActionFormData();
    menu.title('§lZPK Mod Setting');
    menu.button('GUI');
    menu.button('Texts');
    menu.button('Other');
    forceShow(player, menu).then(menu => {
      if (menu.canceled) return;
      [GUIUI, TextsUI, OtherUI][menu.selection](player);
    });
  });
}

/*GUI UI*/

export function GUIUI(player: Player) {
  run(() => {
    const db = Database(player);
    db.beforetfac
    const gui = new ui.ModalFormData();
    gui.title('GUI Setting');
    gui.slider('Pos Precition', 2, 20, 1, db.pTF);
    gui.slider('Rot Precision', 0, 20, 1, db.rTF);
    const def = (def: boolean) =>
      def ? '§8(§7show§8/hide)' : '§8(show/§7hide§8)';
    gui.toggle(`Position\n${def(db.showpos)}`, db.showpos);
    gui.toggle(`Pitch\n${def(db.showpit)}`, db.showpit);
    gui.toggle(`Facing\n${def(db.showfac)}`, db.showfac);
    gui.toggle(`Jump Angle\n${def(db.showja)}`, db.showja);
    gui.toggle(`Hit Angle\n${def(db.showhita)}`, db.showhita);
    gui.toggle(`Speed\n${def(db.showspeed)}`, db.showspeed);
    gui.toggle(`Total Speed\n${def(db.showttspeed)}`, db.showttspeed);
    gui.toggle(`Tier\n${def(db.showtier)}`, db.showtier);
    gui.toggle(`Last Landing\n${def(db.showland)}`, db.showland);
    gui.toggle(`Hit\n${def(db.showhit)}`, db.showhit);
    gui.toggle(`Offset\n${def(db.showos)}`, db.showos);
    gui.toggle(`PB\n${def(db.showpb)}`, db.showpb);
    gui.toggle(`Last Turning\n${def(db.showturn)}`, db.showturn);
    forceShow(player, gui).then(gui => {
      if (gui.canceled) return settingUI(player);
      db.pTF = gui.formValues[0] as number;
      db.rTF = gui.formValues[1] as number;
      db.showpos = gui.formValues[2] as boolean;
      db.showpit = gui.formValues[3] as boolean;
      db.showfac = gui.formValues[4] as boolean;
      db.showja = gui.formValues[5] as boolean;
      db.showhita = gui.formValues[6] as boolean;
      db.showspeed = gui.formValues[7] as boolean;
      db.showttspeed = gui.formValues[8] as boolean;
      db.showtier = gui.formValues[9] as boolean;
      db.showland = gui.formValues[10] as boolean;
      db.showhit = gui.formValues[11] as boolean;
      db.showos = gui.formValues[12] as boolean;
      db.showpb = gui.formValues[13] as boolean;
      db.showturn = gui.formValues[14] as boolean;
    });
  });
}

/*Texts UI*/

export function TextsUI(player: Player) {
  run(() => {
    const db = Database(player);
    const texts = new ui.ModalFormData();
    texts.title('Text Setting');
    texts.textField('Labels Color\n§o§8(0-9/a-u)', '0-9/a-u', db.tc1);
    texts.textField('Value Color\n§o§8(0-9/a-u)', '0-9/a-u', db.tc2);
    texts.textField('Prefix', '<ZPK>', db.prefix);
    texts.toggle('Send offset x in chat', db.sendosx);
    texts.toggle('Send offset z in chat', db.sendosz);
    texts.toggle('Send Total PB in chat', db.sendpb);
    texts.toggle('Send PB x in chat', db.sendpbx);
    texts.toggle('Send PB z in chat', db.sendpbz);
    forceShow(player, texts).then(texts => {
      if (texts.canceled) return settingUI(player);
      db.tc1 = texts.formValues[0] as string;
      db.tc2 = texts.formValues[1] as string;
      db.prefix = texts.formValues[2] as string;
      db.sendos = texts.formValues[3] as boolean;
      db.sendosx = texts.formValues[4] as boolean;
      db.sendosz = texts.formValues[5] as boolean;
      db.sendpb = texts.formValues[6] as boolean;
      db.sendpbx = texts.formValues[7] as boolean;
      db.sendpbz = texts.formValues[8] as boolean;
    });
  });
}

/*Other UI*/

function OtherUI(player: Player) {
  run(() => {
    const db = Database(player);
    const other = new ui.ModalFormData();
    other.title('Other Setting');
    other.slider('Offset limit', 0.1, 1.5, 0.1);
    other.textField('Custom Text', 'text', db.customText);
    forceShow(player, other).then(other => {
      if (other.canceled) return settingUI(player);
      db.os = +(other.formValues[0] as number).toFixed(1);
      db.customText = other.formValues[1] as string;
    });
  });
}

const run = (callback: () => void) => system.run(callback);

async function forceShow(
  player: Player,
  form: ui.ModalFormData
): Promise<ui.ModalFormResponse>;
async function forceShow(
  player: Player,
  form: ui.ActionFormData
): Promise<ui.ActionFormResponse>;
async function forceShow(
  player: Player,
  form: ui.MessageFormData
): Promise<ui.MessageFormResponse>;
async function forceShow(
  player: Player,
  form: ui.ModalFormData | ui.ActionFormData | ui.MessageFormData
) {
  while (true) {
    const response = await form.show(player);
    if (response.cancelationReason !== ui.FormCancelationReason.UserBusy) {
      return response;
    }
  }
}
