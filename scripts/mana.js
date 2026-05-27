import { world, system } from "@minecraft/server";
import { currentRace } from "./race_utils.js";
import { getSpellDisplay } from "./magic.js";

/* ======================
MANA CONFIG
====================== */

const BASE_MANA = 100
const MAX_STAT_BONUS = 50
const REGEN_RATE = 1
const TICK_RATE = 4

/* ======================
GET STAT BONUS
====================== */

function getStatMana(player){

const stat = player.getDynamicProperty("mana_stat")

if(typeof stat !== "number") return 0

return Math.min(stat, MAX_STAT_BONUS)

}

/* ======================
GET RACE BONUS
====================== */

function getRaceMana(player){

const race = currentRace(player)
let bonus = 0

switch(race){

case "angel":
bonus += 100
break

case "ancient_elf":
bonus += 50
break

case "demon":
bonus += 25
break

}

const statMana = player.getDynamicProperty("stat_mana") ?? 0
bonus += statMana

return bonus

}

/* ======================
MAX MANA
====================== */

function getMaxMana(player){

return BASE_MANA
+ getStatMana(player)
+ getRaceMana(player)

}

/* ======================
GET / SET
====================== */

function getMana(player){

const mana = player.getDynamicProperty("currentMana")

if(typeof mana === "number") return mana

return getMaxMana(player)

}

function setMana(player, amount){

const max = getMaxMana(player)

player.setDynamicProperty(
"currentMana",
Math.max(0, Math.min(amount, max))
)

}

/* ======================
SPEND MANA
====================== */

export function spendMana(player, amount){

const mana = getMana(player)

if(mana < amount) return false

setMana(player, mana - amount)

return true

}

/* ======================
INIT
====================== */

world.afterEvents.playerSpawn.subscribe(e=>{

if(!e.initialSpawn) return

const p = e.player

if(p.getDynamicProperty("currentMana") === undefined){

p.setDynamicProperty(
"currentMana",
getMaxMana(p)
)

}

})

/* ======================
TICK SYSTEM
====================== */

system.runInterval(()=>{

for(const player of world.getPlayers()){

const mana = getMana(player)
const max = getMaxMana(player)

/* Clamp if max changed */

const lastMax = player.getDynamicProperty("lastMaxMana")

if(lastMax !== max){

 const diff = max - (lastMax ?? max)

 setMana(player, mana + diff)

 player.setDynamicProperty("lastMaxMana", max)

}

/* Regen */

if(player.isSneaking && mana < max){

setMana(player, mana + REGEN_RATE)

}

/* Weakness if empty */

if(mana < 20){

player.addEffect(
"weakness",
40,
{
amplifier:4,
showParticles:false
}
)

}else{

player.removeEffect("weakness")

}

/* HUD */

let hudDisplay = getSpellDisplay(player)

// If no spell display, show race skill
if(!hudDisplay){
 const race = currentRace(player)
 
 if(race === "human") hudDisplay = "§bHuman Skill: Strength Boost"
 else if(race === "forest_elf") hudDisplay = "§2Forest Elf Skill: Farsight"
 else if(race === "ancient_elf") hudDisplay = "§5Ancient Elf Skill: Trump Card"
 else if(race === "phantom") hudDisplay = "§8Phantom Skill: Spectral Mode"
}

if(!player.hasTag("intro_playing")){

player.onScreenDisplay.setActionBar(
`§7${hudDisplay}   §b✦ ${getMana(player)}/${max}`
)

}

}

}, TICK_RATE)