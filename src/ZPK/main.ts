import { world, system, Player, Vector3, Vector2 } from "@minecraft/server";
import { Database, settingUI, zpkModOn, InitialDataType } from "@zpk";
import { Timer, Vector, print, startTime } from "@lib/minecraft";

const worldTime = startTime();

world.beforeEvents.itemUse.subscribe((data) => {
    if (!zpkModOn) return;

    const player = data.source as Player;
    const item = data.itemStack;
    const db = Database(player);

    if (!(player instanceof Player)) return;

    if (item.typeId === "minecraft:compass") {
        if (player.isSneaking) {
            db.toggleZPKMod = !db.toggleZPKMod;
        } else {
            settingUI(player);
        }
    }
});

system.runInterval(() => {
    if (!zpkModOn) return;

    for (const player of world.getAllPlayers()) {
        const db = Database(player);
        const pos = player.location;
        const vel = player.getVelocity();
        const rot = player.getRotation();
        const isonground = player.isOnGround;
        const fullvel = Math.sqrt(vel.x ** 2 + vel.z ** 2);

        updatePlayerState(db, player, pos, vel, rot, isonground, fullvel);
        renderPlayerGUI(db, player);
    }
});

function updatePlayerState(db: InitialDataType, player: Player, pos: Vector3, vel: Vector3, rot: Vector2, isonground: boolean, fullvel: number) {
    if (isonground && !db.befLand) {
        initializeOnGroundState(db, pos, vel, rot);
    }

    if (!isonground) {
        handleInAirState(db);
    }

    handleMovementStates(db, player);
    handleOffsetState(db, player, pos);
}

function initializeOnGroundState(db: InitialDataType, pos: Vector3, vel: Vector3, rot: Vector2) {
    db.befLand = true;
    db.landx = pos.x - vel.x;
    db.landy = pos.y - vel.y;
    db.landz = pos.z - vel.z;
    db.hitx = pos.x;
    db.hity = pos.y;
    db.hitz = pos.z;
    db.befJump = false;
    db.tier = 0;
}

