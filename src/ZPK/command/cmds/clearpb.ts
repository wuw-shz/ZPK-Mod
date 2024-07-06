import { CommandInfo, print } from "@lib/minecraft";
import { registerCommand, Database } from "@zpk";

const regInfo: CommandInfo = {
    name: "clearpb",
    description: "Clear pb and offset.",
    aliases: ["cpb"],
    usage: [{ flag: "sl" }],
};

registerCommand(regInfo, (player, msgm arg) => {
    const db = Database(player);
    db.os = Infinity;
    db.osx = Infinity;
    db.osz = Infinity;
    db.sqos = Infinity;
    db.pb = Infinity;
    db.pbx = Infinity;
    db.pbz = Infinity;
    if ()
    print("§l§a✔ Clear pb and offset!", player);
});
