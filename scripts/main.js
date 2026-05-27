import { world, system, Player, ItemStack, EnchantmentTypes } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
// import "./introduction.js";
import "./block_trigger.js";
import "./item_trigger.js";
import "./mana.js";
import "./mana_usage.js";
import { openMagicUI } from "./magic.js";
import { openKitsUI, openStatisticsUI } from "./kits.js";
import { openRacesUI } from "./races.js";
import "./race_utils.js";
import "./red_orb.js";
import "./weapons.js";
import "./armors.js";
import "./phoenix_heart.js";
import "./longsword.js";
import "./adventurersguild_hud.js";
import "./butterfly.js";
import "./dark_elf_attack.js";
import { ArchaneAttackManager } from "./archane_attacks.js";

const manager = new ArchaneAttackManager();
manager.register();
// =================================================================
//  QUEST DATABASE
// =================================================================
// SO SO IMPORTANT:
// Define all your quests here. This is the only section you'll
// NEED TO EDIT to add new quests and objectives!!!
// =================================================================

const QUEST_DATABASE = {
    "kraken_terror": {
        id: "kraken_terror",
        title: "Main Quest: Kraken's Terror!",
        description: "A Kraken terrorizes the coast. Face its minions and challenge the beast itself.",
        objectives: [
            {
                objectiveId: "kraken_terror_obj1",
                type: 'kill',
                name: "Defeat Kraken's Serpents",
                target: 'cb:krakens_serpent', // IMPORTANT: Use your actual entity ID
                amount: 2,
                rewards: [
                    { type: 'item', id: 'minecraft:iron_ingot', amount: 32 },
                    { type: 'item', id: 'minecraft:enchanted_book', amount: 1, enchantments: [{ type: 'sharpness', level: 4 }] },
                    { type: 'command', command: 'xp 300 @s' }
                ]
            },
            {
                objectiveId: "kraken_terror_obj2",
                type: 'collect',
                name: "Collect 8 Gold Blocks from Kraken's Lair",
                target: 'minecraft:gold_block',
                amount: 8,
                rewards: [
                    { type: 'item', id: 'minecraft:golden_apple', amount: 5 },
                    { type: 'item', id: 'minecraft:diamond', amount: 6 }
                ]
            },
            {
                objectiveId: "kraken_terror_obj3",
                type: 'collect',
                name: "Collect 3 Diamond Blocks from Kraken's Lair",
                target: 'minecraft:diamond_block',
                amount: 3,
                rewards: [
                    { type: 'item', id: 'minecraft:enchanted_book', amount: 4, enchantments: [{ type: 'mending', level: 1 }] },
                    { type: 'command', command: 'xp 600 @s' }
                ]
            },
            {
                objectiveId: "kraken_terror_obj4",
                type: 'kill',
                name: "Defeat the All-mighty Kraken!",
                target: 'cb:kraken',
                amount: 1,
                rewards: [
                    { type: 'item', id: 'minecraft:enchanted_golden_apple', amount: 1 },
                    { type: 'command', command: 'experience add @s 10 levels' },
                    { type: 'item', id: 'minecraft:diamond', amount: 15 }
                ]
            }
        ]
    },
    "yeti's_wrath": {
        id: "yeti's_wrath",
        title: "Main Quest: Yeti's Wrath!",
        description: "A Beast Hiding In The Depths Of The Tundra, Discover And End It's Ruling.",
        objectives: [
            {

    objectiveId: "yeti_wrath_obj1",
    type: 'find',
    name: "Find The Snow Brute",
    target: 'cb:yeti',
    amount: 1,
    rewards: [
         { type: 'item', id: 'minecraft:golden_apple', amount: 7 }, 
         { type: 'item', id: 'minecraft:iron_ingot', amount: 17 },
         { type: 'item', id: 'minecraft:diamond', amount: 7 } 
  ]
         },
{
    objectiveId: "yeti_wrath_obj2",
    type: 'collect',
    name: "Collect 4 Of Yeti's Fur",
    target: 'cb:yeti_fur',
    amount: 4,
    rewards: [
        { type: 'item', id: 'minecraft:emerald_block', amount: 2 },
        { type: 'item', id: 'minecraft:golden_carrot', amount: 11 }
    ]
         },
            {
                objectiveId: "yeti's_wrath_obj3",
                type: 'kill',
                name: "Kill The Beast's Minions!",
                target: 'minecraft:snow_golem',
                amount: 5,
                rewards: [
                    { type: 'item', id: 'minecraft:golden_carrot', amount: 7 },
                    { type: 'command', command: 'xp 300 @s' },                   { type: 'item', id: 'minecraft:golden_apple', amount: 3 }
                ]
            },
            {
                objectiveId: "yeti's_wrath_obj4",
                type: 'kill',
                name: "Defeat the Leader Of The Tundra, Yeti!",
                target: 'cb:yeti',
                amount: 1,
                rewards: [
                    { type: 'item', id: 'minecraft:enchanted_golden_apple', amount: 1 },
                    { type: 'command', command: 'experience add @s 10 levels' },
                    { type: 'item', id: 'minecraft:diamond', amount: 15 }
                ]
            }
        ]
    },
 "kitsune's_mischief": {
        id: "kitsune's_mischief",
        title: "Main Quest: Kitsune's Mischief!",
        description: "The Kitsune Is Causing Mischief With Its Magic Around Nearby Water Bodies.",
        objectives: [
            {
                objectiveId: "kitsune's_mischief_obj1",
                type: 'find',
                name: "Find The Mischievous Fox Girl",
                target: 'cb:kitsune_demihumanform', // IMPORTANT: Use your actual entity ID
                amount: 1,
                rewards: [
                    { type: 'item', id: 'minecraft:iron_ingot', amount: 32 },
                    { type: 'item', id: 'minecraft:golden_apple', amount: 3 },
                    { type: 'command', command: 'xp 300 @s' }
                ]
            },
            {
                objectiveId: "kitsune's_mischief_obj2",
                type: 'kill',
                name: "Defeat Kitsune's Furry Pets",
                target: 'cb:direwolf',
                amount: 5,
                rewards: [
                    { type: 'item', id: 'minecraft:golden_apple', amount: 3 },
                    { type: 'item', id: 'minecraft:golden_carrot', amount: 5 }
                ]
            },
            {
                objectiveId: "kitsune's_mischief_obj3",
                type: 'kill',
                name: "Defeat The Fox Girl To Make Her Reveal Her Trueself",
                target: 'cb:kitsune_demihumanform',
                amount: 1,
                rewards: [
                    { type: 'item', id: 'minecraft:enchanted_golden_apple', amount: 2 },
                    { type: 'item', id: 'minecraft:totem_of_undying', amount: 2 },
                    { type: 'command', command: 'xp 600 @s' }
                ]
            },
            {
                objectiveId: "kitsune's_mischief_obj4",
                type: 'kill',
                name: "Defeat The Wicked Fox!",
                target: 'cb:kitsune_beastform',
                amount: 1,
                rewards: [
                    { type: 'item', id: 'minecraft:enchanted_golden_apple', amount: 3 },
                    { type: 'command', command: 'experience add @s 20 levels' },
                    { type: 'item', id: 'minecraft:netherite_ingot', amount: 15 }
                ]
            }
        ]
    },
    // To add above ^^ your next main quest, copy the "kraken_terror" block
    // paste it here, and change the details.
    // "sus_villager": { id: "sus_villager", title: "...", objectives: [...] }
};