function handleInAirState(db: InitialDataType) {
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

function handleMovementStates(db: PlayerData, player: Player) {
    const movement = getMovement(player);
    const worldTimeNow = worldTime.getTime();
    const isBackward = movement.has("Backward");

    if ((movement.has("Forward") || movement.has("Backward") || movement.has("Left") || movement.has("Right")) && !db.befWalk) {
        db.befWalk = true;
        db.walkTick = worldTimeNow;
    }
    if (movement.has("Still") && db.befWalk) {
        db.befWalk = false;
    }
    if (player.isSprinting && !db.befSprinting) {
        db.befSprinting = true;
        db.sprintTick = worldTimeNow;
    }
    if (!player.isSprinting && db.befSprinting) {
        db.befSprinting = false;
    }

    const TimeDiff = (ms: number) => worldTimeNow - ms;
    const msToTicks = (ms: number) => (ms / 1000) * 20;

    if (!db.HH && db.befJump && db.befWalk && db.jumpTick <= db.walkTick) {
        db.lastTimingTick = TimeDiff(db.jumpTick);
        if (db.jumpTick === db.walkTick && !db.jam) {
            db.jam = true;
            db.lastTiming = (isBackward ? "BW" : "") + "Jam";
        }
        if (db.lastTimingTick > 0 && !db.pessi && !db.jam) {
            db.pessi = true;
            if (db.lastTimingTick <= 100) db.lastTiming = `Max Pessi [${db.lastTimingTick}ms]`;
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

    if (movement.has("Still") && player.isOnGround && !db.befJump) {
        resetMovementStates(db);
    }
}

function resetMovementStates(db: InitialDataType) {
    db.HH = false;
    db.jam = false;
    db.sprint = false;
    db.pessi = false;
    db.walkTick = 0;
    db.jumpTick = 0;
    db.lastTimingTick = 0;
}

function handleOffsetState(db: I, player: Player, pos: Vector3, vel: Vector3, rot: Vector3, isonground: boolean) {
    if (pos.y <= db.lb.y && vel.y <= 0 && pos.y - vel.y > db.lb.y && -Math.abs(pos.x - db.lb.x - 0.5) + 0.8 >= -1 && -Math.abs(pos.z - db.lb.z - 0.5) + 0.8 >= -1 && !db.befLandLB && db.lbon) {
        db.befLandLB = true;
        db.osx = -Math.abs(pos.x - vel.x - db.lb.x - 0.5) + 0.8;
        db.osz = -Math.abs(pos.z - vel.z - db.lb.z - 0.5) + 0.8;
        db.os = Math.sqrt(db.osx ** 2 + db.osz ** 2) * ([db.osx, db.osz].some((os) => os < 0) ? -1 : 1);

        if (db.sendos) print(`§${db.tc1}${db.prefix} §${db.tc2}Offset: ${db.os.toFixed(db.pTF)}`, player);
        if (db.sendosx) print(`§${db.tc1}${db.prefix} §${db.tc2}Offset X: ${db.osx.toFixed(db.pTF)}`, player);
        if (db.sendosz) print(`§${db.tc1}${db.prefix} §${db.tc2}Offset Z: ${db.osz.toFixed(db.pTF)}`, player);
    }

    if (db.lbon && isonground) db.befLandLB = false;

    if (!db.lbon && !player.isOnGround) {
        db.lbon = true;
        db.lb = pos;
    }

    if (player.isOnGround && db.lbon) db.lbon = false;

    if (isonground && !db.befLand) {
        db.befLand = true;
        db.pbx = db.hitx - pos.x;
        db.pbz = db.hitz - pos.z;
        db.pb = Math.sqrt(db.pbx ** 2 + db.pbz ** 2);

        if (db.sendpb) print(`§${db.tc1}${db.prefix} §${db.tc2}Preblock: ${db.pb.toFixed(db.pTF)}`, player);
        if (db.sendpbx) print(`§${db.tc1}${db.prefix} §${db.tc2}Preblock X: ${db.pbx.toFixed(db.pTF)}`, player);
        if (db.sendpbz) print(`§${db.tc1}${db.prefix} §${db.tc2}Preblock Z: ${db.pbz.toFixed(db.pTF)}`, player);
    }
}

function getMovement(player: Player): Set<string> {
    const movement = new Set<string>();
    const vel = player.getVelocity();
    const rot = player.getRotation();

    const forwardVelocity = vel.z * Math.cos(rot.y * (Math.PI / 180)) + vel.x * Math.sin(rot.y * (Math.PI / 180));
    const sidewaysVelocity = vel.x * Math.cos(rot.y * (Math.PI / 180)) - vel.z * Math.sin(rot.y * (Math.PI / 180));

    if (forwardVelocity > 0) movement.add("Forward");
    if (forwardVelocity < 0) movement.add("Backward");
    if (sidewaysVelocity > 0) movement.add("Left");
    if (sidewaysVelocity < 0) movement.add("Right");
    if (forwardVelocity === 0 && sidewaysVelocity === 0) movement.add("Still");

    return movement;
}

function renderPlayerGUI(db: InitialDataType, player: Player) {
    const guiTitle = db.separateGui ? (db.idx === 1 ? "!&" : "&!") : "!&";
    const guiLabels = getGUILabels(db, player);

    player.onScreenDisplay.setTitle(`${guiTitle}§r§f${guiLabels.join("\n")}`);
}

function getGUILabels(db: InitialDataType, player: Player): string[] {
    const labels: string[] = [];

    if (db.showpos) {
        labels.push(`§${db.tc1}X §${db.tc2}${player.location.x.toFixed(db.pTF)} §${db.tc1}Y §${db.tc2}${player.location.y.toFixed(db.pTF)} §${db.tc1}Z §${db.tc2}${player.location.z.toFixed(db.pTF)}`);
    }

    if (db.showpit || db.showfac) {
        labels.push(
            `${db.showpit ? `§${db.tc1}P §${db.tc2}${player.getRotation().x.toFixed(db.rTF)}` : ""}${db.showpit && db.showfac ? " " : ""}${db.showfac ? `§${db.tc1}F §${db.tc2}${player.getRotation().y.toFixed(db.rTF)}` : ""}`
        );
    }

    // Add other labels based on conditions
    // Example: if (db.showja) { labels.push(`§${db.tc1}JA §${db.tc2}${db.ja.toFixed(db.rTF)}`); }

    return labels;
}
