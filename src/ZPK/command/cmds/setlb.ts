import { CommandInfo, print, Server, Vector } from "@lib/minecraft";
import { registerCommand, Database, cmdPrefix } from "@zpk";
const vec3 = (x: number, y: number, z: number) => new Vector(x, y, z);

const regInfo: CommandInfo = {
    name: "setlb",
    description: "Set lb.",
    aliases: ["slb", "sb"],
    usage: [{
        name: "pos",
    },{ name: "target", type: "string", default: "" }],
};

registerCommand(regInfo, (player, msg, args) => {
    const db = Database(player);
    if (["target", "tg"].includes(args.get("target") as string)) {
        const target = player.getBlockFromViewDirection().block;
        db.lbon = true;
        db.lb = vec3(Math.floor(target.x), target.y + 1, Math.floor(target.z));
        Server.command.callCommand(player, "clearpb");
        print(`§l§a✔ Set lb target block! at (${db.lb.x}, ${db.lb.y}, ${db.lb.z})`, player);
    } else if (args.get("target") === "") {
        const pos = player.location;
        db.lbon = true;
        db.lb = vec3(Math.floor(pos.x), pos.y, Math.floor(pos.z));
        Server.command.callCommand(player, "clearpb");
        print(`§l§a✔ Set lb here! at (${db.lb.x}, ${db.lb.y}, ${db.lb.z})`, player);
    } else {
        print(`§l§c✘ Invalid target input! Using "${cmdPrefix}setlb [target, tg]"`, player);
    }
});
