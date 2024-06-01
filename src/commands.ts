import { world } from "@minecraft/server";
import { Database } from "database";
import { settingUI } from "ui";

world.beforeEvents.chatSend.subscribe(eventData => {
    const sender = eventData.sender;
    const pos = sender.location;
    const db = Database(sender);
    switch (eventData.message) {
      case '.setlb':
        eventData.cancel = true;
        db.lbx = +pos.x.toFixed(6);
        db.lby = +pos.y.toFixed(3);
        db.lbz = +pos.z.toFixed(6);
        break;
      case '.clearpb':
        eventData.cancel = true;
        db.osx = -0;
        db.osz = -0;
        db.os = 0;
        db.sqos = 0;
        db.pbx = -0.5;
        db.pbz = -0.5;
        db.pb = -1;
        break;
      case '.setting' || '.st':
        eventData.cancel = true;
        settingUI(sender);
        break;
    }
  });