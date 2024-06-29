import { world, system, Player, Vector3 } from "@minecraft/server";
import { Vector, print, startTime, Thread } from "@lib/minecraft";
import { Database, InitialDataType, settingUI, zpkModOn } from "@zpk";

const ZPK_ITEM = "minecraft:compass";

world.beforeEvents.itemUse.subscribe((data) => {
    if (!zpkModOn) return;

    const player = data.source as Player;
    const item = data.itemStack;
    const db = Database(player);

    if (!(player instanceof Player)) return;

    if (item.typeId === ZPK_ITEM && player.isSneaking) {
        db.toggleZPKMod = !db.toggleZPKMod;
    } else if (item.typeId === ZPK_ITEM) {
        settingUI(player);
    }
});

const worldTime = startTime();

system.runInterval(() => {
    if (!zpkModOn) return;

    for (const player of world.getAllPlayers()) {
        player.dimension.setBlockPermutation(locati)
        const db = Database(player);

        if (!db.toggleZPKMod) {
            const alternateTask = function* () {
                yield alternateTitleDisplay(player, db); // Assuming alternateTitleDisplay is a generator function
            };
            const alternateThread = new Thread();
            alternateThread.start(alternateTask);
            continue;
        }

        const updateTask = function* () {
            const vel = player.getVelocity();
            const fullVel = Math.sqrt(vel.x ** 2 + vel.z ** 2);

            yield updatePlayerState(player, db, fullVel); // Assuming updatePlayerState is a generator function
            yield handleLandingState(player, db); // Assuming handleLandingState is a generator function
            yield handleMovementState(player, db, fullVel); // Assuming handleMovementState is a generator function
            yield updateGuiDisplay(player, db); // Assuming updateGuiDisplay is a generator function
        };
        const updateThread = new Thread();
        updateThread.start(updateTask);
    }
});

function alternateTitleDisplay(player: Player, db: InitialDataType) {
    switch (db.idx) {
        case 1:
            player.onScreenDisplay.setTitle("&! ");
            db.idx = 2;
            break;
        case 2:
            player.onScreenDisplay.setTitle("!& ");
            db.idx = 1;
            break;
    }
}

function updatePlayerState(player: Player, db: InitialDataType, fullVel: number) {
    const pos = player.location;
    const rot = player.getRotation();
    const vel = player.getVelocity();
    const isOnGround = player.isOnGround;

    if (rot.y != db.befTFac) {
        db.lastTurning = rot.y - db.befTFac;
        db.befTFac = rot.y;
    }

    if (isOnGround && !db.befLand) {
        updateLandingState(player, db, pos, vel, rot);
    } else if (!isOnGround) {
        updateAirborneState(db);
    }

    updateMovementState(player, db, fullVel);
}

function updateLandingState(player: Player, db: InitialDataType, pos: Vector3, vel: Vector3, rot: { y: number }) {
    db.landx = pos.x - vel.x;
    db.landy = pos.y - vel.y;
    db.landz = pos.z - vel.z;
    db.hitx = pos.x;
    db.hity = pos.y;
    db.hitz = pos.z;
    db.hita = rot.y;
    db.tier = 0;
    db.befLand = true;
    db.befJump = false;
}

function updateAirborneState(db: InitialDataType) {
    db.tier = 10;
    if (!db.befJump) {
        db.jumpTick = worldTime.getTime();
        db.befJump = true;
    } else {
        db.tier -= 1;
    }
    db.befLand = false;
}

function updateMovementState(player: Player, db: InitialDataType, fullVel: number) {
    const currentMovement = getMovement(player);

    if (currentMovement.has("Forward") || currentMovement.has("Backward") || currentMovement.has("Left") || currentMovement.has("Right")) {
        if (!db.befWalk) {
            db.befWalk = true;
            db.walkTick = worldTime.getTime();
        }
    } else if (currentMovement.has("Still")) {
        db.befWalk = false;
    }

    if (player.isSprinting && !db.befSprinting) {
        db.befSprinting = true;
        db.sprintTick = worldTime.getTime();
    } else if (!player.isSprinting) {
        db.befSprinting = false;
    }

    updateTiming(player, db, fullVel);
}

