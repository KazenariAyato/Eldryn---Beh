import { world, system } from "@minecraft/server";

function applyRedOrbAbsorption(player) {
  const offhand = player.getComponent("minecraft:equippable")
    .getEquipment("Offhand");

  // Check if player is holding red_orb
  if (!offhand || offhand.typeId !== "cb:red_orb") {
    return;
  }

  // Get current absorption effect if it exists
  const currentEffect = player.getEffect("absorption");
  let currentAmplifier = currentEffect?.amplifier ?? -1;

  // 5 hearts = 7 absorption levels (amplifier 6)
  const newAmplifier = currentAmplifier + 6;

  // Cap at 255 (Minecraft max)
  const finalAmplifier = Math.min(newAmplifier, 255);

  // Apply absorption effect
  player.addEffect("absorption", 1000, {
    amplifier: finalAmplifier,
    showParticles: false
  });
}

// EVENT 1: When player drinks a potion (effect applied)
world.afterEvents.effectAdd.subscribe((event) => {
  if (event.effect.typeId === "absorption") {
    applyRedOrbAbsorption(event.entity);
  }
});

// EVENT 2: When player respawns/dies
world.afterEvents.playerSpawn.subscribe((event) => {
  const player = event.player;
  system.runTimeout(() => {
    applyRedOrbAbsorption(player);
  }, 5);
});

// EVENT 3: When player picks up/changes items (optional detection)
world.afterEvents.entitySpawn.subscribe((event) => {
  if (event.entity.typeId === "minecraft:player") {
    const player = event.entity;
    system.runTimeout(() => {
      applyRedOrbAbsorption(player);
    }, 10);
  }
});

// EVENT 4: Detect when player changes items in offhand
let lastOffhandItems = new Map();

system.runInterval(() => {
  for (const player of world.getPlayers()) {
    const offhand = player.getComponent("minecraft:equippable")
      .getEquipment("Offhand");
    
    const currentId = offhand?.typeId ?? "empty";
    const lastId = lastOffhandItems.get(player.id) ?? "empty";

    // If offhand item changed
    if (currentId !== lastId) {
      lastOffhandItems.set(player.id, currentId);
      
      // If now holding red_orb
      if (currentId === "cb:red_orb") {
        applyRedOrbAbsorption(player);
      }
    }
  }
}, 10); // Check every 10 ticks (0.5 seconds)