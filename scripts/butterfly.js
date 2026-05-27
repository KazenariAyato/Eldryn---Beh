import { world, system } from "@minecraft/server";

world.afterEvents.worldInitialize.subscribe(() => {
    world.getDimension("overworld").runCommand(
        "gamerule commandblockoutput false"
    );
});

system.runInterval(() => {
    const overworld = world.getDimension("overworld");

    overworld.runCommand(
        "effect @e[type=cb:butterfly] slow_falling 2 0 true"
    );
}, 20);