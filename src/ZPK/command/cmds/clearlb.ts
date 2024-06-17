import { CommandInfo, print } from "@lib/minecraft";
import { registerCommand, Database } from "@zpk";

const regInfo: CommandInfo = {
    name: "clearlb",
    description: "Clear lb.",
    aliases: ["clb"],
};

registerCommand(regInfo, (player) => {
    const db = Database(player);
    db.os = Infinity;
    db.osx = Infinity;
    db.osz = Infinity;
    db.sqos = Infinity;
    db.pb = Infinity;
    db.pbx = Infinity;
    db.pbz = Infinity;
    db.lbon = false;
    print("§l§a✔ Clear pb and offset!", player);
});
