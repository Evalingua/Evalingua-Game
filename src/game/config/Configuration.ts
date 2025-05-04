import { ObjectConfig } from "../objects/Bubble";

export interface FonemaConfig {
    words: ObjectConfig[];
    animal: {
        key: string;
        scale?: number;
        animation: { key: string, frameRate: number, frames: { start: number, end: number }, repeat?: number, yoyo?: boolean }[];
    };
}

export interface MapConfig {
    levelConfig: {
        bg_image: string;
        bg_music: string;
    };
    fonemasConfig: {
        [key: string]: FonemaConfig;
    };
}

export interface ConfigStructure {
    [key: string]: MapConfig;
}

export const Configuration: ConfigStructure = {
    "nasales": {
        levelConfig: {
            bg_image: "bg_jungle",
            bg_music: "nasales-sound",
        },
        fonemasConfig: {
            "m": {
                words: [
                    { name: "mesa", imageKey: "mesa", posicionFonema: "inicial" },
                    { name: "cama", imageKey: "cama", posicionFonema: "medio" }
                ],
                animal: {
                    key: "monkeys",
                    scale: 10,
                    animation: [
                        { key: "idle", frameRate: 5, frames: { start: 0, end: 3 }, repeat: -1 },
                        { key: "stand", frameRate: 7, frames: { start: 8, end: 11 }, repeat: 0 },
                        { key: "doubt", frameRate: 4, frames: { start: 16, end: 20 }, repeat: -1, yoyo: true },
                        { key: "celebrate", frameRate: 5, frames: { start: 24, end: 27 }, repeat: -1 }
                    ]
                }
            },
            "n": {
                words: [
                    { name: "botón", imageKey: "boton", posicionFonema: "final" },
                    { name: "mano", imageKey: "mano", posicionFonema: "medio" },
                    { name: "nariz", imageKey: "nariz", posicionFonema: "inicial" }
                ],
                animal: {
                    key: "monkeys",
                    scale: 10,
                    animation: [
                        { key: "idle", frameRate: 5, frames: { start: 0, end: 3 }, repeat: -1 },
                        { key: "stand", frameRate: 7, frames: { start: 8, end: 11 }, repeat: 0 },
                        { key: "doubt", frameRate: 4, frames: { start: 16, end: 20 }, repeat: -1, yoyo: true },
                        { key: "celebrate", frameRate: 5, frames: { start: 24, end: 27 }, repeat: -1 }
                    ]
                }
            },
            "ñ": {
                words: [
                    { name: "araña", imageKey: "araña", posicionFonema: "medio" },
                    { name: "piña", imageKey: "piña", posicionFonema: "medio" }
                ],
                animal: {
                    key: "monkeys",
                    scale: 10,
                    animation: [
                        { key: "idle", frameRate: 5, frames: { start: 0, end: 3 }, repeat: -1 },
                        { key: "stand", frameRate: 7, frames: { start: 8, end: 11 }, repeat: 0 },
                        { key: "doubt", frameRate: 4, frames: { start: 16, end: 20 }, repeat: -1, yoyo: true },
                        { key: "celebrate", frameRate: 7, frames: { start: 24, end: 27 }, repeat: 2 }
                    ]
                }
            }
        }
    },
    "oclusivas_sordas": {
        levelConfig: {
            bg_image: "bg_jungle",
            bg_music: "nasales-sound",
        },
        fonemasConfig: {
            "p": {
                words: [
                    { name: "pelota", imageKey: "pelota", posicionFonema: "inicial" },
                    { name: "tapa", imageKey: "tapa", posicionFonema: "medio" },
                ],
                animal: {
                    key: "monkeys",
                    animation: [
                        { key: "idle", frameRate: 5, frames: { start: 0, end: 3 }, repeat: -1 },
                        { key: "stand", frameRate: 7, frames: { start: 8, end: 11 }, repeat: 0 },
                        { key: "doubt", frameRate: 4, frames: { start: 16, end: 20 }, repeat: -1, yoyo: true },
                        { key: "celebrate", frameRate: 7, frames: { start: 24, end: 27 }, repeat: 2 }
                    ]
                }
            },
            "t": {
                words: [
                    { name: "taza", imageKey: "taza", posicionFonema: "inicial" },
                    { name: "pato", imageKey: "pato", posicionFonema: "medio" },
                ],
                animal: {
                    key: "monkeys",
                    animation: [
                        { key: "idle", frameRate: 5, frames: { start: 0, end: 3 }, repeat: -1 },
                        { key: "stand", frameRate: 7, frames: { start: 8, end: 11 }, repeat: 0 },
                        { key: "doubt", frameRate: 4, frames: { start: 16, end: 20 }, repeat: -1, yoyo: true },
                        { key: "celebrate", frameRate: 7, frames: { start: 24, end: 27 }, repeat: 2 }
                    ]
                }
            },
            "k": {
                words: [
                    { name: "casa", imageKey: "casa", posicionFonema: "inicial" },
                    { name: "boca", imageKey: "boca", posicionFonema: "medio" },
                ],
                animal: {
                    key: "monkeys",
                    animation: [
                        { key: "idle", frameRate: 5, frames: { start: 0, end: 3 }, repeat: -1 },
                        { key: "stand", frameRate: 7, frames: { start: 8, end: 11 }, repeat: 0 },
                        { key: "doubt", frameRate: 4, frames: { start: 16, end: 20 }, repeat: -1, yoyo: true },
                        { key: "celebrate", frameRate: 7, frames: { start: 24, end: 27 }, repeat: 2 }
                    ]
                }
            }
        }
    },
    "oclusivas_sonoras": {
        levelConfig: {
            bg_image: "bg_jungle",
            bg_music: "nasales-sound",
        },
        fonemasConfig: {
            "b": {
                words: [
                    { name: "vela", imageKey: "vela", posicionFonema: "inicial" },
                    { name: "bebé", imageKey: "bebe", posicionFonema: "medio" },
                ],
                animal: {
                    key: "monkeys",
                    animation: [
                        { key: "idle", frameRate: 5, frames: { start: 0, end: 3 }, repeat: -1 },
                        { key: "stand", frameRate: 7, frames: { start: 8, end: 11 }, repeat: 0 },
                        { key: "doubt", frameRate: 4, frames: { start: 16, end: 20 }, repeat: -1, yoyo: true },
                        { key: "celebrate", frameRate: 7, frames: { start: 24, end: 27 }, repeat: 2 }
                    ]
                }
            },
            "d": {
                words: [
                    { name: "dedo", imageKey: "dedo", posicionFonema: "inicial" },
                    { name: "pared", imageKey: "pared", posicionFonema: "medio" },
                    { name: "codo", imageKey: "codo", posicionFonema: "final" },
                ],
                animal: {
                    key: "monkeys",
                    animation: [
                        { key: "idle", frameRate: 5, frames: { start: 0, end: 3 }, repeat: -1 },
                        { key: "stand", frameRate: 7, frames: { start: 8, end: 11 }, repeat: 0 },
                        { key: "doubt", frameRate: 4, frames: { start: 16, end: 20 }, repeat: -1, yoyo: true },
                        { key: "celebrate", frameRate: 7, frames: { start: 24, end: 27 }, repeat: 2 }
                    ]
                }
            },
            "g": {
                words: [
                    { name: "gato", imageKey: "gato", posicionFonema: "inicial" },
                    { name: "soga", imageKey: "soga", posicionFonema: "medio" }
                ],
                animal: {
                    key: "monkeys",
                    animation: [
                        { key: "idle", frameRate: 5, frames: { start: 0, end: 3 }, repeat: -1 },
                        { key: "stand", frameRate: 7, frames: { start: 8, end: 11 }, repeat: 0 },
                        { key: "doubt", frameRate: 4, frames: { start: 16, end: 20 }, repeat: -1, yoyo: true },
                        { key: "celebrate", frameRate: 7, frames: { start: 24, end: 27 }, repeat: 2 }
                    ]
                }
            }
        }
    },
    "laterales": {
        levelConfig: {
            bg_image: "bg_jungle",
            bg_music: "nasales-sound",
        },
        fonemasConfig: {
            "l": {
                words: [
                    { name: "luna", imageKey: "luna", posicionFonema: "inicial" },
                    { name: "polo", imageKey: "polo", posicionFonema: "medio" },
                    { name: "sol", imageKey: "sol", posicionFonema: "final" },
                    { name: "falda", imageKey: "falda", posicionFonema: "final" }
                ],
                animal: {
                    key: "monkeys",
                    animation: [
                        { key: "idle", frameRate: 5, frames: { start: 0, end: 3 }, repeat: -1 },
                        { key: "stand", frameRate: 7, frames: { start: 8, end: 11 }, repeat: 0 },
                        { key: "doubt", frameRate: 4, frames: { start: 16, end: 20 }, repeat: -1, yoyo: true },
                        { key: "celebrate", frameRate: 7, frames: { start: 24, end: 27 }, repeat: 2 }
                    ]
                }
            },
            "ll": {
                words: [
                    { name: "llave", imageKey: "llave", posicionFonema: "inicial" },
                    { name: "payaso", imageKey: "payaso", posicionFonema: "medio" },
                ],
                animal: {
                    key: "monkeys",
                    animation: [
                        { key: "idle", frameRate: 5, frames: { start: 0, end: 3 }, repeat: -1 },
                        { key: "stand", frameRate: 7, frames: { start: 8, end: 11 }, repeat: 0 },
                        { key: "doubt", frameRate: 4, frames: { start: 16, end: 20 }, repeat: -1, yoyo: true },
                        { key: "celebrate", frameRate: 7, frames: { start: 24, end: 27 }, repeat: 2 }
                    ]
                }
            }
        }
    },
    "fricativas": {
        levelConfig: {
            bg_image: "bg_jungle",
            bg_music: "nasales-sound"
        },
        fonemasConfig: {
            "f": {
                words: [
                    { name: "foco", imageKey: "foco", posicionFonema: "inicial" },
                    { name: "café", imageKey: "cafe", posicionFonema: "medio" },
                ],
                animal: {
                    key: "monkeys",
                    animation: [
                        { key: "idle", frameRate: 5, frames: { start: 0, end: 3 }, repeat: -1 },
                        { key: "stand", frameRate: 7, frames: { start: 8, end: 11 }, repeat: 0 },
                        { key: "doubt", frameRate: 4, frames: { start: 16, end: 20 }, repeat: -1, yoyo: true },
                        { key: "celebrate", frameRate: 7, frames: { start: 24, end: 27 }, repeat: 2 }
                    ]
                }
            },
            "s": {
                words: [
                    { name: "zapato", imageKey: "zapato", posicionFonema: "inicial" },
                    { name: "vaso", imageKey: "vaso", posicionFonema: "medio" },
                    { name: "lápiz", imageKey: "lapiz", posicionFonema: "final" },
                ],
                animal: {
                    key: "monkeys",
                    animation: [
                        { key: "idle", frameRate: 5, frames: { start: 0, end: 3 }, repeat: -1 },
                        { key: "stand", frameRate: 7, frames: { start: 8, end: 11 }, repeat: 0 },
                        { key: "doubt", frameRate: 4, frames: { start: 16, end: 20 }, repeat: -1, yoyo: true },
                        { key: "celebrate", frameRate: 7, frames: { start: 24, end: 27 }, repeat: 2 }
                    ]
                }
            },
            "j": {
                words: [
                    { name: "jabón", imageKey: "jabon", posicionFonema: "inicial" },
                    { name: "ojo", imageKey: "ojo", posicionFonema: "medio" },
                    { name: "reloj", imageKey: "reloj", posicionFonema: "final" },
                ],
                animal: {
                    key: "monkeys",
                    animation: [
                        { key: "idle", frameRate: 5, frames: { start: 0, end: 3 }, repeat: -1 },
                        { key: "stand", frameRate: 7, frames: { start: 8, end: 11 }, repeat: 0 },
                        { key: "doubt", frameRate: 4, frames: { start: 16, end: 20 }, repeat: -1, yoyo: true },
                        { key: "celebrate", frameRate: 7, frames: { start: 24, end: 27 }, repeat: 2 }
                    ]
                }
            }
        }
    },
    "africadas": {
        levelConfig: {
            bg_image: "bg_jungle",
            bg_music: "nasales-sound"
        },
        fonemasConfig: {
            "ch": {
                words: [
                    { name: "chancho", imageKey: "chancho", posicionFonema: "inicial" }
                ],
                animal: {
                    key: "monkeys",
                    animation: [
                        { key: "idle", frameRate: 5, frames: { start: 0, end: 3 }, repeat: -1 },
                        { key: "stand", frameRate: 7, frames: { start: 8, end: 11 }, repeat: 0 },
                        { key: "doubt", frameRate: 4, frames: { start: 16, end: 20 }, repeat: -1, yoyo: true },
                        { key: "celebrate", frameRate: 7, frames: { start: 24, end: 27 }, repeat: 2 }
                    ]
                }
            }
        }
    },
    "roticas_percusivas": {
        levelConfig: {
            bg_image: "bg_jungle",
            bg_music: "nasales-sound"
        },
        fonemasConfig: {
            "r": {
                words: [
                    { name: "arete", imageKey: "arete", posicionFonema: "inicial" },
                    { name: "torta", imageKey: "torta", posicionFonema: "medio" },
                    { name: "collar", imageKey: "collar", posicionFonema: "final" }
                ],
                animal: {
                    key: "monkeys",
                    animation: [
                        { key: "idle", frameRate: 5, frames: { start: 0, end: 3 }, repeat: -1 },
                        { key: "stand", frameRate: 7, frames: { start: 8, end: 11 }, repeat: 0 },
                        { key: "doubt", frameRate: 4, frames: { start: 16, end: 20 }, repeat: -1, yoyo: true },
                        { key: "celebrate", frameRate: 7, frames: { start: 24, end: 27 }, repeat: 2 }
                    ]
                }
            }
        }
    },
    "roticas_vibrantes": {
        levelConfig: {
            bg_image: "bg_jungle",
            bg_music: "nasales-sound"
        },
        fonemasConfig: {
            "rr": {
                words: [
                    { name: "ratón", imageKey: "raton", posicionFonema: "inicial" },
                    { name: "perro", imageKey: "perro", posicionFonema: "medio" }
                ],
                animal: {
                    key: "monkeys",
                    animation: [
                        { key: "idle", frameRate: 5, frames: { start: 0, end: 3 }, repeat: -1 },
                        { key: "stand", frameRate: 7, frames: { start: 8, end: 11 }, repeat: 0 },
                        { key: "doubt", frameRate: 4, frames: { start: 16, end: 20 }, repeat: -1, yoyo: true },
                        { key: "celebrate", frameRate: 7, frames: { start: 24, end: 27 }, repeat: 2 }
                    ]
                }
            }
        }
    },
    /*     "grupos_consonanticos_laterales": {
            levelConfig: {
                bg_image: "bg_jungle",
                bg_music: "nasales-sound"
            },
            fonemasConfig: {
                "bl": {
                    words: [
                        { name: "blusa", imageKey: "blusa", posicionFonema: "inicial" }
                    ],
                    animal: {
                        key: "oso",
                        animation: [
                            { key: "idle", frameRate: 5, frames: { start: 0, end: 3 }, repeat: -1},
                            { key: "stand", frameRate: 7, frames: { start: 8, end: 11 }, repeat: 0 },
                            { key: "doubt", frameRate: 4, frames: { start: 16, end: 20 }, repeat: -1, yoyo: true },
                            { key: "celebrate", frameRate: 7, frames: { start: 24, end: 27 }, repeat: 2 }
                        ]
                    }
                },
                "pl": {
                    words: [
                        { name: "plato", imageKey: "plato", posicionFonema: "inicial" }
                    ],
                    animal: {
                        key: "puma",
                        animation: [
                            { key: "idle", frameRate: 5, frames: { start: 0, end: 3 }, repeat: -1},
                            { key: "stand", frameRate: 7, frames: { start: 8, end: 11 }, repeat: 0 },
                            { key: "doubt", frameRate: 4, frames: { start: 16, end: 20 }, repeat: -1, yoyo: true },
                            { key: "celebrate", frameRate: 7, frames: { start: 24, end: 27 }, repeat: 2 }
                        ]
                    }
                },
                "fl": {
                    words: [
                        { name: "flor", imageKey: "flor", posicionFonema: "inicial" }
                    ],
                    animal: {
                        key: "oso",
                        animation: [
                            { key: "idle", frameRate: 5, frames: { start: 0, end: 3 }, repeat: -1},
                            { key: "stand", frameRate: 7, frames: { start: 8, end: 11 }, repeat: 0 },
                            { key: "doubt", frameRate: 4, frames: { start: 16, end: 20 }, repeat: -1, yoyo: true },
                            { key: "celebrate", frameRate: 7, frames: { start: 24, end: 27 }, repeat: 2 }
                        ]
                    }
                },
                "cl": {
                    words: [
                        { name: "clavo", imageKey: "clavo", posicionFonema: "inicial" }
                    ],
                    animal: {
                        key: "cocodrilo",
                        animation: [
                            { key: "idle", frameRate: 5, frames: { start: 0, end: 3 }, repeat: -1},
                            { key: "stand", frameRate: 7, frames: { start: 8, end: 11 }, repeat: 0 },
                            { key: "doubt", frameRate: 4, frames: { start: 16, end: 20 }, repeat: -1, yoyo: true },
                            { key: "celebrate", frameRate: 7, frames: { start: 24, end: 27 }, repeat: 2 }
                        ]
                    }
                },
                "gl": {
                    words: [
                        { name: "globo", imageKey: "globo", posicionFonema: "inicial" }
                    ],
                    animal: {
                        key: "gorila",
                        animation: [
                            { key: "idle", frameRate: 5, frames: { start: 0, end: 3 }, repeat: -1},
                            { key: "stand", frameRate: 7, frames: { start: 8, end: 11 }, repeat: 0 },
                            { key: "doubt", frameRate: 4, frames: { start: 16, end: 20 }, repeat: -1, yoyo: true },
                            { key: "celebrate", frameRate: 7, frames: { start: 24, end: 27 }, repeat: 2 }
                        ]
                    }
                }
            }
        },
        "grupos_consonanticos_centrales": {
            levelConfig: {
                bg_image: "bg_jungle",
                bg_music: "nasales-sound"
            },
            fonemasConfig: {
                "br": {
                    words: [
                        { name: "libro", imageKey: "libro", posicionFonema: "medio" },
                    ],
                    animal: {
                        key: "burro",
                        animation: [
                            { key: "idle", frameRate: 5, frames: { start: 0, end: 3 }, repeat: -1},
                            { key: "stand", frameRate: 7, frames: { start: 8, end: 11 }, repeat: 0 },
                            { key: "doubt", frameRate: 4, frames: { start: 16, end: 20 }, repeat: -1, yoyo: true },
                            { key: "celebrate", frameRate: 7, frames: { start: 24, end: 27 }, repeat: 2 }
                        ]
                    }
                },
                "pr": {
                    words: [
                        { name: "princesa", imageKey: "princesa", posicionFonema: "inicial" },
                    ],
                    animal: {
                        key: "puma",
                        animation: [
                            { key: "idle", frameRate: 5, frames: { start: 0, end: 3 }, repeat: -1},
                            { key: "stand", frameRate: 7, frames: { start: 8, end: 11 }, repeat: 0 },
                            { key: "doubt", frameRate: 4, frames: { start: 16, end: 20 }, repeat: -1, yoyo: true },
                            { key: "celebrate", frameRate: 7, frames: { start: 24, end: 27 }, repeat: 2 }
                        ]
                    }
                },
                "fr": {
                    words: [
                        { name: "fresa", imageKey: "fresa", posicionFonema: "inicial" },
                    ],
                    animal: {
                        key: "flamenco",
                        animation: [
                            { key: "idle", frameRate: 5, frames: { start: 0, end: 3 }, repeat: -1},
                            { key: "stand", frameRate: 7, frames: { start: 8, end: 11 }, repeat: 0 },
                            { key: "doubt", frameRate: 4, frames: { start: 16, end: 20 }, repeat: -1, yoyo: true },
                            { key: "celebrate", frameRate: 7, frames: { start: 24, end: 27 }, repeat: 2 }
                        ]
                    }
                },
                "cr": {
                    words: [
                        { name: "cruz", imageKey: "cruz", posicionFonema: "inicial" },
                    ],
                    animal: {
                        key: "cocodrilo",
                        animation: [
                            { key: "idle", frameRate: 5, frames: { start: 0, end: 3 }, repeat: -1},
                            { key: "stand", frameRate: 7, frames: { start: 8, end: 11 }, repeat: 0 },
                            { key: "doubt", frameRate: 4, frames: { start: 16, end: 20 }, repeat: -1, yoyo: true },
                            { key: "celebrate", frameRate: 7, frames: { start: 24, end: 27 }, repeat: 2 }
                        ]
                    }
                },
                "gr": {
                    words: [
                        { name: "tigre", imageKey: "tigre", posicionFonema: "inicial" }
                    ],
                    animal: {
                        key: "gato",
                        animation: [
                            { key: "idle", frameRate: 5, frames: { start: 0, end: 3 }, repeat: -1},
                            { key: "stand", frameRate: 7, frames: { start: 8, end: 11 }, repeat: 0 },
                            { key: "doubt", frameRate: 4, frames: { start: 16, end: 20 }, repeat: -1, yoyo: true },
                            { key: "celebrate", frameRate: 7, frames: { start: 24, end: 27 }, repeat: 2 }
                        ]
                    }
                },
                "tr": {
                    words: [
                        { name: "tren", imageKey: "tren", posicionFonema: "inicial" },
                    ],
                    animal: {
                        key: "tigre",
                        animation: [
                            { key: "idle", frameRate: 5, frames: { start: 0, end: 3 }, repeat: -1},
                            { key: "stand", frameRate: 7, frames: { start: 8, end: 11 }, repeat: 0 },
                            { key: "doubt", frameRate: 4, frames: { start: 16, end: 20 }, repeat: -1, yoyo: true },
                            { key: "celebrate", frameRate: 7, frames: { start: 24, end: 27 }, repeat: 2 }
                        ]
                    }
                },
                "dr": {
                    words: [
                        { name: "cocodrilo", imageKey: "cocodrilo", posicionFonema: "inicial" },
                    ],
                    animal: {
                        key: "cocodrilo",
                        animation: [
                            { key: "idle", frameRate: 5, frames: { start: 0, end: 3 }, repeat: -1},
                            { key: "stand", frameRate: 7, frames: { start: 8, end: 11 }, repeat: 0 },
                            { key: "doubt", frameRate: 4, frames: { start: 16, end: 20 }, repeat: -1, yoyo: true },
                            { key: "celebrate", frameRate: 7, frames: { start: 24, end: 27 }, repeat: 2 }
                        ]
                    }
                }
            }
        }, */
    "diptongos": {
        levelConfig: {
            bg_image: "bg_jungle",
            bg_music: "nasales-sound"
        },
        fonemasConfig: {
            "ua": {
                words: [
                    { name: "guantes", imageKey: "guantes", posicionFonema: "inicial" }
                ],
                animal: {
                    key: "monkeys",
                    animation: [
                        { key: "idle", frameRate: 5, frames: { start: 0, end: 3 }, repeat: -1 },
                        { key: "stand", frameRate: 7, frames: { start: 8, end: 11 }, repeat: 0 },
                        { key: "doubt", frameRate: 4, frames: { start: 16, end: 20 }, repeat: -1, yoyo: true },
                        { key: "celebrate", frameRate: 7, frames: { start: 24, end: 27 }, repeat: 2 }
                    ]
                }
            },
            "ue": {
                words: [
                    { name: "huevo", imageKey: "huevo", posicionFonema: "inicial" }
                ],
                animal: {
                    key: "monkeys",
                    animation: [
                        { key: "idle", frameRate: 5, frames: { start: 0, end: 3 }, repeat: -1 },
                        { key: "stand", frameRate: 7, frames: { start: 8, end: 11 }, repeat: 0 },
                        { key: "doubt", frameRate: 4, frames: { start: 16, end: 20 }, repeat: -1, yoyo: true },
                        { key: "celebrate", frameRate: 7, frames: { start: 24, end: 27 }, repeat: 2 }
                    ]
                }
            },
            "ie": {
                words: [
                    { name: "pie", imageKey: "pie", posicionFonema: "inicial" },
                ],
                animal: {
                    key: "monkeys",
                    animation: [
                        { key: "idle", frameRate: 5, frames: { start: 0, end: 3 }, repeat: -1 },
                        { key: "stand", frameRate: 7, frames: { start: 8, end: 11 }, repeat: 0 },
                        { key: "doubt", frameRate: 4, frames: { start: 16, end: 20 }, repeat: -1, yoyo: true },
                        { key: "celebrate", frameRate: 7, frames: { start: 24, end: 27 }, repeat: 2 }
                    ]
                }
            },
            "au": {
                words: [
                    { name: "jaula", imageKey: "jaula", posicionFonema: "inicial" },
                ],
                animal: {
                    key: "monkeys",
                    animation: [
                        { key: "idle", frameRate: 5, frames: { start: 0, end: 3 }, repeat: -1 },
                        { key: "stand", frameRate: 7, frames: { start: 8, end: 11 }, repeat: 0 },
                        { key: "doubt", frameRate: 4, frames: { start: 16, end: 20 }, repeat: -1, yoyo: true },
                        { key: "celebrate", frameRate: 7, frames: { start: 24, end: 27 }, repeat: 2 }
                    ]
                }
            },
            "ei": {
                words: [
                    { name: "peine", imageKey: "peine", posicionFonema: "inicial" },
                ],
                animal: {
                    key: "monkeys",
                    animation: [
                        { key: "idle", frameRate: 5, frames: { start: 0, end: 3 }, repeat: -1 },
                        { key: "stand", frameRate: 7, frames: { start: 8, end: 11 }, repeat: 0 },
                        { key: "doubt", frameRate: 4, frames: { start: 16, end: 20 }, repeat: -1, yoyo: true },
                        { key: "celebrate", frameRate: 7, frames: { start: 24, end: 27 }, repeat: 2 }
                    ]
                }
            },
            "eo": {
                words: [
                    { name: "león", imageKey: "leon", posicionFonema: "inicial" },
                ],
                animal: {
                    key: "monkeys",
                    animation: [
                        { key: "idle", frameRate: 5, frames: { start: 0, end: 3 }, repeat: -1 },
                        { key: "stand", frameRate: 7, frames: { start: 8, end: 11 }, repeat: 0 },
                        { key: "doubt", frameRate: 4, frames: { start: 16, end: 20 }, repeat: -1, yoyo: true },
                        { key: "celebrate", frameRate: 7, frames: { start: 24, end: 27 }, repeat: 2 }
                    ]
                }
            }
        }
    }
}