// =================================================================
//  CORE QUEST SYSTEM - You don't need to edit below this line
// =================================================================

/**
 * Gets the player's entire quest state from a single dynamic property.
 * @param {Player} player
 * @returns {{activeQuestId: string | null, questProgress: object, completedObjectives: object}}
 */
const ENCHANT_BOOK_LOOT_PATHS = {
    sharpness: { 4: 'quest_rewards/sharpness4_book' },
    mending:   { 1: 'quest_rewards/mending1_book' }
    // add more as you create more loot tables
};
const collectProgressCache = {};
function getPlayerQuestState(player) {
    const stateJSON = player.getDynamicProperty("questState_v2");
    try {
        if (stateJSON) return JSON.parse(stateJSON);
    } catch (e) {
        console.error("Failed to parse quest state for player: " + player.name);
    }
    // Default state for a new player or if parsing fails
    return { activeQuestId: null, questProgress: {}, completedObjectives: {} };
}

/**
 * Saves the player's entire quest state to a single dynamic property.
 * @param {Player} player
 * @param {object} state
 */
function setPlayerQuestState(player, state) {
    player.setDynamicProperty("questState_v2", JSON.stringify(state));
}

/**
 * Main Quest Menu UI. Shows all available quests.
 * @param {Player} player
 */
