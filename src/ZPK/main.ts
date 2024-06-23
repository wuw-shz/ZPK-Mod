import { world, system, Player } from "@minecraft/server";
import { Database, settingUI, zpkModOn } from "@zpk";
import { Timer, Vector, print, startTime } from "@lib/minecraft";

/*Toggle ZPK Mod*/

world.beforeEvents.itemUse.subscribe((data) => {
    if (!zpkModOn) return;
    const player = data.source as Player;
    const item = data.itemStack;
    const db = Database(player);
    if (!(player instanceof Player)) return;
    if (item.typeId === "minecraft:compass" && player.isSneaking) {
        if (!db.toggleZPKMod) db.toggleZPKMod = true;
        else db.toggleZPKMod = false;
    } else if (item.typeId === "minecraft:compass") {
        settingUI(player);
    }
});

const worldTime = startTime();

system.runInterval(() => {
    if (!zpkModOn) return;
    for (const player of world.getAllPlayers()) {
        const db = Database(player);
        if (!db.toggleZPKMod) {
            switch (db.idx) {
                case 1:
                    player.onScreenDisplay.setTitle("&!");
                    db.idx = 2;
                    break;
                case 2:
                    player.onScreenDisplay.setTitle("!&");
                    db.idx = 1;
                    break;
            }
            continue;
        }
        const pos = player.location;
        const rot = player.getRotation();
        const vel = player.getVelocity();
        const isonground = player.isOnGround;
        const fullvel = Math.sqrt(vel.x ** 2 + vel.z ** 2);
        if (rot.y != db.befTFac) {
            db.lastTurning = rot.y - db.befTFac;
            db.befTFac = rot.y;
        }
        if (isonground && !db.befLand) {
            db.landx = pos.x - vel.x;
            db.landy = pos.y - vel.y;
            db.landz = pos.z - vel.z;
            db.hitx = pos.x;
            db.hity = pos.y;
            db.hitz = pos.z;
            db.hita = rot.y;
            db.tier = 0;
            db.befLand = true;
            if (db.befJump) {
                db.befJump = false;
            }
        }
        if (!isonground) {
            if (db.befLand) {
                db.tier = 10;
                if (!db.befJump) {
                    db.jumpTick = worldTime.getTime();
                    db.befJump = true;
                }
            } else {
                db.tier -= 1;
            }
            db.befLand = false;
        }
        if ((getMovement(player).has("Forward") || getMovement(player).has("Backward") || getMovement(player).has("Left") || getMovement(player).has("Right")) && !db.befWalk) {
            db.befWalk = true;
            db.walkTick = worldTime.getTime();
        }
        if (getMovement(player).has("Still") && db.befWalk) {
            db.befWalk = false;
        }
        if (player.isSprinting && !db.befSprinting) {
            db.befSprinting = true;
            db.sprintTick = worldTime.getTime();
        }
        if (!player.isSprinting && db.befSprinting) {
            db.befSprinting = false;
        }
        const TimeDiff = (ms: number) => worldTime.getTime() - ms;
        const msToTicks = (ms: number) => (ms / 1000) * 20;
        const isBackward = getMovement(player).has("Backward");
        if (!db.HH && db.befJump && db.befWalk && db.jumpTick <= db.walkTick) {
            db.lastTimingTick = TimeDiff(db.jumpTick);
            if (db.jumpTick == db.walkTick && !db.jam) {
                db.jam = true;
                db.lastTiming = (isBackward ? "BW" : "") + "Jam";
            }
            if (db.lastTimingTick > 0 && !db.pessi && !db.jam) {
                db.pessi = true;
                if (db.lastTimingTick > 0 && db.lastTimingTick <= 100) db.lastTiming = `Max Pessi [${db.lastTimingTick}ms]`;
                else db.lastTiming = `Pessi ${msToTicks(db.lastTimingTick).toFixed(2)} Ticks [${db.lastTimingTick}ms]`;
            }
            if (db.befSprinting && !db.sprint && !db.pessi && db.jam && db.jumpTick < db.sprintTick) {
                db.sprint = true;
                db.lastTiming = `FMM ${msToTicks(db.lastTimingTick).toFixed(2)} Ticks [${db.lastTimingTick}ms]`;
            }
        } else if (!db.HH && !db.jam && !db.pessi && !db.sprint && db.befJump && db.befWalk && db.walkTick < db.jumpTick && !player.isFalling) {
            db.HH = true;
            db.lastTimingTick = TimeDiff(db.walkTick);
            if (TimeDiff(db.walkTick) > 0) db.lastTiming = (isBackward ? "BW" : "") + `HH ${msToTicks(db.lastTimingTick).toFixed(2)} Ticks [${db.lastTimingTick}ms]`;
        }
        if (getMovement(player).has("Still") && player.isOnGround && !db.befJump) {
            db.HH = false;
            db.jam = false;
            db.sprint = false;
            db.pessi = false;
            db.walkTick = 0;
            db.jumpTick = 0;
            db.lastTimingTick = 0;
        }
        if (db.tier == 10) {
            db.ja = rot.y;
        }
        if (pos.y <= db.lb.y && vel.y <= 0 && pos.y - vel.y > db.lb.y && -Math.abs(pos.x - db.lb.x - 0.5) + 0.8 >= -1 && -Math.abs(pos.z - db.lb.z - 0.5) + 0.8 >= -1 && !db.befLandLB && db.lbon) {
            db.befLandLB = true;
            db.osx = -Math.abs(pos.x - vel.x - db.lb.x - 0.5) + 0.8;
            db.osz = -Math.abs(pos.z - vel.z - db.lb.z - 0.5) + 0.8;
            db.os = Math.sqrt(db.osx ** 2 + db.osz ** 2) * ([db.osx, db.osz].some((os) => os < 0) ? -1 : 1);
            db.sendos && print(`§${db.tc1}${db.prefix} §${db.tc2}Offset: ${db.os.toFixed(db.pTF)}`, player);
            db.sendosx && print(`§${db.tc1}${db.prefix} §${db.tc2}Offset X: ${db.osx.toFixed(db.pTF)}`, player);
            db.sendosz && print(`§${db.tc1}${db.prefix} §${db.tc2}Offset Z: ${db.osz.toFixed(db.pTF)}`, player);
            if (db.osx > db.pbx || !isFinite(db.pbx)) {
                db.pbx = db.osx;
                db.sendpbx && print(`§${db.tc1}${db.prefix} §${db.tc2}New pb! X: ${db.pbx.toFixed(db.pTF)}`, player);
            }
            if (db.osz > db.pbz || !isFinite(db.pbz)) {
                db.pbz = db.osz;
                db.sendpbz && print(`§${db.tc1}${db.prefix} §${db.tc2}New pb! Z: ${db.pbz.toFixed(db.pTF)}`, player);
            }
            if (db.os > db.pb || !isFinite(db.pb)) {
                db.pb = db.os;
                db.sendpb && print(`§${db.tc1}${db.prefix} §${db.tc2}New pb!: ${db.pb.toFixed(db.pTF)}`, player);
            }
        }
        if (pos.y > db.lb.y && db.befLandLB && !isonground) {
            db.befLandLB = false;
        }
        const NA = (value: string | number) => (typeof value == "number" ? (isFinite(value) ? value.toFixed(db.pTF) : "N/A") : value);
        type GUI = {
            main: { labels: string[]; conditions: boolean[] };
            utils: { labels: string[]; conditions: boolean[] };
        };
        const gui: GUI = {
            main: {
                labels: [
                    `§${db.tc1}X §${db.tc2}${pos.x.toFixed(db.pTF)} §${db.tc1}Y §${db.tc2}${pos.y.toFixed(db.pTF)} §${db.tc1}Z §${db.tc2}${pos.z.toFixed(db.pTF)}`,
                    `${db.showpit ? `§${db.tc1}P §${db.tc2}${rot.x.toFixed(db.rTF)}` : ""}${db.showpit && db.showfac ? " " : ""}${db.showfac ? `§${db.tc1}F §${db.tc2}${rot.y.toFixed(db.rTF)}` : ""}`,
                    `§eYou're in §7[§l§epractice mode§r§7]`,
                ],
                conditions: [db.showpos, db.showpit || db.showfac, JSON.parse(player.getDynamicProperty("practiceData") as string).toggle as boolean],
            },

            utils: {
                labels: [
                    `§${db.tc1}JA §${db.tc2}${db.ja.toFixed(db.rTF)} `,
                    `§${db.tc1}Hit Angle §${db.tc2}${db.hita.toFixed(db.rTF)}`,
                    `\n`,
                    `§${db.tc1}Speed (b/t) §8[§${db.tc2}${vel.x.toFixed(db.pTF)}§8, §${db.tc2}${vel.y.toFixed(db.pTF)}§8, §${db.tc2}${vel.z.toFixed(db.pTF)}§8]`,
                    `§${db.tc1}Total Speed (X&Z) §${db.tc2}${fullvel.toFixed(db.pTF)}`,
                    `§${db.tc1}Tier §${db.tc2}${db.tier}`,
                    `§${db.tc1}Last landing §8[§${db.tc2}${db.landx.toFixed(db.pTF)}§8, §${db.tc2}${db.landy.toFixed(db.pTF)}§8, §${db.tc2}${db.landz.toFixed(db.pTF)}§8]`,
                    `§${db.tc1}Hit §8[§${db.tc2}${db.hitx.toFixed(db.pTF)}§8, §${db.tc2}${db.hity.toFixed(db.pTF)}§${db.tc1}§8, §${db.tc2}${db.hitz.toFixed(db.pTF)}§8]`,
                    `§${db.tc1}Offset §${db.tc2}${NA(db.os)} §${db.tc1}(X, Z) §8[§${db.tc2}${NA(db.osx)}§${db.tc1}§8, §${db.tc2}${NA(db.osz)}§8]`,
                    `§${db.tc1}PB §${db.tc2}${NA(db.pb)} §${db.tc1}(X, Z) §8[§${db.tc2}${NA(db.pbx)}§8, §${db.tc2}${NA(db.pbz)}§8]`,
                    `§${db.tc1}Last Turning §${db.tc2}${db.lastTurning.toFixed(db.rTF)}`,
                    `§${db.tc1}Last Timing §${db.tc2}${db.lastTiming}`,
                ],
                conditions: [
                    db.showja,
                    db.showhita,
                    db.separateGui ? db.showja || db.showhita : db.showpos || db.showpit || db.showfac || db.showja || db.showhita,
                    db.showspeed,
                    db.showttspeed,
                    db.showtier,
                    db.showland,
                    db.showhit,
                    db.showos,
                    db.showpb,
                    db.showLastTurning,
                    db.showLastTiming,
                ],
            },
        };
        if (db.separateGui) {
            switch (db.idx) {
                case 1:
                    db.idx = 2;
                    player.onScreenDisplay.setTitle("!&§r§f" + gui.main.labels.filter((l, i) => gui.main.conditions[i]).join("\n"));
                    break;
                case 2:
                    db.idx = 1;
                    player.onScreenDisplay.setTitle("&!§r§f" + gui.utils.labels.filter((l, i) => gui.utils.conditions[i]).join("\n"));
                    break;
            }
        } else {
            switch (db.idx) {
                case 1:
                    db.idx = 2;
                    player.onScreenDisplay.setTitle(
                        "!&§r§f" +
                            gui.main.labels
                                .slice(2)
                                .filter((l, i) => gui.main.conditions.slice(2)[i])
                                .join("\n")
                    );
                    break;
                case 2:
                    db.idx = 1;
                    player.onScreenDisplay.setTitle(
                        "&!§r§f" +
                            gui.main.labels
                                .concat(gui.utils.labels)
                                .filter((l, i) => gui.main.conditions.concat(gui.utils.conditions)[i])
                                .join("\n")
                    );
                    break;
            }
        }
    }
});

function getMovement(player: Player) {
    const vel = player.getVelocity();
    const rot = player.getRotation();
    const vec = new Vector(vel).rotateY(-rot.y).toFixed(1);
    const dir = new Set<"Still" | "Left" | "Right" | "Up" | "Down" | "Forward" | "Backward">();
    if (vec.lengthSqr === 0) return dir.add("Still");
    if (vec.x > 0) dir.add("Left");
    if (vec.x < 0) dir.add("Right");
    if (vec.y > 0) dir.add("Up");
    if (vec.y < 0) dir.add("Down");
    if (vec.z > 0) dir.add("Forward");
    if (vec.z < 0) dir.add("Backward");
    return dir;
}