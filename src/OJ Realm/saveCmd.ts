import * as server from '@minecraft/server'
import * as ui from '@minecraft/server-ui'
import { Database, Mode, text } from "@oj-realm";

const isMoving = (pl: server.Player) => {
    const v = pl.getVelocity();
    const speed = Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2);
    return speed >= 0.01;
};
const isClimbing = (pl: server.Player) => {
    return (pl.isClimbing && !pl.isOnGround);
};
const isOnGround = (pl: server.Player) => {
    return pl.isOnGround;
};
server.world.beforeEvents.chatSend.subscribe(data => {
    const msg = data.message
    if (!msg.startsWith('-')) return
    const args = msg.slice(1).split(' ').map(arg => String(arg))
    const sender = data.sender
    const db = new Database(sender)
    if (!args[1]) args[1] = 'Unnamed'
    if (args.length > 2) args[1] = args.slice(1).join(' ')
    switch (args[0]) {
        case 'save': {
            data.cancel = true;
            if (isMoving(sender) || isClimbing(sender) || !isOnGround(sender))
                return sender.sendMessage(text.saveCommand.notification.wrong);
            if (db.get(Mode.practiceData).toggle)
                return sender.sendMessage(text.saveCommand.notification.inPracticeMode);
            const loc = sender.location;
            const rot = sender.getRotation();
            let newName = args[1] || 'Unnamed';
            const saves = db.get(Mode.saves);
            if (saves[newName]) {
                const originalName = newName;
                let i = 0;
                while (saves[newName]) {
                    i++;
                    newName = `${originalName} [${i}]`;
                }
            }
            db.set(Mode.saves, JSON.stringify({ ...saves, [newName]: { location: loc, rotation: rot } }));
            sender.sendMessage(text.saveCommand.notification.save(Math.floor(loc.x), Math.floor(loc.y), Math.floor(loc.z), newName));
            server.system.run(() => {
                sender.teleport({ x: 0.5, y: 50, z: 0.5 }, { rotation: { x: 0, y: 0 } });
            })
            break;
        }
        case 'saves':
            data.cancel = true
            const saves = db.get(Mode.saves)
            if (Object.keys(saves).length === 0) return sender.sendMessage(text.saveCommand.notification.noSavesLocation)
            const uiText = text.saveCommand.ui
            server.system.run(() => {
                sender.sendMessage(text.saveCommand.notification.closeChat)
                const form = new ui.ActionFormData()
                    .title(uiText.title)
                    .body(uiText.body)
                for (const key of Object.keys(saves).sort()) {
                    const values = saves[key]
                    form.button(uiText.savesButton(key, Math.floor(values.location.x), Math.floor(values.location.y), Math.floor(values.location.z)))
                }
                form.button(uiText.clearAllButton);
                (async () => {
                    while (true) {
                        const response = await form.show(sender);
                        if (response.cancelationReason !== ui.FormCancelationReason.UserBusy) {
                            return response;
                        }
                    }
                })().then(res => {
                    const selection = res.selection as number
                    if (selection === undefined) return
                    if (selection === Object.keys(saves).length) {
                        new ui.MessageFormData()
                            .title(uiText.clearAllUI.title)
                            .body(uiText.clearAllUI.body)
                            .button1(uiText.clearAllUI.button1)
                            .button2(uiText.clearAllUI.button2)
                            .show(sender).then(res => {
                                if (res.selection === 0 || res.canceled) return
                                db.clear(Mode.saves)
                                sender.sendMessage(text.saveCommand.notification.clearAllSaves)
                            })
                    } else {
                        const name = Object.keys(saves).sort()[selection]
                        const values = saves[name]
                        server.system.run(() => {
                            sender.teleport(values.location, { dimension: sender.dimension, rotation: values.rotation })
                        })
                        sender.applyDamage
                        sender.sendMessage(text.saveCommand.notification.teleport(Math.floor(values.location.x), Math.floor(values.location.y), Math.floor(values.location.z), name))
                        delete saves[name]
                        db.set(Mode.saves, JSON.stringify(saves))
                    }
                })
            })
            break;
    }
})