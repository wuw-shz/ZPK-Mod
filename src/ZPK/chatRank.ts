import { Server } from "@li";
import { world } from "@minecraft/server";

world.beforeEvents.chatSend.subscribe((ev) => {
    const pl = ev.sender;
    const msg = ev.message;
    Server
});