async function openQuestOrKitsMenu(player) {
    const form = new ActionFormData()
        .title("Adventurers Menu")
        .body("Choose what you want to open:");

    form.button("Quests", "textures/items/book_writable");
    form.button("Kits", "textures/blocks/ender_chest_front");
    form.button("Statistics", "textures/items/name_tag");
    form.button("Races", "textures/items/feather");
    form.button("Magic Affinity", "textures/items/pamobile/cb_red_orb")
    const response = await form.show(player);

    if (response.canceled) return;

    if (response.selection === 0) {
        openQuestMainMenu(player);
    } else if (response.selection === 1) {
        openKitsUI(player);
    } else if (response.selection === 2) {
        openStatisticsUI(player);
    } else if (response.selection === 3) {
        openRacesUI(player);
    }
      else if (response.selection===4) {
openMagicUI(player)
}
}
async function openQuestMainMenu(player) {
    const state = getPlayerQuestState(player);
    const form = new ActionFormData().title("Quest Book");

    if (state.activeQuestId) {
        const activeQuest = QUEST_DATABASE[state.activeQuestId];
        form.body(`You are currently on the quest:\n§e${activeQuest.title}`);
        form.button("§aView Active Quest");
    } else {
        form.body("Select a main quest to begin.\nYou can only have one active main quest at a time.");
    }
    
    form.button("§7Available Quests");

    const response = await form.show(player);
    if (response.canceled) return;

    if (state.activeQuestId && response.selection === 0) {
        openQuestDetailsUI(player, state.activeQuestId);
    } else {
        openAvailableQuestsUI(player);
    }
}

/**
 * Shows quests that the player can start.
 * @param {Player} player
 */
async function openAvailableQuestsUI(player) {
    const state = getPlayerQuestState(player);
    const form = new ActionFormData().title("Available Quests");

    const availableQuests = Object.values(QUEST_DATABASE).filter(q => {
        // A quest is available if it's not the active one AND not all its objectives have been completed.
        const allComplete = q.objectives.every(obj => state.completedObjectives[obj.objectiveId]);
        return q.id !== state.activeQuestId && !allComplete;
    });

    if (availableQuests.length === 0) {
        form.body("No other quests are available at this time.");
        form.button("§cBack");
    } else {
        availableQuests.forEach(quest => form.button(quest.title));
    }
    
    const response = await form.show(player);
    if (response.canceled || availableQuests.length === 0) return;

    const selectedQuestId = availableQuests[response.selection].id;
    
    state.activeQuestId = selectedQuestId;
    if (!state.questProgress[selectedQuestId]) {
        state.questProgress[selectedQuestId] = {};
    }
    setPlayerQuestState(player, state);
    player.sendMessage(`§aNew Quest Started: ${QUEST_DATABASE[selectedQuestId].title}`);
    openQuestDetailsUI(player, selectedQuestId);
}

/**
 * Shows the details and objectives for a specific quest.
 * @param {Player} player
 * @param {string} questId
 */
