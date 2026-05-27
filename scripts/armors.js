import { world, system, EquipmentSlot } from "@minecraft/server";

// Utility: check if player is wearing a full set
function isWearingFullSet(player, set) {
    const equipment = player.getComponent("equippable");

    const helmet = equipment.getEquipment(EquipmentSlot.Head)?.typeId;
    const chest = equipment.getEquipment(EquipmentSlot.Chest)?.typeId;
    const legs = equipment.getEquipment(EquipmentSlot.Legs)?.typeId;
    const boots = equipment.getEquipment(EquipmentSlot.Feet)?.typeId;

    return (
        set.helmet.includes(helmet) &&
        set.chest.includes(chest) &&
        set.legs.includes(legs) &&
        set.boots.includes(boots)
    );
}

// Define armor sets
const ARMOR_SETS = {
    kraken: {
        helmet: ["cb:kraken_scales_helmet"],
        chest: ["cb:kraken_scales_chestplate"],
        legs: ["cb:kraken_scales_leggings"],
        boots: [
            "cb:kraken_scales_boots",
            "cb:hooved_kraken_scales_boots"
        ],
        effect: "water_breathing"
    },

    yeti: {
        helmet: ["cb:yeti_fur_helmet"],
        chest: ["cb:yeti_fur_chestplate"],
        legs: ["cb:yeti_fur_leggings"],
        boots: [
            "cb:yeti_fur_boots",
            "cb:hooved_yeti_fur_boots"
        ],
        effect: "resistance"
    }
};

// Main loop
system.runInterval(() => {
    for (const player of world.getPlayers()) {

        let applied = false;

        for (const key in ARMOR_SETS) {
            const set = ARMOR_SETS[key];

            if (isWearingFullSet(player, set)) {
                // Apply effect (short duration, constantly refreshed)
                player.addEffect(set.effect, 40, {
                    amplifier: 0,
                    showParticles: false
                });

                applied = true;
            }
        }

        if (!applied) {
            player.removeEffect("water_breathing");
            player.removeEffect("resistance");
        }
    }
}, 20);