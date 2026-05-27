import { world, system, Player, ItemStack } from "@minecraft/server";
import { ModalFormData, ActionFormData } from "@minecraft/server-ui";

const STAT_KEYS = {
  spent: "stat_spent",
  points: "stat_points",
  health: "stat_health",
  total: "stat_total",
  strength: "stat_strength",
  defense: "stat_defense",
  mana: "stat_mana"
};

const MAX_TOTAL_STATS = 100;
const MAX_MANA_STATS = 50;
function getStat(player, key) {
  return player.getDynamicProperty(key) ?? 0;
}

const LEVEL_KEY = "player_level";
const MAX_LEVEL = 50;

function getLevel(player) {
  return player.getDynamicProperty(LEVEL_KEY) ?? 1;
}

function setLevel(player, level) {
  player.setDynamicProperty(LEVEL_KEY, Math.min(level, MAX_LEVEL));
}
function setStat(player, key, value) {
  player.setDynamicProperty(key, Math.max(0, value));
}

function getTotalStats(player) {
  return getStat(player, STAT_KEYS.total);
}

function countDiamonds(player) {
  const inv = player.getComponent("inventory").container;
  let total = 0;

  for (let i = 0; i < inv.size; i++) {
    const item = inv.getItem(i);
    if (item?.typeId === "minecraft:diamond") {
      total += item.amount;
    }
  }
  return total;
}

function removeDiamonds(player, amount) {
  player.runCommandAsync(`clear @s minecraft:diamond 0 ${amount}`);
}

world.afterEvents.playerSpawn.subscribe(({ player }) => {
  system.runTimeout(() => {
    if (!player.isValid()) return;
    applyStatEffects(player);
  }, 20);
});

// =================================================================
//  KITS DATABASE
// =================================================================
// Define all your kits here. This is the only section you'll
// NEED TO EDIT to add new kits.
// =================================================================

const KITS_DATABASE = {
    "starter_kit": {
        id: "starter_kit",
        title: "The Starter Kit",
        description: "A few basic tools and food to get you started.",
        cooldownHours: 0,
        items: [
            { id: 'minecraft:stone_pickaxe', amount: 1 },
            { id: 'minecraft:stone_axe', amount: 1 },
            { id: 'minecraft:iron_ingot', amount: 3 },
            { id: 'minecraft:bread', amount: 16 }
        ]
    },
    "common_kit": {
        id: "common_kit",
        title: "The Common Kit",
        description: "Kit With Basic Items To Help You Out.",
        cooldownHours: 6,
        items: [
            { id: 'minecraft:oak_log', amount: 24 },
            { id: 'minecraft:leather', amount: 16 },
            { id: 'minecraft:iron_ingot', amount: 4 },
            { id: 'minecraft:bread', amount: 16 }
        ]
    },
    "rare_kit": {
        id: "rare_kit",
        title: "The Rare Kit",
        description: "Kit With Viable Items To Help You Out.",
        cooldownHours: 12,
        requiredRank: "rank_rare",
        items: [
            { id: 'minecraft:oak_log', amount: 40 },
            { id: 'minecraft:gold_ingot', amount: 16 },
            { id: 'minecraft:iron_ingot', amount: 24 },
            { id: 'minecraft:diamond', amount: 1 }
        ]
    },
    "epic_kit": {
        id: "epic_kit",
        title: "The Epic Kit",
        description: "Kit With Epic Items To Help You Out.",
        cooldownHours: 18,
        requiredRank: "rank_epic",
        items: [
            { id: 'minecraft:golden_apple', amount: 3 },
            { id: 'minecraft:gold_ingot', amount: 40 },
            { id: 'minecraft:iron_ingot', amount: 64 },
            { id: 'minecraft:diamond', amount: 8 },
            { id: 'minecraft:pumpkin_pie', amount: 40 }
        ]
    },
    "legendary_kit": {
        id: "legendary_kit",
        title: "The Legendary Kit",
        description: "Kit With Legendary Items To Help You Out.",
        cooldownHours: 24,
        requiredRank: "rank_legendary",
        items: [
            { id: 'minecraft:diamond', amount: 40 },
            { id: 'minecraft:gold_ingot', amount: 96 },
            { id: 'minecraft:iron_ingot', amount: 128 },
            { id: 'minecraft:enchanted_golden_apple', amount: 1 },
            { id: 'minecraft:golden_apple', amount: 8 },
            { id: 'minecraft:golden_carrot', amount: 40 }
        ]
    },
    // To add your next kit, copy the "starter_kit" block,
    // paste it here, and change the details.
    // "warrior_kit": { id: "warrior_kit", title: "...", items: [...] }
};

