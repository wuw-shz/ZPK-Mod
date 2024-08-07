import { CommandInfo, CommandPosition, print, Server, Vector } from "@lib/minecraft";
import { world } from "@minecraft/server";
import { registerCommand, Database, cmdPrefix } from "@zpk";
const vec3 = (x: number, y: number, z: number) => new Vector(x, y, z);

const regInfo: CommandInfo = {
    name: "setlb",
    description: "Set lb.",
    aliases: ["slb", "sb"],
    usage: [
        { name: "target", type: "string", default: "" },
        { name: "pos2", type: "string", default: "" },
        { name: "pos3", type: "string", default: "" },
    ],
};

registerCommand(regInfo, (player, msg, args) => {
    const db = Database(player);
    if (args.get("target") === "") {
        const pos = player.location;
        db.lbon = true;
        db.lb = vec3(Math.floor(pos.x), pos.y, Math.floor(pos.z));
        Server.command.callCommand(player, "clearpb", ["-s"]);
        print(`§l§a✔ Set lb here! at (${db.lb.x}, ${db.lb.y}, ${db.lb.z})`, player);
    } else if (["target", "tg"].includes(args.get("target") as string) && !args.get("pos2") && !args.get("pos3")) {
        const target = player.getBlockFromViewDirection().block;
        db.lbon = true;
        db.lb = vec3(Math.floor(target.x), target.y + 1, Math.floor(target.z));
        Server.command.callCommand(player, "clearpb", ["-s"]);
        print(`§l§a✔ Set lb target block! at (${db.lb.x}, ${db.lb.y}, ${db.lb.z})`, player);
    } else if (positionFormat(args.get("target") + args.get("pos2") + args.get("pos3")).length === 3) {
        const pos = CommandPosition.parseArgs(positionFormat(args.get("target") + args.get("pos2") + args.get("pos3")), 0).result.relativeTo(player, true);
        db.lbon = true;
        db.lb = vec3(Math.floor(pos.x), pos.y, Math.floor(pos.z));
        Server.command.callCommand(player, "clearpb", ["-s"]);
        print(`§l§a✔ Set lb! at pos (${db.lb.x}, ${db.lb.y}, ${db.lb.z})`, player);
    } else {
        print(`§l§c✘ Invalid setlb command input!\nUsage:\n ${cmdPrefix}setlb <targetBlock: "target" or "tg">\n ${cmdPrefix}setlb <position: x y z>`, player);
    }
});

function positionFormat(pos: string) {
    return pos.match(/(\^|~)(-?\.?\d+|\d?)|(?<=\s)-?\.?\d+/g);
}
