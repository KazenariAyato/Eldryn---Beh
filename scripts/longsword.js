import { world, system, EquipmentSlot } from "@minecraft/server";

/* =========================
   CONFIG
========================= */

const LONGSWORDS = new Set([
    "cb:wooden_longsword",
    "cb:stone_longsword",
    "cb:iron_longsword",
    "cb:copper_longsword",
    "cb:gold_longsword",
    "cb:silver_longsword",
    "cb:steel_longsword",
    "cb:diamond_longsword",
    "cb:netherite_longsword",
    "cb:vibranium_longsword",
    "cb:adamantium_longsword"
]);

const COOLDOWN_TICKS = 20; // 1 second
const MESSAGE_THROTTLE = 10; // 0.5 seconds

/* =========================
   STORAGE
========================= */

const cooldowns = new Map();
const messageCooldowns = new Map();

/* =========================
   MAIN SYSTEM
========================= */

world.afterEvents.entityHitEntity.subscribe((event) => {
    const player = event.damagingEntity;
    const target = event.hitEntity;

    if (!player || player.typeId !== "minecraft:player") return;
    if (!target) return;

    const equippable = player.getComponent("minecraft:equippable");
    if (!equippable) return;

    const item = equippable.getEquipment(EquipmentSlot.Mainhand);
    if (!item) return;

    if (!LONGSWORDS.has(item.typeId)) return;

    const id = player.id;
    const now = system.currentTick;

    const lastHit = cooldowns.get(id) ?? 0;
    const remaining = COOLDOWN_TICKS - (now - lastHit);

    /* ===== IF STILL ON COOLDOWN ===== */
    if (remaining > 0) {
        const lastMsg = messageCooldowns.get(id) ?? 0;

        if (now - lastMsg >= MESSAGE_THROTTLE) {
            const seconds = (remaining / 20).toFixed(1);

            try {
                player.sendMessage(`§cYou can't attack while in cooldown! §7(${seconds}s)`);
            } catch {}

            messageCooldowns.set(id, now);
        }

        return;
    }

    /* ===== APPLY COOLDOWN ===== */
    cooldowns.set(id, now);

    try {
        player.addEffect("minecraft:weakness", COOLDOWN_TICKS, {
            amplifier: 255,
            showParticles: false
        });
    } catch {}
});