// =================================================================
//  CORE KITS SYSTEM - You don't need to edit below this line
// =================================================================

/**

 * @param {Player} player
 * @returns {object} object where keys are kit IDs and values are true if claimed.
 */
function getPlayerKitState(player) {
    const stateJSON = player.getDynamicProperty("kitState_v1");
    try {
        if (stateJSON) return JSON.parse(stateJSON);
    } catch (e) {
        console.error(`Failed to parse kit state for ${player.name}:`, e);
    }
    return {};
}

/**
 * @param {Player} player
 * @param {object} state
 */
function setPlayerKitState(player, state) {
    player.setDynamicProperty("kitState_v1", JSON.stringify(state));
}

/**
 * The main UI for claiming kits.
 * @param {Player} player
 */
export async function openKitsUI(player) {
    const state = getPlayerKitState(player);
    const form = new ActionFormData()
        .title("Kits")
        .body("Select a kit to claim. Locked kits require higher ranks.");

    const availableKits = Object.values(KITS_DATABASE);
    const now = Date.now();

    for (const kit of availableKits) {
        const lastClaim = state[kit.id];
        const hours = kit.cooldownHours ?? 0;
        const cooldown = hours * 60 * 60 * 1000;

        let buttonText = `§a${kit.title}`;
        let icon = "textures/blocks/gold_block";

        // --- Rank restriction check ---
        if (kit.requiredRank && !player.hasTag(kit.requiredRank)) {
            buttonText = `§7${kit.title} §8(Locked - ${kit.requiredRank.replace("rank_", "").toUpperCase()} only)`;
            icon = "textures/blocks/barrier";
            form.button(buttonText, icon);
            continue; // skip cooldown checks for locked kits
        }

        // --- Cooldown / availability ---
        if (lastClaim) {
            const elapsed = now - lastClaim;
            if (hours === 0) {
                buttonText = `§7${kit.title} §c(Permanently Claimed)`;
                icon = "textures/blocks/redstone_block";
            } else if (elapsed < cooldown) {
                const remaining = cooldown - elapsed;
                const hrs = Math.floor(remaining / (1000 * 60 * 60));
                const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
                buttonText = `§7${kit.title} §c(${hrs}h ${mins}m left)`;
                icon = "textures/blocks/redstone_block";
            } else {
                buttonText = `§a${kit.title} §e(Ready!)`;
                icon = "textures/blocks/emerald_block";
            }
        }

        form.button(buttonText, icon);
    }

    const response = await form.show(player);
    if (response.canceled) return;

    const selectedKit = availableKits[response.selection];
    if (!selectedKit) return;

    // --- Check rank again before claiming ---
    if (selectedKit.requiredRank && !player.hasTag(selectedKit.requiredRank)) {
        player.sendMessage(`§cYou must have the ${selectedKit.requiredRank.replace("rank_", "").toUpperCase()} rank to claim this kit.`);
        return;
    }

    claimKit(player, selectedKit.id);
}

/**
 * @param {Player} player
 * @param {string} kitId
 */