function updateTiming(player: Player, db: InitialDataType, fullVel: number) {
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
            db.lastTiming =
                db.lastTimingTick > 0 && db.lastTimingTick <= 100 ? `Max Pessi [${db.lastTimingTick}ms]` : `Pessi ${msToTicks(db.lastTimingTick).toFixed(2)} Ticks [${db.lastTimingTick}ms]`;
        }

        if (db.befSprinting && !db.sprint && !db.pessi && db.jam && db.jumpTick < db.sprintTick) {
            db.sprint = true;
            db.lastTiming = `FMM ${msToTicks(db.lastTimingTick).toFixed(2)} Ticks [${db.lastTimingTick}ms]`;
        }
    } else if (!db.HH && !db.jam && !db.pessi && !db.sprint && db.befJump && db.befWalk && db.walkTick < db.jumpTick && !player.isFalling) {
        db.HH = true;
        db.lastTimingTick = TimeDiff(db.walkTick);
        if (TimeDiff(db.walkTick) > 0) {
            db.lastTiming = (isBackward ? "BW" : "") + `HH ${msToTicks(db.lastTimingTick).toFixed(2)} Ticks [${db.lastTimingTick}ms]`;
        }
    }

    if (getMovement(player).has("Still") && player.isOnGround && !db.befJump) {
        resetTimingState(db);
    }

    if (db.tier == 10) {
        db.ja = player.getRotation().y;
    }

    updateOffset(player, db);
}

function resetTimingState(db: InitialDataType) {
    db.HH = false;
    db.jam = false;
    db.sprint = false;
    db.pessi = false;
    db.walkTick = 0;
    db.jumpTick = 0;
    db.lastTimingTick = 0;
}

function updateOffset(player: Player, db: InitialDataType) {
    const pos = player.location;
    const vel = player.getVelocity();
    const isOnGround = player.isOnGround;

    if (pos.y <= db.lb.y && vel.y <= 0 && pos.y - vel.y > db.lb.y && -Math.abs(pos.x - db.lb.x - 0.5) + 0.8 >= -1 && -Math.abs(pos.z - db.lb.z - 0.5) + 0.8 >= -1 && !db.befLandLB && db.lbon) {
        db.befLandLB = true;
        db.osx = -Math.abs(pos.x - vel.x - db.lb.x - 0.5) + 0.8;
        db.osz = -Math.abs(pos.z - vel.z - db.lb.z - 0.5) + 0.8;
        db.os = Math.sqrt(db.osx ** 2 + db.osz ** 2) * ([db.osx, db.osz].some((os) => os < 0) ? -1 : 1);

        printOffsets(player, db);

        updatePersonalBests(db, player);
    }

    if (pos.y > db.lb.y && db.befLandLB && !isOnGround) {
        db.befLandLB = false;
    }
}

function printOffsets(player: Player, db: InitialDataType) {
    if (db.sendos) {
        print(`§${db.tc1}${db.prefix} §${db.tc2}Offset: ${db.os.toFixed(db.pTF)}`, player);
    }
    if (db.sendosx) {
        print(`§${db.tc1}${db.prefix} §${db.tc2}Offset X: ${db.osx.toFixed(db.pTF)}`, player);
    }
    if (db.sendosz) {
        print(`§${db.tc1}${db.prefix} §${db.tc2}Offset Z: ${db.osz.toFixed(db.pTF)}`, player);
    }
}

function updatePersonalBests(db: InitialDataType, player: Player) {
    if (db.osx > db.pbx || !isFinite(db.pbx)) {
        db.pbx = db.osx;
        if (db.sendpbx) {
            print(`§${db.tc1}${db.prefix} §${db.tc2}New pb! X: ${db.pbx.toFixed(db.pTF)}`, player);
        }
    }

    if (db.osz > db.pbz || !isFinite(db.pbz)) {
        db.pbz = db.osz;
        if (db.sendpbz) {
            print(`§${db.tc1}${db.prefix} §${db.tc2}New pb! Z: ${db.pbz.toFixed(db.pTF)}`, player);
        }
    }

    if (db.os > db.pb || !isFinite(db.pb)) {
        db.pb = db.os;
        if (db.sendpb) {
            print(`§${db.tc1}${db.prefix} §${db.tc2}New pb!: ${db.pb.toFixed(db.pTF)}`, player);
        }
    }
}

