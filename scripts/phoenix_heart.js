import { world, system } from "@minecraft/server";

system.runInterval(() => {

  for (const player of world.getPlayers()) {

    const dimension = player.dimension;

    // Get nearby blocks around player (optimization)
    const radius = 10;

    for (let x = -radius; x <= radius; x++) {
      for (let y = -3; y <= 3; y++) {
        for (let z = -radius; z <= radius; z++) {

          const block = dimension.getBlock({
            x: Math.floor(player.location.x + x),
            y: Math.floor(player.location.y + y),
            z: Math.floor(player.location.z + z)
          });

          if (!block) continue;

          if (block.typeId === "cb:pheonix_heart") {
            const entities = dimension.getEntities({
              location: block.location,
              maxDistance: 5
            });

            for (const entity of entities) {

              entity.addEffect("regeneration", 40, {
                amplifier: 255,
                showParticles: false
              });

            }
          }

        }
      }
    }

  }

}, 20); // every 20 ticks (1 second)