

export const store_items: {[name: string]: {[name2: string]: any}} = {
    balls: {
        "square-write": {
            shape: "square",
            description: "The classic!",
            price: 10,
            color: "#fff",
        },
        "square-red": {
            shape: "square",
            description: "Just a simple red square",
            price: 10,
            color: "var(--error)",
        },
        "square-primary": {
            shape: "square",
            description: "The squared transcendence",
            price: 20,
            color: "var(--primary)",
        },
        "impossible-square": {
            shape: "square",
            description: "Just a black square. It's hard when you play on a black field.",
            price: 50,
            color: "#000",
        },
    },

    pads: {
        "classic-write": {
            description: "The classic!",
            price: 10,
            color: "#fff",
            type: "classic",
        },
        "classic-red": {
            description: "A red pad, nothing more.",
            price: 10,
            color: "var(--error)",
            type: "classic",
        },
        "classic-primary": {
            description: "The transcendence pad, a pad that will transcend you.",
            price: 20,
            color: "var(--primary)",
            type: "classic",
        },
        "classic-impossible": {
            description: "A black pad, on a black field. No problem for me.",
            price: 50,
            color: "#000",
            type: "classic",
        },
        "dotted-write": {
            description: "A dotted pad, but still classic.",
            price: 100,
            color: "#fff",
            type: "dotted",
        },
        "dotted-red": {
            description: "A red dotted pad.",
            price: 100,
            color: "var(--error)",
            type: "dotted",
        },
        "change-rainbow": {
            description: "A color changing pad!",
            price: 500,
            color: "rainbow",
            type: "change",
        },
        "classic-invisible": {
            description: "An invisible pad for your opponent but a classic one for you!",
            price: 5000,
            color: "invisible",
            type: "classic",
        },
    },
}