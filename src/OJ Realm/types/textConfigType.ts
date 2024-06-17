export type textConfigType = {
    practiceMode: {
        notification: {
            enable: string,
            disable: string,
            wrong: string,
            checkpointNotFound: string
        },
        actionbar: {
            enable: string,
            disable: string
        },
        item: {
            enable: {
                typeId: string,
                nameTag: string
            },
            disable: {
                typeId: string,
                nameTag: string
            },
            returner: {
                typeId: string,
                nameTag: string
            }
        }
    },
    coordinate: {
        notification: {
            enable: string,
            disable: string,
            update: string
        },
        ui: {
            title: string,
            decimalDigits: {
                label: string,
                slider: {
                    positional: [
                        string,
                        string,
                        string
                    ],
                    rotational: [
                        string,
                        string,
                        string
                    ]
                },
            },
            notification: {
                label: string,
                toggle: {
                    label: string,
                    on: string,
                    off: string
                }
            }
        },
        actionbar: {
            disable: string,
            positional: (x: string, y: string, z: string) => string,
            rotational: (x: string, y: string) => string,
            interaction: {
                enable: string,
                disable: string,
                config: string
            }
        },
        item: {
            coordinator: {
                typeId: string,
                nameTag: string
            }
        }
    },
    lobby: {
        item: {
            returner: {
                typeId: string,
                nameTag: string
            }
        }
    }
}