async function openQuestDetailsUI(player, questId) {
    const quest = QUEST_DATABASE[questId];
    if (!quest) return;

    const state = getPlayerQuestState(player);
    
    const form = new ActionFormData().title(quest.title);
    
    let bodyText = `${quest.description}\n\n§lObjectives:§r\n`;
    const buttons = [];

    for (const obj of quest.objectives) {
        const currentAmount = getObjectiveProgress(player, questId, obj);
        const isComplete = currentAmount >= obj.amount;
        const isClaimed = state.completedObjectives[obj.objectiveId] === true;

        let status;
        if (isClaimed) {
            status = `§b§l(Claimed)§r`;
        } else if (isComplete && !isClaimed) {
            status = `§6§l(Ready to Claim!)§r`;
        } else {
            status = `§7(${currentAmount}/${obj.amount})§r`;
        }

        // line (reset at start + blank line after)
        bodyText += `§r- ${obj.name} ${status}\n§r\n`;

        let iconPath;
        if (isClaimed) {
            iconPath = "textures/blocks/emerald_block";
        } else if (isComplete && !isClaimed) {
            iconPath = "textures/blocks/gold_block";
        } else {
            iconPath = "textures/blocks/redstone_block";
        }

        buttons.push({
            text: isClaimed ? `§m§7${obj.name}` : obj.name,
            icon: iconPath,
            enabled: isComplete && !isClaimed,
            objectiveId: obj.objectiveId
        });
    }
    
    form.body(bodyText);
    buttons.forEach(btn => form.button(btn.text, btn.icon));
    form.button("§cAbandon Quest");

    const response = await form.show(player);
    if (response.canceled) return;

    const selectedButton = buttons[response.selection];

    if (selectedButton) {
        if (selectedButton.enabled) {
            claimReward(player, questId, selectedButton.objectiveId);
        } else {
            openQuestDetailsUI(player, questId);
        }
    } else {
        state.activeQuestId = null;
        setPlayerQuestState(player, state);
        player.sendMessage(`§eQuest Abandoned: ${quest.title}`);
    }
}

function getObjectiveProgress(player, questId, objective) {
    const state = getPlayerQuestState(player);
    const progress = state.questProgress[questId] || {};

    if (objective.type === 'collect') {
        const container = player.getComponent('inventory').container;
        let count = 0;
        for (let i = 0; i < container.size; i++) {
            const item = container.getItem(i);
            if (item && item.typeId === objective.target) {
                count += item.amount;
            }
        }
        return count;
    }
    return progress[objective.objectiveId] || 0;
}

function claimReward(player, questId, objectiveId) {
    const quest = QUEST_DATABASE[questId];
    const objective = quest.objectives.find(o => o.objectiveId === objectiveId);
    if (!objective) return;

    const state = getPlayerQuestState(player);
    if (state.completedObjectives[objectiveId] || getObjectiveProgress(player, questId, objective) < objective.amount) return;

    player.sendMessage("§aObjective Complete! You received:");

    // ----------------------------------------------------------------
    // Reward loop
    // ----------------------------------------------------------------
    for (const reward of objective.rewards) {
        if (reward.type === 'item') {

            // ========================================================
            // Enchanted book (loot table path)
            // ========================================================
            if (reward.id === 'minecraft:enchanted_book' && reward.enchantments && reward.enchantments.length > 0) {
                const spec = reward.enchantments[0];
                let enchName = typeof spec.type === 'string'
                    ? (spec.type.includes(":") ? spec.type.split(":")[1] : spec.type)
                    : (spec.type?.id?.split(":")[1] ?? null);

                const level = spec.level ?? 1;
                let lootPath = null;

                if (enchName && ENCHANT_BOOK_LOOT_PATHS[enchName] && ENCHANT_BOOK_LOOT_PATHS[enchName][level]) {
                    lootPath = ENCHANT_BOOK_LOOT_PATHS[enchName][level];
                }

                if (lootPath) {
                    // Give X copies via loot
                    for (let i = 0; i < reward.amount; i++) {
                        player.runCommandAsync(`loot give "${player.name}" loot "${lootPath}"`);
                    }
                    player.sendMessage(`- ${reward.amount}x enchanted_book (${enchName} ${level})`);
                } else {
                    // Fallback to prevent errors that gives plain enchanted books if no loot table found
                    for (let i = 0; i < reward.amount; i++) {
                        player.runCommandAsync(`give "${player.name}" enchanted_book`);
                    }
                    player.sendMessage(`§e(No loot table found for ${enchName} ${level}; gave plain books.)`);
                }

                continue; // Skip normal item path
            }

            // ========================================================
            // NORMAL ITEM (with optional direct enchantments)
            // ========================================================
            const item = new ItemStack(reward.id, reward.amount);

            if (reward.enchantments) {
                const enchantable = item.getComponent('enchantable');
                if (enchantable) {
                    for (const enc of reward.enchantments) {
                        // Accept either a string id or a direct EnchantmentType
                        let enchTypeObj = enc.type;
                        if (typeof enchTypeObj === "string") {
                            const key = enchTypeObj.includes(":") ? enchTypeObj.split(":")[1] : enchTypeObj;
                            enchTypeObj = EnchantmentTypes[key];
                        }
                        if (!enchTypeObj) {
                            player.sendMessage(`§cUnknown enchantment: ${enc.type}`);
                            continue;
                        }
                        const max = enchantable.getEnchantment(enchTypeObj)?.type.maxLevel ?? enchTypeObj.maxLevel;
                        const level = Math.min(enc.level ?? 1, max);
                        const ok = enchantable.addEnchantment({ type: enchTypeObj, level });
                        if (!ok) {
                            player.sendMessage(`§cFailed to add ${enc.type} ${level} to item.`);
                        }
                    }
                } else {
                    player.sendMessage("§cItem cannot receive enchantments.");
                }
            }

            player.getComponent('inventory').container.addItem(item);
            player.sendMessage(`- ${reward.amount}x ${reward.id}`);

        } else if (reward.type === 'command') {
            player.runCommandAsync(reward.command.replace('@s', `"${player.name}"`));
            player.sendMessage(`- Bonus Reward!`);
        }
    }

    // Removes collected items if objective was a collect type
    if (objective.type === 'collect') {
        world.getDimension(player.dimension.id)
            .runCommandAsync(`clear "${player.name}" ${objective.target} 0 ${objective.amount}`);
    }

    state.completedObjectives[objectiveId] = true;
    setPlayerQuestState(player, state);

    // Clear cashe
    if (objective.type === 'collect') {
        try {
            const pid = player.id;
            if (collectProgressCache[pid]) delete collectProgressCache[pid][objectiveId];
        } catch (_) {}
    }

    // Auto complete quest if all objectives done
    const allComplete = quest.objectives.every(obj => state.completedObjectives[obj.objectiveId]);
    if (allComplete) {
        player.onScreenDisplay.setTitle(
            `§l§6§o★ QUEST COMPLETE! ★`,
            {
                subtitle: `§b${quest.title} §r§ahas been completed!`,
                fadeInDuration: 20,
                stayDuration: 60,
                fadeOutDuration: 20
            }
        );
        player.playSound("random.levelup");
        state.activeQuestId = null;
        setPlayerQuestState(player, state);
    }
}    

