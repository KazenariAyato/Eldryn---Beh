import { world, system, ItemStack }
from "@minecraft/server";

/* ======================
FROST DAGGER
====================== */

world.afterEvents.entityHitEntity.subscribe((event) => {
  const attacker = event.damagingEntity;

  if (!attacker || attacker.typeId !== "minecraft:player") return;

  // Check if attacking with frost dagger
  const equip = attacker.getComponent("minecraft:equippable");
if (!equip) return;

const mainhand = equip.getEquipment("Mainhand");

  if (!mainhand || mainhand.typeId !== "cb:frost_dagger") return;

  // 10% chance to apply slowness
  if (Math.random() > 0.1) return;

  const target = event.hitEntity;

  // Apply slowness 255 for 5 seconds (100 ticks)
  target.addEffect("slowness", 100, {
    amplifier: 254, // Slowness 255
    showParticles: true
  });

});

/* ======================
PHOENIX SWORD
====================== */

world.afterEvents.entityHitEntity.subscribe((event) => {
  const attacker = event.damagingEntity;

  if (!attacker || attacker.typeId !== "minecraft:player") return;

  // Check if attacking with phoenix sword
  const equip = attacker.getComponent("minecraft:equippable");
if (!equip) return;

const mainhand = equip.getEquipment("Mainhand");

  if (!mainhand || mainhand.typeId !== "cb:pheonix_blade") return;

  const target = event.hitEntity;

  // Light the enemy on fire for 5 seconds
  target.setOnFire(5);

});

/* ======================
Web Shooter
====================== */

const WEB_PROJECTILE = "cb:webshooter_bullet";

/* ======================
HIT BLOCK
====================== */
world.afterEvents.projectileHitBlock.subscribe((event) => {
    const projectile = event.projectile;
    if (!projectile || projectile.typeId !== WEB_PROJECTILE) return;

    if (projectile.hasTag("used")) return;
    projectile.addTag("used");
    projectile.kill();

    const player = event.source;
    if (!player || player.typeId !== "minecraft:player") return;

    const hitPos = event.location;
    pullPlayerToPoint(player, hitPos);
});

/* ======================
PULL PLAYER
====================== */
function pullPlayerToPoint(player, target) {
    let ticks = 0;
    const maxTicks = 25;

    const interval = system.runInterval(() => {
        try {
            if (ticks > maxTicks) {
                system.clearRun(interval);
                return;
            }

            const pos = player.location;

            let dx = target.x - pos.x;
            let dy = target.y - pos.y;
            let dz = target.z - pos.z;

            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (dist < 1.5) {
                system.clearRun(interval);
                return;
            }

            dx /= dist;
            dy /= dist;
            dz /= dist;

            player.applyKnockback(dx, dz, 1.8, Math.min(0.9, dy + 0.3));

            spawnWebLine(player.location, target);

            ticks++;
        } catch {
            system.clearRun(interval);
        }
    }, 1);
}

/* ======================
VISUAL WEB
====================== */
function spawnWebLine(start, end) {
    const dim = world.getDimension("overworld");
    const steps = 12;

    for (let i = 0; i < steps; i++) {
        const t = i / steps;

        const x = start.x + (end.x - start.x) * t;
        const y = start.y + (end.y - start.y) * t;
        const z = start.z + (end.z - start.z) * t;

        dim.spawnParticle("minecraft:basic_smoke_particle", { x, y, z });
    }
}

/* ======================
GIVE IT BACK!!!
====================== */

// Store cooldowns per player
const cooldowns = new Map();
const COOLDOWN_TICKS = 100; // 5 seconds (20 ticks = 1 sec)

world.afterEvents.itemUse.subscribe((event) => {
    const player = event.source;
    const item = event.itemStack;

    if (!player || item?.typeId !== "cb:webshooter") return;

    const id = player.id;

    // 🛑 Check cooldown
    if (cooldowns.has(id)) {
        const remaining = cooldowns.get(id);

        if (remaining > 0) {
            // Optional feedback
            player.sendMessage(`§cWebshooter cooling down: ${Math.ceil(remaining / 20)}s`);
            return;
        }
    }

    // ✅ Start cooldown
    cooldowns.set(id, COOLDOWN_TICKS);

    // ⏱️ Countdown
    const interval = system.runInterval(() => {
        let time = cooldowns.get(id) - 1;

        if (time <= 0) {
            cooldowns.delete(id);
            system.clearRun(interval);
        } else {
            cooldowns.set(id, time);
        }
    }, 1);

    // 🔁 Re-give item AFTER use (keeps it infinite)
    system.run(() => {
        try {
            const inv = player.getComponent("minecraft:inventory").container;

            let hasItem = false;
            for (let i = 0; i < inv.size; i++) {
                const it = inv.getItem(i);
                if (it?.typeId === "cb:webshooter") {
                    hasItem = true;
                    break;
                }
            }

            if (!hasItem) {
                inv.addItem(new ItemStack("cb:webshooter", 1));
            }

        } catch {}
    });
});