function claimKit(player, kitId) {
    const kit = KITS_DATABASE[kitId];
    if (!kit) {
        player.sendMessage("§cError: That kit does not exist.");
        return;
    }

    const state = getPlayerKitState(player);
    const now = Date.now();
    const hours = kit.cooldownHours ?? 0;
    const cooldown = hours * 60 * 60 * 1000;
    const lastClaim = state[kitId];

    if (lastClaim) {
        const elapsed = now - lastClaim;
        if (hours === 0) {
            // One-time kit
            player.sendMessage(`§cYou can only claim "${kit.title}" once.`);
            return;
        }
        if (elapsed < cooldown) {
            // Cooldown not finished
            const remaining = cooldown - elapsed;
            const hrs = Math.floor(remaining / (1000 * 60 * 60));
            const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            player.sendMessage(`§cYou can claim "${kit.title}" again in ${hrs}h ${mins}m.`);
            return;
        }
    }

    // ✅ Claim items
    player.sendMessage(`§aYou have claimed "${kit.title}"! You received:`);
    for (const itemInfo of kit.items) {
        try {
            const item = new ItemStack(itemInfo.id, itemInfo.amount);
            player.getComponent('inventory').container.addItem(item);
            player.sendMessage(`- ${itemInfo.amount}x ${itemInfo.id.replace('minecraft:', '')}`);
        } catch (err) {
            console.error(`Failed to give ${itemInfo.id} to ${player.name}:`, err);
            player.sendMessage(`§cError giving you ${itemInfo.id}.`);
        }
    }

    // ✅ Update last claim time
    state[kitId] = now;
    setPlayerKitState(player, state);

    world.getDimension(player.dimension.id)
        .runCommandAsync(`playsound random.orb @a[name="${player.name}"]`);

    // Refresh the UI
    system.run(() => openKitsUI(player));
}
export async function openStatisticsUI(player) {
  const form = new ActionFormData()
    .title("Statistics")
    .body("Spend stat points to enhance your character.");

  form.button(
    `Health (§c${getStat(player, STAT_KEYS.health)})`,
    "textures/items/nether_star"
  );
  form.button(
    `Strength (§6${getStat(player, STAT_KEYS.strength)})`,
    "textures/items/iron_sword"
  );
  form.button(
    `Defense (§e${getStat(player, STAT_KEYS.defense)})`,
    "textures/items/diamond_chestplate"
  );
  form.button(
    `Mana (§b${getStat(player, STAT_KEYS.mana)})`,
    "textures/items/ender_pearl"
  );
  const level = getLevel(player);
form.button(
  level >= MAX_LEVEL
    ? `§6Current Level §e(MAX)`
    : `Current Level (Lv. ${level}/50)`,
  "textures/items/experience_bottle"
  );
form.button(
    "§cReset Stats (§e3 Diamonds§c)",
    "textures/blocks/barrier"
  );
  const res = await form.show(player);
  if (res.canceled) return;

  switch (res.selection) {
  case 0:
    openStatAllocateUI(player, STAT_KEYS.health);
    break;

  case 1:
    openStatAllocateUI(player, STAT_KEYS.strength);
    break;

  case 2:
    openStatAllocateUI(player, STAT_KEYS.defense);
    break;

  case 3:
    openStatAllocateUI(player, STAT_KEYS.mana);
    break;

  case 4:
  openLevelUI(player);
  break;

case 5:
  openStatResetConfirmUI(player);
  break;
  }
}
async function openLevelUI(player) {
  const level = getLevel(player);

  // MAX LEVEL UI
  if (level >= MAX_LEVEL) {
    const form = new ActionFormData()
      .title("Level")
      .body(`§aCurrent Level: §e${level}\n\n§cYou are already at max level.`)
      .button("Close", "textures/blocks/barrier");

    await form.show(player);
    return;
  }

  const requiredXP = level;

  const form = new ActionFormData()
    .title("Level Up")
    .body(
      `§aCurrent Level: §e${level}\n` +
      `§bXP Required: §e${requiredXP} Levels\n\n` +
      `§7Each level gives §a+2 Stat Points`
    )
    .button("§aLevel Up")
    .button("§cCancel");

  const res = await form.show(player);
if (res.canceled) return;
if (res.selection !== 0) {
  openStatisticsUI(player);
  return;
}

  // XP CHECK
  if (player.level < requiredXP) {
    player.sendMessage("§cYou don't have enough experience levels to level up.");
    return;
  }
  //Ensure Stats Doesn't bug

if (getStat(player, STAT_KEYS.points) + getTotalStats(player) >= MAX_TOTAL_STATS) {
  player.sendMessage("§cYou already have the maximum number of stat points.");
  return;
}
  // APPLY LEVEL UP
  player.addLevels(-requiredXP);
  setLevel(player, level + 1);

  setStat(
    player,
    STAT_KEYS.points,
    getStat(player, STAT_KEYS.points) + 2
  );

  player.sendMessage("§aLeveling successful! You gained §e2 stat points.");
  player.runCommandAsync("playsound random.levelup @s");
}
// ===============================
// STAT RESET CONFIRMATION UI
// ===============================
async function openStatResetConfirmUI(player) {
  const form = new ActionFormData()
    .title("§cReset Stats")
    .body(
      "Are you sure you want to reset all stats?\n\n" +
      "§7• Health\n" +
      "§7• Strength\n" +
      "§7• Defense\n" +
      "§7• Mana\n\n" +
      "§cCost: §e3 Diamonds"
    );

  form.button("§aYes, Reset Stats");
  form.button("§cNo, Go Back");

  const res = await form.show(player);
  if (res.canceled) {
    player.sendMessage("§cStat reset cancelled.");
    return;
  }

  if (res.selection === 0) {
    confirmStatReset(player);
  } else {
    openStatisticsUI(player);
  }
}
function fillHealth(player) {
  const health = player.getComponent("health");
  if (!health) return;

  // Fill all hearts, including health_boost hearts
  health.setCurrentValue(health.effectiveMax);
}
function applyStatEffects(player) {
  const healthLvl = Math.floor(getStat(player, STAT_KEYS.health) / 25);
  const strengthLvl = Math.floor(getStat(player, STAT_KEYS.strength) / 25);
  const defenseLvl = Math.floor(getStat(player, STAT_KEYS.defense) / 25);

  // Health Boost - ADD to existing
  if (healthLvl > 0) {
    const existing = player.getEffect("health_boost");
    const newAmplifier = (existing?.amplifier ?? -1) + healthLvl;
    
    player.addEffect("health_boost", 999999, {
      amplifier: Math.min(newAmplifier, 255),
      showParticles: false
    });

    system.run(() => fillHealth(player));
  }

  // Strength - ADD to existing
  if (strengthLvl > 0) {
    const existing = player.getEffect("strength");
    const newAmplifier = (existing?.amplifier ?? -1) + strengthLvl;
    
    player.addEffect("strength", 999999, {
      amplifier: Math.min(newAmplifier, 255),
      showParticles: false
    });
  }

  // Resistance (Defense) - ADD to existing
  if (defenseLvl > 0) {
    const existing = player.getEffect("resistance");
    const newAmplifier = (existing?.amplifier ?? -1) + defenseLvl;
    
    player.addEffect("resistance", 999999, {
      amplifier: Math.min(newAmplifier, 255),
      showParticles: false
    });
  }
}