// =================================================================
//  FIRST CODE - (basically worldjoin.js but better and modified)
// =================================================================

// --- Player Spawn Logic ---
const questBook = new ItemStack("cb:quest_book", 1);
questBook.setLore(["§r§7Hold To View Adventuring Records"]);

world.afterEvents.playerSpawn.subscribe(event => {
    const { player, initialSpawn } = event;
    if (initialSpawn) {
        if (!player.hasTag("joined")) {
            player.addTag("joined");
            player.getComponent("inventory").container.addItem(questBook);
            player.sendMessage("Welcome! You have received The Adventurers Menu!");
            // Initialize quest state for the new player
            if (player.getDynamicProperty("questState_v2") === undefined) {
                setPlayerQuestState(player, { activeQuestId: null, questProgress: {}, completedObjectives: {} });
            }
        }
    }
});

// --- Component Registration ---
world.beforeEvents.worldInitialize.subscribe(initEvent => {
    // Quest Book Logic that opens the UI
    initEvent.itemComponentRegistry.registerCustomComponent(
    'cb_quest_book:trigger',
    {
        onUse: e => {
            system.run(() => openQuestOrKitsMenu(e.source));
        }
    }
);

// UHH... don't worry about this section
    const componentsToRegister = [
        'cb_centaur_hooves:trigger', 'cb_cooked_goblin_meat:trigger', 'cb_cooked_minotaur_meat:trigger',
        'cb_cooked_orc_meat:trigger', 'cb_kitsune_fur:trigger', 'cb_kraken_scales:trigger',
        'cb_minotaur_horn:trigger', 'cb_mutated_spiderweb:trigger', 'cb_raw_goblin_meat:trigger',
        'cb_raw_minotaur_meat:trigger', 'cb_raw_orc_meat:trigger', 'cb_summon_spirit_upgrade:trigger',
        'cb_vampire_blood:trigger', 'cb_vampire_heart:trigger', 'cb_webshooter:trigger'
    ];
    for (const componentId of componentsToRegister) {
        initEvent.itemComponentRegistry.registerCustomComponent(componentId, {});
    }
});

