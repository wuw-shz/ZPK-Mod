import { world } from "@minecraft/server";

world.beforeEvents.chatSend.subscribe((ev) => {
    const  = ev.sender;
    const msg = ev.message;
});
