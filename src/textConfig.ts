export const text = {
    saveCommand: {
        notification: {
            save: (x: number, y: number, z: number, name: string) => `§7[§fSave | Command§7] §aSaved §flocation §7(§f${x}§7, §f${y}§7, §f${z}§7) §fas §7"§r${name}§7"`,
            teleport: (x: number, y: number, z: number, name: string) => `§7[§fSave | Command§7] §dTeleported §fto §7(§f${x}§7, §f${y}§7, §f${z}§7) §fas §7"§r${name}§7"`,
            closeChat: '§7[§fSave | Command§7] §eClose chat to open saves location list.',
            clearAllSaves: '§7[§fSave | Command§7] §bAll saves location cleared',
            wrong: `§7[§fSave | Command§7] §eYou can't use §7\"§fsave§7\" §ecommand while moving or climbing`,
            inPracticeMode: '§7[§fSave | Command§7] §eYou can\'t use §7\"§fsave§7\" §ecommand while in practice mode',
            noSavesLocation: '§7[§fSave | Command§7] §cYou have no saves location!'
        },
        ui: {
            title: 'Saves Location',
            body: 'Select a location to teleport to.',
            savesButton: (name: string, x: number, y: number, z: number) => `${name}\n§8(${x}, ${y}, ${z})`,
            clearAllButton: '§l§8[§cClear all saves§8]',
            clearAllUI: {
                title: 'Are you sure?',
                body: 'This action will clear all saves location.',
                button1: '§l§aNo',
                button2: '§l§cYes',
            }
        }
    },
    practiceMode: {
        notification: {
            enable: '§7[§fPractice mode§7] §aenabled',
            disable: '§7[§fPractice mode§7] §cdisabled',
            wrong: '§7[§fPractice mode§7] §eYou can\'t enable practice mode while moving or climbing',
            checkpointNotFound: '§cCheckpoint not found'
        },
        actionbar: {
            enable: `§eYou're in §7[§l§epractice mode§r§7]`,
            disable: '§cPractice mode disabled'
        },
        item: {
            enable: {
                typeId: 'minecraft:slime_ball',
                nameTag: '§aEnable §fpractice mode\n§7[Hold] to enable practice mode'
            },
            disable: {
                typeId: 'minecraft:magma_cream',
                nameTag: '§cDisable §fpractice mode\n§7[Hold] to disable practice mode'
            },
            returner: {
                typeId: 'minecraft:prismarine_shard',
                nameTag: '§eReturn §fto checkpoint\n§7[Hold] to return to checkpoint'
            }
        }
    },
    coordinate: {
        notification: {
            enable: '§7[§fCoordinate§7] §aenabled',
            disable: '§7[§fCoordinate§7] §cdisabled',
            update: '§7[§fCoordinate§7] §bconfig updated'
        },
        ui: {
            title: 'Coordinate config',
            decimalDigits: {
                label: '§lDecimal Digits',
                slider: {
                    positional: [
                        'positional (x/y/z)',
                        '§7- default: 5',
                        '§7- current'
                    ],
                    rotational: [
                        'rotational (y/p)',
                        '§7- default: 5',
                        '§7- current'
                    ]
                },
            },
            notification: {
                label: '§lNotification',
                toggle: {
                    label: 'status§7: ',
                    on: '§aon',
                    off: '§coff'
                }
            }
        },
        actionbar: {
            disable: '§cCoordinate disabled',
            positional: (x: string, y: string, z: string) => `Pos: ${x} / ${y} / ${z}`,
            rotational: (x: string, y: string) => `Rot(y/p): ${y} / ${x}`,
            interaction: {
                enable: '§o§7[Hold] to enable',
                disable: '§o§7[Hold] to disable',
                config: '§o§7[Hold + Sneak] to config'
            }
        },
        item: {
            coordinator: {
                typeId: 'minecraft:ender_eye',
                nameTag: '§bCoordinator\n§7[Hold] to enable coordinate'
            }
        }
    },
    lobby: {
        notification: {
            teleport: '§7[§fLobby§7] §bTeleported to lobby'
        },
        item: {
            returner: {
                typeId: 'minecraft:nether_star',
                nameTag: '§bReturn §fto lobby\n§7[Hold] to return to lobby'
            }
        }
    }
}