function handleMovementState(player: Player, db: InitialDataType, fullVel: number) {
    const currentMovement = getMovement(player);

    if (currentMovement.has("Forward") || currentMovement.has("Backward") || currentMovement.has("Left") || currentMovement.has("Right")) {
        if (!db.befWalk) {
            db.befWalk = true;
            db.walkTick = worldTime.getTime();
        }
    } else if (currentMovement.has("Still")) {
        db.befWalk = false;
    }

    if (player.isSprinting && !db.befSprinting) {
        db.befSprinting = true;
        db.sprintTick = worldTime.getTime();
    } else if (!player.isSprinting) {
        db.befSprinting = false;
    }

    updateTiming(player, db, fullVel);
}

function handleLandingState(player: Player, db: any) {
    const pos = player.location;
    const vel = player.getVelocity();
    const isOnGround = player.isOnGround;

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

    if (pos.y > db.lb.y && db.befLandLB && !isOnGround) {
        db.befLandLB = false;
    }
}

function updateGuiDisplay(player: Player, db: InitialDataType) {
    const pos = player.location;
    const rot = player.getRotation();
    const vel = player.getVelocity();
    const fullVel = Math.sqrt(vel.x ** 2 + vel.z ** 2);

    const NA = (value: string | number) => (typeof value === "number" ? (isFinite(value) ? value.toFixed(db.pTF) : "N/A") : value);

    type GUI = {
        main: { labels: string[]; conditions: boolean[] };
        utils: { labels: string[]; conditions: boolean[] };
    };

    const gui: GUI = {
        main: {
            labels: [
                `§${db.tc1}X §${db.tc2}${pos.x.toFixed(db.pTF)} §${db.tc1}Y §${db.tc2}${pos.y.toFixed(db.pTF)} §${db.tc1}Z §${db.tc2}${pos.z.toFixed(db.pTF)}`,
                `${db.showpit ? `§${db.tc1}P §${db.tc2}${rot.x.toFixed(db.rTF)}` : ""}${db.showpit && db.showfac ? " " : ""}${db.showfac ? `§${db.tc1}F §${db.tc2}${rot.y.toFixed(db.rTF)}` : ""}`,
            ],
            conditions: [db.showpos, db.showpit || db.showfac],
        },
        utils: {
            labels: [
                `§${db.tc1}JA §${db.tc2}${db.ja.toFixed(db.rTF)}`,
                `§${db.tc1}Hit Angle §${db.tc2}${db.hita.toFixed(db.rTF)}`,
                `\n`,
                `§${db.tc1}Speed (b/t) §8[§${db.tc2}${vel.x.toFixed(db.pTF)}§8, §${db.tc2}${vel.y.toFixed(db.pTF)}§8, §${db.tc2}${vel.z.toFixed(db.pTF)}§8]`,
                `§${db.tc1}Total Speed (X&Z) §${db.tc2}${fullVel.toFixed(db.pTF)}`,
                `§${db.tc1}Tier §${db.tc2}${db.tier}`,
                `§${db.tc1}Last landing §8[§${db.tc2}${db.landx.toFixed(db.pTF)}§8, §${db.tc2}${db.landy.toFixed(db.pTF)}§8, §${db.tc2}${db.landz.toFixed(db.pTF)}§8]`,
                `§${db.tc1}Hit §8[§${db.tc2}${db.hitx.toFixed(db.pTF)}§8, §${db.tc2}${db.hity.toFixed(db.pTF)}§8, §${db.tc2}${db.hitz.toFixed(db.pTF)}§8]`,
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
