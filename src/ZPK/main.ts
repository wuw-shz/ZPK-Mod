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

function resetMovementStates(db: I) {
    db.HH = false;
    db.jam = false;
    db.sprint = false;
    db.pessi = false;
    db.walkTick = 0;
    db.jumpTick = 0;
    db.lastTimingTick = 0;
}

function handleOffsetState(db: InitialDataType, player: Player, pos: Vector3) {
    // Handle offset state here
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