// ===============================
// STAT RESET LOGIC
// ===============================
function confirmStatReset(player) {
  const COST = 3;

  if (countDiamonds(player) < COST) {
    player.sendMessage("§cYou need 3 diamonds to reset your stats.");
    return;
  }

  removeDiamonds(player, COST);

  const refunded =
    getStat(player, STAT_KEYS.health) +
    getStat(player, STAT_KEYS.strength) +
    getStat(player, STAT_KEYS.defense) +
    getStat(player, STAT_KEYS.mana);

  // Reset stats
  setStat(player, STAT_KEYS.health, 0);
  setStat(player, STAT_KEYS.strength, 0);
  setStat(player, STAT_KEYS.defense, 0);
  setStat(player, STAT_KEYS.mana, 0);

  // Refund points
  setStat(
    player,
    STAT_KEYS.points,
    getStat(player, STAT_KEYS.points) + refunded
  );

  setStat(player, STAT_KEYS.total, 0);

  applyStatEffects(player);

  player.sendMessage(
    `§aStats reset successful! §e${refunded} §astat points refunded.`
  );
  player.runCommandAsync("playsound random.anvil_use @s");
}
async function openStatAllocateUI(player, statKey) {
  const totalUsed = getTotalStats(player);
  const available = getStat(player, STAT_KEYS.points);

  if (available <= 0) {
    player.sendMessage("§cYou have no stat points left.");
    return;
  }
  const current = getStat(player, statKey);
  const maxForStat = 50;
  const maxAddable = Math.min(available, maxForStat - current);

  if (maxAddable <= 0) {
    player.sendMessage("§cThis stat is already maxed.");
    return;
  }

  const statName = statKey.replace("stat_", "").toUpperCase();

  const form = new ModalFormData()
    .title(`${statName} Allocation`)
    .slider(
      `Current: ${current}\nAvailable points: ${available}`,
      0,
      maxAddable,
      1,
      0
    );

  const res = await form.show(player);
  if (res.canceled) {
    player.sendMessage("§cStat allocation cancelled.");
    return;
  }

  const amount = res.formValues[0];
  if (amount <= 0) return;

if (getTotalStats(player) + amount > MAX_TOTAL_STATS) {
  player.sendMessage("§cYou cannot exceed 100 total stat points.");
  return;
}

if (statKey === STAT_KEYS.mana && current + amount > MAX_MANA_STATS) {
  player.sendMessage("§cMana cannot exceed 50 stat points.");
  return;
}
  setStat(player, statKey, current + amount);

setStat(
  player,
  STAT_KEYS.points,
  getStat(player, STAT_KEYS.points) - amount
);

setStat(
  player,
  STAT_KEYS.total,
  getTotalStats(player) + amount
);

  applyStatEffects(player);

  player.sendMessage(`§aAdded §e${amount}§a points to §b${statName}.`);
}
system.runInterval(() => {
  for (const player of world.getPlayers()) {
    applyStatEffects(player);
  }
}, 600);
