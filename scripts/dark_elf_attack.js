import { world, system } from "@minecraft/server";

const ATTACK_TIME = 8; // ticks animation lasts

const attacking = new Map();

system.runInterval(() => {
    const overworld = world.getDimension("overworld");

    const entities = overworld.getEntities({
        type: "cb:dark_elf_knight"
    });

    const archers = overworld.getEntities({
        type: "cb:dark_elf_archer"
    });

    // KNIGHT
    for (const entity of entities) {
        try {
            const target = entity.target;

            if (!target) {
                stopAttack(entity);
                continue;
            }

            const distance = getDistance(
                entity.location,
                target.location
            );

            // melee range
            if (distance <= 3) {
                startAttack(entity);
            } else {
                stopAttack(entity);
            }
        } catch {}
    }

    // ARCHER
    for (const entity of archers) {
        try {
            const target = entity.target;

            if (!target) {
                stopAttack(entity);
                continue;
            }

            const distance = getDistance(
                entity.location,
                target.location
            );

            // ranged attack range
            if (distance <= 15) {
                startAttack(entity);
            } else {
                stopAttack(entity);
            }
        } catch {}
    }
}, 2);

function startAttack(entity) {
    const id = entity.id;

    if (attacking.has(id)) return;

    attacking.set(id, true);

    entity.setProperty("cb:is_attacking", true);

    system.runTimeout(() => {
        stopAttack(entity);
    }, ATTACK_TIME);
}

function stopAttack(entity) {
    try {
        attacking.delete(entity.id);
        entity.setProperty("cb:is_attacking", false);
    } catch {}
}

function getDistance(pos1, pos2) {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = pos1.z - pos2.z;

    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}