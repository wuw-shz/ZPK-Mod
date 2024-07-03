import { world } from "@minecraft/server";

world.beforeEvents.chatSend.subscribe(ev => {
   const sender = ev.sender;
   const msg  =   ev.message;
})