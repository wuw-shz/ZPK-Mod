import { world, system } from "@minecraft/server";
import { text } from "@oj-realm";

world.beforeEvents.itemUse.subscribe(data => {
    const it = data.itemStack;
    if (it.typeId !== 'minecraft:nether_star')
        return;
    data.cancel = true;
    const pl = data.source;
    system.run(() => {
        pl.teleport({ x: 0.5, y: 50, z: 0.5 }, { rotation: { x: 0, y: 0 } });
    });
    pl.sendMessage(text.lobby.notification.teleport);
});