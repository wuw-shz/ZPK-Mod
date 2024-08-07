import { CommandInfo, print } from "@lib/minecraft";
import { registerCommand, Database } from "@zpk";

const regInfo: CommandInfo = {
    name: "clearpb",
    description: "Clear pb and offset.",
    aliases: ["cpb"],
    usage: [{ flag: "s" }],
};

registerCommand(regInfo, (player, msg, args) => {
    const db = Database(player);
    db.os = Infinity;
    db.osx = Infinity;
    db.osz = Infinity;
    db.sqos = Infinity;
    db.pb = Infinity;
    db.pbx = Infinity;
    db.pbz = Infinity;
    if (args.has("s")) return;
    print("§l§a✔ Clear pb and offset!", player);
});
