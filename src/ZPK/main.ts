import { world, system, Player } from "@minecraft/server";
import { Database, settingUI, zpkModOn,  } from "@zpk";
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

function updatePlayerState(db: PlayerData, player: Player, pos: Vector3, vel: Vector3, rot: Vector3, isonground: boolean, fullvel: number) {
    if (isonground && !db.befLand) {
        initializeOnGroundState(db, pos, vel, rot);
    }

    if (!isonground) {
        handleInAirState(db);
    }

    handleMovementStates(db, player);
    handleOffsetState(db, player, pos);
}

function initializeOnGroundState(db: PlayerData, pos: Vector3, vel: Vector3, rot: Vector3) {
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

function handleInAirState(db: PlayerData) {
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
    // Handle movement states here
}

function handleOffsetState(db: PlayerData, player: Player, pos: Vector3) {
    // Handle offset state here
}

function renderPlayerGUI(db: PlayerData, player: Player) {
    const guiTitle = db.separateGui ? (db.idx === 1 ? "!&" : "&!") : "!&";
    const guiLabels = getGUILabels(db);

    player.onScreenDisplay.setTitle(`${guiTitle}§r§f${guiLabels.join("\n")}`);
}

function getGUILabels(db: PlayerData): string[] {
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