// --- Event listener for 'kill' objectives ---
world.afterEvents.entityDie.subscribe(event => {
    const { deadEntity, damageSource } = event;
    if (!(damageSource?.damagingEntity instanceof Player)) return;

    const player = damageSource.damagingEntity;
    const state = getPlayerQuestState(player);
    if (!state.activeQuestId) return;

    const activeQuest = QUEST_DATABASE[state.activeQuestId];
    if (!activeQuest) return;

    for (const obj of activeQuest.objectives) {
        if (obj.type === 'kill' && obj.target === deadEntity.typeId) {
            const progress = state.questProgress[activeQuest.id] || {};
            const currentKills = progress[obj.objectiveId] || 0;
            
            if (currentKills < obj.amount) {
                progress[obj.objectiveId] = currentKills + 1;
                state.questProgress[activeQuest.id] = progress;
                setPlayerQuestState(player, state);
                
                player.onScreenDisplay.setActionBar(`§b${obj.name}: ${currentKills + 1} / ${obj.amount}`);
                if (currentKills + 1 >= obj.amount) {
                     player.sendMessage(`§aObjective Complete: ${obj.name}. Open your quest book to claim the reward!`);
                     player.playSound("random.levelup");
                }
            }
        }
    }
});

// --- Tick System ---
let tick = 0;
system.runInterval(() => {
    // Every 20 ticks (1 sec) update collect objective trackers
    if (tick % 20 === 0) {
        for (const player of world.getPlayers()) {
            const state = getPlayerQuestState(player);
            if (!state.activeQuestId) continue;
            const quest = QUEST_DATABASE[state.activeQuestId];
            if (!quest) continue;

            const pid = player.id;
            if (!collectProgressCache[pid]) collectProgressCache[pid] = {};

            // Check collect objectives
            for (const obj of quest.objectives) {
                if (obj.type !== 'collect') continue;
                if (state.completedObjectives[obj.objectiveId]) continue;

                const currentAmount = getObjectiveProgress(player, quest.id, obj);
                const lastAmount = collectProgressCache[pid][obj.objectiveId] ?? 0;

                if (currentAmount > lastAmount) {
                    player.onScreenDisplay.setActionBar(`§b${obj.name}: ${currentAmount} / ${obj.amount}`);

                    if (currentAmount >= obj.amount) {
                        player.sendMessage(`§aObjective Complete: ${obj.name}. Open your quest book to claim the reward!`);
                        world.getDimension(player.dimension.id)
                            .runCommandAsync(`playsound random.levelup @a[name="${player.name}"]`);
                    }

                    collectProgressCache[pid][obj.objectiveId] = currentAmount;
                } else if (lastAmount > currentAmount) {
                    collectProgressCache[pid][obj.objectiveId] = currentAmount;
                }
            } // closes objectives loop
// Check find objectives
for (const obj of quest.objectives) {
    if (obj.type !== 'find') continue;
    if (state.completedObjectives[obj.objectiveId]) continue;

    // Get nearby entities (we'll filter manually)
    const nearbyEntities = player.dimension.getEntities({
        location: player.location,
        maxDistance: 12
    });

    // Only count entities that actually match the target typeId
    const foundTarget = nearbyEntities.some(ent => ent.typeId === obj.target);

    if (foundTarget) {
        const progress = state.questProgress[quest.id] || {};
        const currentFinds = progress[obj.objectiveId] || 0;

        if (currentFinds < obj.amount) {
            progress[obj.objectiveId] = obj.amount; // mark full progress
            state.questProgress[quest.id] = progress;
            setPlayerQuestState(player, state);

            player.sendMessage(`§aObjective Complete: ${obj.name}. Open your quest book to claim the reward!`);
            world.getDimension(player.dimension.id)
                .runCommandAsync(`playsound random.levelup @a[name="${player.name}"]`);
        }
    }
} // ✅ closes find objectives loop
        } // ✅ closes player loop
    } // ✅ closes tick % 20 condition

    tick++;
}, 1);

console.log("§aCodedBit Addon with Advanced Quest System loaded successfully!");
