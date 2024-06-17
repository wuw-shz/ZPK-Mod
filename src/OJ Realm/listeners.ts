import * as server from "@minecraft/server";
import { Mode, Database } from "@oj-realm";

server.world.afterEvents.worldInitialize.subscribe(initData => {
    // const def = new server.DynamicPropertiesDefinition();
    // def.defineString(Mode.coordinatorConfig, 2 ** 6);
    // def.defineString(Mode.practiceData, 2 ** 8);
    // def.defineString(Mode.saves, 2 ** 16);
    // def.defineBoolean(Mode.coordinatorToggle);
    // def.defineBoolean(Mode.coordinatorNotificationToggle);
    // initData.propertyRegistry.registerEntityTypeDynamicProperties(def, 'minecraft:player');
});

server.system.beforeEvents.watchdogTerminate.subscribe(watchDog => {
    watchDog.cancel = true;
});

(async () => {
    await new Promise(resolve => server.world.afterEvents.worldInitialize.subscribe(() => resolve(void 0)));
    console.warn('Initializing database...');
    server.system.runInterval(() => {
        server.world.getAllPlayers().forEach(pl => {
            const db = new Database(pl);
            try {
                if (!db.has(Mode.coordinatorToggle))
                    db.set(Mode.coordinatorToggle, false);
                if (!db.has(Mode.coordinatorNotificationToggle))
                    db.set(Mode.coordinatorNotificationToggle, true);
                if (!db.has(Mode.coordinatorConfig))
                    db.set(Mode.coordinatorConfig, JSON.stringify({ positional: 5, rotational: 5 }));
                if (!db.has(Mode.practiceData))
                    db.set(Mode.practiceData, JSON.stringify({ toggle: false, location: { x: null, y: null, z: null }, rotation: { x: null, y: null } }));
                if (!db.has(Mode.saves))
                    db.set(Mode.saves, JSON.stringify({}));
            } catch (e) {
            }
        })
    })
})();