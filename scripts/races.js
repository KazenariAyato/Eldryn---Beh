import { world, system } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { spendMana } from "./mana.js";
import { races, currentRace } from "./race_utils.js";

// Export for use in magic.js
export function useRaceSkill(player){

const race = currentRace(player)

if(!race) return

if(race === "human"){
  if(!ready(player, "human")) {
    player.sendMessage("§7Skill on cooldown")
    return
  }
  humanSkill(player)
}else if(race === "forest_elf"){
  if(!ready(player, "forest")) {
    player.sendMessage("§7Skill on cooldown")
    return
  }
  farsight(player)
}else if(race === "ancient_elf"){
  if(!ready(player, "ancient")) {
    player.sendMessage("§7Skill on cooldown")
    return
  }
  trumpCard(player)
}else if(race === "phantom"){
  if(!ready(player, "phantom")) {
    player.sendMessage("§7Skill on cooldown")
    return
  }
  spectralMode(player)
}

}
system.run(() => {
 try {
  world.scoreboard.addObjective("heavenly_dna","Heavenly DNA")
 } catch {}
})

const dnaObjective = "heavenly_dna";


const cooldowns = new Map();

function getCooldown(player,id){
return cooldowns.get(player.id+id) ?? 0
}

function setCooldown(player,id,time){
cooldowns.set(player.id+id,system.currentTick+time)
}

function wings(player){
return
}

function ready(player,id){
return system.currentTick >= getCooldown(player,id)
}

function emptyHand(player){
const item = player.getComponent("minecraft:equippable").getEquipment("Mainhand")
return !item
}

export function setRace(player,r){

const race = r.trim()

for(const existing of races){
 player.removeTag("race_"+existing)
}

player.addTag("race_"+race)

player.sendMessage(`§aRace applied: ${race}`)

}

function addDNA(player,amount){
player.runCommandAsync(`scoreboard players add @s ${dnaObjective} ${amount}`)
}

function getDNA(player){
 const obj = world.scoreboard.getObjective(dnaObjective)
 if(!obj) return 0

 try{
  return obj.getScore(player.scoreboardIdentity) ?? 0
 }catch{
  return 0
 }
}

function removeDNA(player,a){
player.runCommandAsync(`scoreboard players remove @s ${dnaObjective} ${a}`)
}
world.afterEvents.entityHurt.subscribe(ev=>{

const attacker = ev.damageSource?.damagingEntity
if(!attacker) return
if(attacker.typeId !== "minecraft:player") return

if(currentRace(attacker)!=="vampire") return

if(Math.random() < 0.10){

attacker.addEffect("regeneration",40,{amplifier:0})
attacker.spawnParticle("minecraft:heart_particle", attacker.location)

}

})

world.afterEvents.entityHurt.subscribe(ev=>{

const attacker = ev.damageSource?.damagingEntity
if(!attacker) return
if(attacker.typeId !== "minecraft:player") return

if(currentRace(attacker)!=="forest_elf") return

const weapon = attacker.getComponent("minecraft:equippable")
.getEquipment("Mainhand")

if(!weapon) return

if(
 weapon.typeId.includes("bow") ||
 weapon.typeId.includes("crossbow")
){

ev.hurt(2, { damagingEntity: attacker })

}

})

world.afterEvents.playerSpawn.subscribe(e=>{
 const p = e.player

 if(!e.initialSpawn) return

 system.runTimeout(()=>{
  p.runCommandAsync(`scoreboard players set @s heavenly_dna 1`)
 },20)
})

world.afterEvents.entityDie.subscribe(e=>{
const killer=e.damageSource?.damagingEntity
if(!killer || killer.typeId!=="minecraft:player") return

const bosses=[
"cb:phoenix",
"cb:yeti",
"cb:kraken",
"cb:kitsune_beastform",
"cb:archane"
]

if(!bosses.includes(e.deadEntity.typeId)) return

if(Math.random()<0.5){
addDNA(killer,1)
killer.sendMessage("§6You obtained Heavenly DNA")
}
})

/* ======================
ABILITIES
====================== */

function humanSkill(player){

if(!spendMana(player,20)) return player.sendMessage("§cNot enough mana")

player.addEffect("strength",100,{amplifier:1})
setCooldown(player,"human",200)

}

function farsight(player){

if(!spendMana(player,10)) return

player.runCommandAsync(`camera @s set minecraft:free ease 0.2 linear pos ^ ^ ^15 rot ~ ~`)
player.runCommandAsync(`effect @s night_vision 20 0 true`)

system.runTimeout(()=>{
 player.runCommandAsync(`camera @s clear`)
},50)

setCooldown(player,"forest",100)

}

function trumpCard(player){

if(!spendMana(player,40)) return

player.runCommandAsync(`effect @s regeneration 5 255 true`)
player.runCommandAsync(`effect @s instant_health 1 255 true`)
setCooldown(player,"ancient",1800)

}

function spectralMode(player){

if(!spendMana(player,35)) return

player.addEffect("invisibility",300,{showParticles:false})
player.addEffect("fire_resistance",300,{showParticles:false})
player.addEffect("water_breathing",300,{showParticles:false})

setCooldown(player,"phantom",900)

}

/* ======================
PASSIVES
====================== */

function passives(player){

  wings(player)

  const race = currentRace(player)
  if(!race) return

  // ANGEL
  if(race==="angel"){
    const speedBase = 1
    const speedExisting = player.getEffect("speed")?.amplifier ?? -1
    player.addEffect("speed", 40, {
      amplifier: Math.max(speedExisting, speedBase),
      showParticles:false
    })

    const jumpBase = 1
    const jumpExisting = player.getEffect("jump_boost")?.amplifier ?? -1
    player.addEffect("jump_boost", 40, {
      amplifier: Math.max(jumpExisting, jumpBase),
      showParticles:false
    })

    player.removeEffect("poison")
    player.removeEffect("wither")
    player.removeEffect("darkness")
  }

  // DEMON
  if(race==="demon"){
    player.addEffect("fire_resistance",40,{showParticles:false})

    const strBase = 1
    const strExisting = player.getEffect("strength")?.amplifier ?? -1
    player.addEffect("strength", 40, {
      amplifier: Math.max(strExisting, strBase),
      showParticles:false
    })

    const resBase = 1
    const resExisting = player.getEffect("resistance")?.amplifier ?? -1
    player.addEffect("resistance", 40, {
      amplifier: Math.max(resExisting, resBase),
      showParticles:false
    })
  }

  // FISHMAN
  if(race==="fishman"){
    if(player.isInWater){
      player.addEffect("water_breathing",40,{showParticles:false})

      const strBase = 1
      const strExisting = player.getEffect("strength")?.amplifier ?? -1
      player.addEffect("strength", 40, {
        amplifier: Math.max(strExisting, strBase),
        showParticles:false
      })
    }
  }

  // HUMAN
  if(race==="human"){
    const base = 0
    const existing = player.getEffect("speed")?.amplifier ?? -1

    player.addEffect("speed", 40, {
      amplifier: Math.max(existing, base),
      showParticles:false
    })
  }

  // VAMPIRE
  if(race==="vampire"){
    const time = world.getTimeOfDay()

    if(time < 12000){
      const base = 0
      const existing = player.getEffect("weakness")?.amplifier ?? -1
      player.addEffect("weakness", 40, {
        amplifier: Math.max(existing, base),
        showParticles:false
      })
    } else {
      const base = 0
      const existing = player.getEffect("strength")?.amplifier ?? -1
      player.addEffect("strength", 40, {
        amplifier: Math.max(existing, base),
        showParticles:false
      })
    }
  }
}

/* ======================
SKILL DETECTOR
====================== */

const sneakData = new Map()


function detectSneak(player){

const id = player.id
const data = sneakData.get(id) ?? {count:0,last:0}

if(!player.isSneaking) return

const now = system.currentTick

if(now - data.last < 10){
 data.count++
}else{
 data.count = 1
}

data.last = now

sneakData.set(id,data)

return data.count

}


system.runInterval(() => {

  for (const player of world.getPlayers()) {

    const race = currentRace(player)

    passives(player)

    const sneakCount = detectSneak(player)

    if (sneakCount === 3) {

      if (!sneakCount) continue
      if (!emptyHand(player)) continue
      if (!race) continue

      if (race === "human" && ready(player, "human")) {
        humanSkill(player)
      }

      if (race === "forest_elf" && ready(player, "forest")) {
        farsight(player)
      }

      if (race === "ancient_elf" && ready(player, "ancient")) {
        trumpCard(player)
      }

      if (race === "phantom" && ready(player, "phantom")) {
        spectralMode(player)
      }
    }

  }

}, 5)

const raceRarity = {
 human: "§7Common",
 forest_elf: "§aUncommon",
 fishman: "§aUncommon",
 dark_elf: "§9Rare",
 frost_elf: "§9Rare",
 vampire: "§9Rare",
 ancient_elf: "§5Epic",
 phantom: "§5Epic",
 angel: "§eLegendary",
 demon: "§eLegendary"
}

/* ======================
RACE GUI
====================== */

export function openRacesUI(player){

const dna=getDNA(player)
const race=currentRace(player) ?? "None"

const form=new ActionFormData()

.title("Races")

.body(
`§7Common 45%
§aUncommon 25%
§9Rare 15%
§5Epic 10%
§eLegendary 5%

§bHeavenly DNA: ${dna}

§dCurrent Race: ${race} §7(${raceRarity[race] ?? "Unknown"})`
)

.button("Reroll Race")
.button("Go Back")

form.show(player).then(async r=>{

if(r.selection===0){

if(getDNA(player) < 1){
player.sendMessage("§cNot enough Heavenly DNA")
return
}

removeDNA(player,1)

const raceChances = [
  { race: "human", chance: 45 },
  { race: "forest_elf", chance: 12.5 },
  { race: "fishman", chance: 12.5 },
  { race: "dark_elf", chance: 5 },
  { race: "frost_elf", chance: 5 },
  { race: "vampire", chance: 5 },
  { race: "ancient_elf", chance: 5 },
  { race: "phantom", chance: 5 },
  { race: "angel", chance: 2.5 },
  { race: "demon", chance: 2.5 }
];

function rollRace() {
  const roll = Math.random() * 100; // 0–100
  let cumulative = 0;

  for (const entry of raceChances) {
    cumulative += entry.chance;

    if (roll < cumulative) {
      return entry.race;
    }
  }

  return raceChances[0].race; // fallback (never happens ideally)
}

function waitTicks(ticks){
 return new Promise(resolve=>{
  system.runTimeout(resolve,ticks)
 })
}

async function rerollAnimation(player){

player.sendMessage("§6Rerolling race...")

for(let i=0;i<15;i++){

const preview = rollRace()

player.onScreenDisplay.setActionBar(
`§eRolling... §f${preview}`
)

await waitTicks(4)

}

const result = rollRace()

player.dimension.spawnParticle("minecraft:totem_particle", player.location)
player.runCommandAsync(`playsound random.levelup @s`)

return result

}
const newRace = await rerollAnimation(player)

setRace(player,newRace.trim())

system.run(()=>{
 player.sendMessage(`§aNew Race: ${newRace}`)
})

}

})
}

export { passives }