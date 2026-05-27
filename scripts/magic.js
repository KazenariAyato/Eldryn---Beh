import { world, system } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { spendMana } from "./mana.js";
import { useRaceSkill } from "./races.js";
/* ======================
MASTERY SYSTEM
====================== */

const masteryObj = "magic_mastery"

system.run(()=>{
try{
world.scoreboard.addObjective(masteryObj,"Magic Mastery")
}catch{}
})

function getMastery(player){

const o = world.scoreboard.getObjective(masteryObj)

try{
return o.getScore(player.scoreboardIdentity) ?? 0
}catch{
return 0
}

}

function addMastery(player,a){
player.runCommandAsync(`scoreboard players add @s ${masteryObj} ${a}`)
}

world.afterEvents.entityDie.subscribe(e=>{

const killer = e.damageSource?.damagingEntity

if(!killer || killer.typeId !== "minecraft:player") return

addMastery(killer,1)

})

const spellRequirements = [
5,
25,
50,
75,
100
]

function applyFireDamage(player, target, damage){

let finalDamage = damage

// Dark Elf passive: +50% fire damage
if(player.hasTag("race_dark_elf") && currentMagic(player) === "fire"){
 finalDamage *= 1.5
}

target.applyDamage(finalDamage)

}

/* ======================
MAGIC ELEMENTS
====================== */

export const magics = [
"fire",
"water",
"air",
"earth",
"ice",
"thunder",
"venom",
"light",
"dark",
"blood"
]

export function currentMagic(player){

for(const m of magics){
if(player.hasTag("magic_"+m)) return m
}

return null

}

export function setMagic(player,m){

for(const existing of magics){
player.removeTag("magic_"+existing)
}

player.addTag("magic_"+m)

player.runCommandAsync(`scoreboard players set @s ${masteryObj} 0`)

currentSpell.set(player.id,0)

player.sendMessage(`§bMagic Affinity: ${m}`)
player.sendMessage("§7Your mastery has been reset.")

}

/* ======================
CAST SYSTEM
====================== */

function tryCast(player){

const magic = currentMagic(player)
if(!magic) return

const spellIndex = currentSpell.get(player.id) ?? 0

const spellData = SPELLS[magic]?.[spellIndex]

if(!spellData) return

spellData.cast?.(player)

}

//Spell System

const currentSpell = new Map()
const wasSneaking = new Map()
const lastSneak = new Map()
const lastJump = new Map()
const wasJumping = new Map()

system.runInterval(()=>{

for(const player of world.getPlayers()){

const sneaking = player.isSneaking
const last = wasSneaking.get(player.id) ?? false

// DOUBLE SHIFT DETECTION
if(sneaking && !last){

const now = system.currentTick
const previous = lastSneak.get(player.id) ?? 0
// If second sneak within 36 ticks → CAST SPELL or USE RACE SKILL
if(now - previous < 36){

  // Check if holding spell staff
  if(isHoldingSpellStaff(player)){

    const magic = currentMagic(player)
    if(!magic){
      player.sendMessage("§cNo magic affinity selected")
    }else{
      const spellIndex = currentSpell.get(player.id) ?? 0
      const spellData = SPELLS[magic]?.[spellIndex]

      if(!spellData){
        player.sendMessage("§cSpell not found")
      }else if(getMastery(player) < spellData.mastery){
        player.sendMessage(`§cRequires ${spellData.mastery} mastery (you have ${getMastery(player)})`)
      }else{
        tryCast(player)
      }
    }

  }else{
    // Use race skill instead
    useRaceSkill(player)
  }

}

lastSneak.set(player.id, now)

}

wasSneaking.set(player.id,sneaking)

/* ======================
JUMP DETECTION FOR SPELL SWITCH
====================== */

// Check if player is in air (jumping)
const isJumping = player.isJumping || player.fallDistance > 0

const wasJump = wasJumping.get(player.id) ?? false

// Jump started + player is sneaking
if(isJumping && !wasJump && sneaking){

const now = system.currentTick
const previous = lastJump.get(player.id) ?? 0

// If second jump within 15 ticks while sneaking → SWITCH SPELL
if(now - previous < 15){

let spell = currentSpell.get(player.id) ?? 0
spell++
if(spell > 4) spell = 0

currentSpell.set(player.id,spell)

player.sendMessage(`§7Spell switched to ${spell+1}`)

}

lastJump.set(player.id,now)

}

wasJumping.set(player.id,isJumping)

}

},1)

const cooldowns = new Map()

function isHoldingSpellStaff(player){

const staffs = [
 "cb:main_dark_staff",
 "cb:frost_staff",
 "cb:staff_of_crimson_flames",
 "cb:staff_of_azure_flames"
]

const mainhand = player.getComponent("minecraft:equippable")
.getEquipment("Mainhand")

if(!mainhand) return false

return staffs.includes(mainhand.typeId)

}

export function getSpellDisplay(player){

 // Only show spells if holding a spell staff
 if(!isHoldingSpellStaff(player)) return ""

 const magic = currentMagic(player)
 if(!magic) return ""

 const spell = currentSpell.get(player.id) ?? 0

 const list = SPELLS[magic]
 if(!list) return ""

 const spellData = list[spell]

 return `${color[magic] ?? "§7"}${spellData.name} (${spellData.mana})`
}

const color = {
fire:"§6",
water:"§b",
air:"§f",
earth:"§2",
ice:"§3",
thunder:"§e",
venom:"§5",
light:"§e",
dark:"§8",
blood:"§4"
}

const SPELLS = {

fire: [

{
name: "Flamethrower",
mana: 20,
cooldown: 200,
mastery: 5,
cast: castFlamethrower
},

{
name: "Firey Bomb",
mana: 10,
cooldown: 120,
mastery: 25,
cast: castFireyBomb
},

{
name: "Flame Jet",
mana: 10,
cooldown: 50,
mastery: 50,
cast: castFlameJet
},

{
name: "Flame Repulsion",
mana: 10,
cooldown: 100,
mastery: 75,
cast: castFlameRepulsion
},

{
name: "Draconic Fire",
mana: 30,
cooldown: 240,
mastery: 100,
cast: castDraconicFire
}

],

water: [

{
name: "Bubbles Of Hydro",
mana: 30,
cooldown: 200,
mastery: 5,
cast: castBubblesOfHydro
},

{
name: "Whirlpool",
mana: 40,
cooldown: 800,
mastery: 25,
cast: castWhirlpool
},

{
name: "Water Shuriken",
mana: 10,
cooldown: 200,
mastery: 50,
cast: castWaterShuriken
},

{
name: "Jet Snipe",
mana: 10,
cooldown: 100,
mastery: 75,
cast: castJetSnipe
},

{
name: "Water Drill",
mana: 20,
cooldown: 100,
mastery: 100,
cast: castWaterDrill
}

],

air: [

{
name: "Wind Arrow",
mana: 10,
cooldown: 60,
mastery: 5,
cast: castWindArrow
},

{
name: "Wind Camouflage",
mana: 20,
cooldown: 300,
mastery: 25
},

{
name: "One With The Winds",
mana: 10,
cooldown: 50,
mastery: 50

},

{
name: "Wind Slashes",
mana: 20,
cooldown: 100,
mastery: 75

},

{
name: "Vortex Of Vaccum",
mana: 35,
cooldown: 200,
mastery: 100
}
]
}

/* ======================
SPELLS GOING FORWARD
====================== */

//FLAMETHROWER 

function castFlamethrower(player){

if(getMastery(player) < 5){
player.sendMessage("§cRequires 5 mastery")
return
}

const spellIndex = currentSpell.get(player.id) ?? 0
const key = `${player.id}:${spellIndex}`

const cd = cooldowns.get(key) ?? 0

if(system.currentTick < cd){
player.sendMessage("§7Spell on cooldown")
return
}

if(!spendMana(player,20)){
player.sendMessage("§cNot enough mana")
return
}

cooldowns.set(key, system.currentTick + 200)

let ticks = 0

player.addEffect("minecraft:slowness", 100, {
 amplifier: 4,
 showParticles: false
})

const task = system.runInterval(()=>{

ticks++

const dir = player.getViewDirection()

for(let i=1;i<=6;i++){

const x = player.location.x + dir.x * i
const y = player.location.y + 1
const z = player.location.z + dir.z * i


const pos = { x: x, y: y, z: z }
player.dimension.spawnParticle("minecraft:basic_flame_particle", pos)

}

const view = player.getViewDirection()

for(const e of player.dimension.getEntities({
location:player.location,
maxDistance:5
})){

if(e === player) continue

const dx = e.location.x - player.location.x
const dy = e.location.y - player.location.y
const dz = e.location.z - player.location.z

const dist = Math.sqrt(dx*dx + dy*dy + dz*dz)

if(dist === 0) continue

const nx = dx/dist
const ny = dy/dist
const nz = dz/dist

const dot = nx*view.x + ny*view.y + nz*view.z

if(dot > 0.8){ // in front of player

if (e.hasComponent("minecraft:health")) {
    applyFireDamage(player, e, 2)
}

}

}

if(ticks >= 100){

system.clearRun(task)

}

},1)

}

//FIREY BOMB

function castFireyBomb(player){

const spellIndex = currentSpell.get(player.id) ?? 0
const key = `${player.id}:${spellIndex}`

const cd = cooldowns.get(key) ?? 0

if(system.currentTick < cd){
player.sendMessage("§7Spell on cooldown")
return
}

const manaCost = 10

if(!spendMana(player,manaCost)){
player.sendMessage("§cNot enough mana")
return
}

cooldowns.set(key, system.currentTick + 120) // 6 seconds

const dir = player.getViewDirection()

let pos = {
 x: player.location.x,
 y: player.location.y + 1.5,
 z: player.location.z
}

let ticks = 0

const projectile = system.runInterval(()=>{

ticks++

pos.x += dir.x * 0.6
pos.y += dir.y * 0.6
pos.z += dir.z * 0.6

for(let i = 0; i < 6; i++){

 const trail = {
  x: pos.x - dir.x * (i * 0.15),
  y: pos.y - dir.y * (i * 0.15),
  z: pos.z - dir.z * (i * 0.15)
 }

 player.dimension.spawnParticle(
  "minecraft:basic_flame_particle",
  trail
 )

}

player.dimension.spawnParticle("minecraft:large_smoke_particle", pos)

const nearby = player.dimension.getEntities({
 location: pos,
 maxDistance: 1
})

for(const e of nearby){

if(e === player) continue

explode(pos)
system.clearRun(projectile)
return

}

if(ticks > 18){

explode(pos)
system.clearRun(projectile)

}

},1)

function explode(location){

// Create explosion effect only (no damage, no blocks broken by this call)
player.dimension.createExplosion(
 location,
 0,  // ← Change to 0 so explosion doesn't do damage
 {
  breaksBlocks: false,
  causesFire: false
 }
)

// YOUR custom damage
for(const e of player.dimension.getEntities({
 location: location,
 maxDistance: 4
})){

if(!e.hasComponent("minecraft:health")) continue

applyFireDamage(player, e, 3)

}

// fire on ground
for(let x=-2;x<=2;x++){
for(let z=-2;z<=2;z++){

const firePos = {
 x: location.x + x,
 y: location.y,
 z: location.z + z
}

player.dimension.runCommandAsync(
`setblock ${Math.floor(firePos.x)} ${Math.floor(firePos.y)} ${Math.floor(firePos.z)} fire [] keep`
)

}
}

}
}

// FLAME JET (travel spell)

function castFlameJet(player){

if(getMastery(player) < 50){
player.sendMessage("§cRequires 50 mastery")
return
}

const spellIndex = currentSpell.get(player.id) ?? 0
const key = `${player.id}:${spellIndex}`

const cd = cooldowns.get(key) ?? 0

if(system.currentTick < cd){
player.sendMessage("§7Spell on cooldown")
return
}

cooldowns.set(key, system.currentTick + 50) // 2.5 seconds

if(!spendMana(player,10)){
player.sendMessage("§cNot enough mana")
return
}

let ticks = 0

const task = system.runInterval(()=>{

// stop if player stopped sneaking
if(!player.isSneaking){
system.clearRun(task)
return
}

ticks++

player.addEffect("minecraft:slow_falling", 10, {showParticles:false})

// mana drain
if(ticks % 5 === 0){
 if(!spendMana(player,1)){
  system.clearRun(task)
  return
 }
}

const dir = player.getViewDirection()

player.applyKnockback(dir.x, dir.z, 0.7, 0.2)

player.applyImpulse({
 x: 0,
 y: dir.y * 0.6,
 z: 0
})

for(let i = 0; i < 3; i++){

const pos = {
x: player.location.x,
y: player.location.y + 0.5,
z: player.location.z
}

player.dimension.spawnParticle(
"minecraft:basic_flame_particle",
pos
)

}
},1)

}
// FLAME REPULSION

function castFlameRepulsion(player){

const spellIndex = currentSpell.get(player.id) ?? 0
const key = `${player.id}:${spellIndex}`

const cd = cooldowns.get(key) ?? 0

if(system.currentTick < cd){
player.sendMessage("§7Spell on cooldown")
return
}

if(!spendMana(player,10)){
player.sendMessage("§cNot enough mana")
return
}

cooldowns.set(key, system.currentTick + 100)

// knockback + damage

for(const e of player.dimension.getEntities({
 location: player.location,
 maxDistance: 3
})){

if(e === player) continue
if(!e.hasComponent("minecraft:health")) continue

const dx = e.location.x - player.location.x
const dz = e.location.z - player.location.z

const dist = Math.sqrt(dx*dx + dz*dz)
if(dist === 0) continue

const nx = dx/dist
const nz = dz/dist

// damage
applyFireDamage(player, e, 3)

// repel
e.applyKnockback(nx, nz, 1.5, 0.3)

}

// expanding flame circle

let radius = 0

player.runCommandAsync("playsound random.explode @s")

const effect = system.runInterval(()=>{

radius += 0.4

for(let a=0; a<360; a+=15){

const rad = a * Math.PI / 180

const x = player.location.x + Math.cos(rad) * radius
const z = player.location.z + Math.sin(rad) * radius

const pos = {
 x: x,
 y: player.location.y + 0.1,
 z: z
}

player.dimension.spawnParticle(
 "minecraft:basic_flame_particle",
 pos
)

}

if(radius >= 3){
 system.clearRun(effect)
}

},1)

}

//DRACONIC FIRE

function castDraconicFire(player){

if(getMastery(player) < 100){
player.sendMessage("§cRequires 100 mastery")
return
}

const spellIndex = currentSpell.get(player.id) ?? 0
const key = `${player.id}:${spellIndex}`

const cd = cooldowns.get(key) ?? 0

if(system.currentTick < cd){
player.sendMessage("§7Spell on cooldown")
return
}

if(!spendMana(player,30)){
player.sendMessage("§cNot enough mana")
return
}

cooldowns.set(key, system.currentTick + 240)

const dir = player.getViewDirection()

let pos = {
 x: player.location.x,
 y: player.location.y + 1.5,
 z: player.location.z
}

let ticks = 0

player.runCommandAsync("playsound mob.enderdragon.growl @s")

const dragon = system.runInterval(()=>{

ticks++

/* ======================
DRAGON MOVEMENT
====================== */

pos.x += dir.x * 0.8
pos.y += dir.y * 0.6
pos.z += dir.z * 0.8


/* ======================
DRAGON BODY
====================== */

for(let i = 0; i < 12; i++){

const body = {
 x: pos.x - dir.x * (i * 0.4),
 y: pos.y - dir.y * (i * 0.2),
 z: pos.z - dir.z * (i * 0.4)
}

player.dimension.spawnParticle(
"minecraft:basic_flame_particle",
body
)

player.dimension.spawnParticle(
"minecraft:large_smoke_particle",
body
)

}


/* ======================
DRAGON WINGS
====================== */

for(let w = -1; w <= 1; w += 2){

const wing = {
 x: pos.x + dir.z * w * 1.5,
 y: pos.y + Math.sin(ticks * 0.5) * 0.6,
 z: pos.z - dir.x * w * 1.5
}

player.dimension.spawnParticle(
"minecraft:basic_flame_particle",
wing
)

}


/* ======================
DRAGON HEAD
====================== */

player.dimension.spawnParticle(
"minecraft:basic_flame_particle",
pos
)

player.dimension.spawnParticle(
"minecraft:basic_flame_particle",
pos
)


/* ======================
DAMAGE
====================== */

for(const e of player.dimension.getEntities({
 location: pos,
 maxDistance: 2
})){

if(e === player) continue
if(!e.hasComponent("minecraft:health")) continue

applyFireDamage(player, e, 7)
e.setOnFire(5)

}


/* ======================
END RANGE
====================== */

if(ticks > 30){
system.clearRun(dragon)
}

},1)

}

/*=====================
Water Magic
=======================*/
// BUBBLES OF HYDRO

function castBubblesOfHydro(player){

if(getMastery(player) < 5){
player.sendMessage("§cRequires 5 mastery")
return
}

const spellIndex = currentSpell.get(player.id) ?? 0
const key = `${player.id}:${spellIndex}`

const cd = cooldowns.get(key) ?? 0

if(system.currentTick < cd){
 player.sendMessage("§7Spell on cooldown")
 return
}

cooldowns.set(key, system.currentTick + 200)

if(!spendMana(player,30)){
player.sendMessage("§cNot enough mana")
return
}

player.addEffect("minecraft:water_breathing",200000,{showParticles:false})

const task = system.runInterval(()=>{

if(!player.isInWater){
system.clearRun(task)
player.runCommandAsync("effect @s clear water_breathing")
return
}

for(let a=0;a<360;a+=30){

const rad = a*Math.PI/180

const x = player.location.x + Math.cos(rad)*1.2
const z = player.location.z + Math.sin(rad)*1.2

player.dimension.spawnParticle(
 "minecraft:basic_bubble_particle",
 {x:x,y:player.location.y+1,z:z}
)

}
},5)

}

//WHIRLPOOL


function castWhirlpool(player){

if(getMastery(player) < 25){
player.sendMessage("§cRequires 25 mastery")
return
}

const spellIndex = currentSpell.get(player.id) ?? 0
const key = `${player.id}:${spellIndex}`

const cd = cooldowns.get(key) ?? 0

if(system.currentTick < cd){
 player.sendMessage("§7Spell on cooldown")
 return
}

cooldowns.set(key, system.currentTick + 800)

if(!spendMana(player,40)){
player.sendMessage("§cNot enough mana")
return
}

const view = player.getBlockFromViewDirection()?.block
if(!view) return

const center = view.location

player.runCommandAsync(
`playsound ambient.underwater.loop @a[r=20] ${center.x} ${center.y} ${center.z}`
)

let ticks = 0
let rotation = 0

const whirl = system.runInterval(()=>{

ticks++
rotation += 8

/* ======================
MAIN SPIRAL
====================== */

for(let r = 1; r <= 10; r+=0.6){

const angle = (rotation + r * 40) * Math.PI/180

const x = center.x + Math.cos(angle) * r
const z = center.z + Math.sin(angle) * r

const y = center.y + Math.sin((rotation+r)*0.05) * 0.6

player.dimension.spawnParticle(
"minecraft:water_splash_particle",
{x:x,y:y+0.1,z:z}
)

}

/* ======================
UPWARD WATER COLUMN
====================== */

for(let h=0; h<6; h+=0.4){

const x = center.x + Math.cos((rotation+h)*0.1)*0.8
const z = center.z + Math.sin((rotation+h)*0.1)*0.8

player.dimension.spawnParticle(
"minecraft:water_splash_particle",
{x:x,y:center.y+h,z:z}
)

}

/* ======================
OUTER RING WAVES
====================== */

for(let a=0; a<360; a+=20){

const rad = (a + rotation) * Math.PI/180

const x = center.x + Math.cos(rad)*10
const z = center.z + Math.sin(rad)*10

player.dimension.spawnParticle(
"minecraft:water_splash_particle",
{x:x,y:center.y+0.05,z:z}
)

}

/* ======================
PULL + DAMAGE
====================== */

for(const e of player.dimension.getEntities({
 location:center,
 maxDistance:10
})){

if(e === player) continue
if(!e.hasComponent("minecraft:health")) continue

const dx = center.x - e.location.x
const dz = center.z - e.location.z

const dist = Math.sqrt(dx*dx + dz*dz)
if(dist === 0) continue

const nx = dx/dist
const nz = dz/dist

/* pull toward center */

e.applyKnockback(nx,nz,0.6,0.15)

/* damage every second */

if(ticks % 20 === 0){
e.applyDamage(1)
}

}

/* ======================
END SPELL
====================== */

if(ticks >= 200){
system.clearRun(whirl)

player.runCommandAsync(
`playsound random.splash @a[r=20] ${center.x} ${center.y} ${center.z}`
)

}

},1)

}

//WATER SHURIKEN

function castWaterShuriken(player){


if(getMastery(player) < 50){
player.sendMessage("§cRequires 50 mastery")
return
}

const spellIndex = currentSpell.get(player.id) ?? 0
const key = `${player.id}:${spellIndex}`

const cd = cooldowns.get(key) ?? 0

if(system.currentTick < cd){
 player.sendMessage("§7Spell on cooldown")
 return
}

const manaCost = 10

if(!spendMana(player,10)){
player.sendMessage("§cNot enough mana")
return
}


cooldowns.set(key, system.currentTick + 200)

const dim = player.dimension
const origin = player.getHeadLocation()
const dir = player.getViewDirection()

player.runCommandAsync(`playsound random.splash @a ${origin.x} ${origin.y} ${origin.z}`)

const spread = [-0.2, 0, 0.2]

for(const offset of spread){

let pos = {
x: origin.x,
y: origin.y,
z: origin.z
}

let velocity = {
x: dir.x + offset,
y: dir.y,
z: dir.z + offset
}

let ticks = 0

const proj = system.runInterval(()=>{

ticks++

pos.x += velocity.x * 0.8
pos.y += velocity.y * 0.8
pos.z += velocity.z * 0.8

// main shuriken particle
dim.spawnParticle("minecraft:water_splash_particle", pos)

// star shape
dim.spawnParticle("minecraft:water_splash_particle", {x:pos.x+0.2,y:pos.y,z:pos.z})
dim.spawnParticle("minecraft:water_splash_particle", {x:pos.x-0.2,y:pos.y,z:pos.z})
dim.spawnParticle("minecraft:water_splash_particle", {x:pos.x,y:pos.y,z:pos.z+0.2})
dim.spawnParticle("minecraft:water_splash_particle", {x:pos.x,y:pos.y,z:pos.z-0.2})

// trail
dim.spawnParticle("minecraft:water_splash_particle", pos)

for (const entity of dim.getEntities({
 location: pos,
 maxDistance: 1.5,
 excludeTypes: ["minecraft:item"]
})) {

 if (entity === player) continue
 if (!entity.hasComponent("minecraft:health")) continue

 entity.applyDamage(2)

 dim.spawnParticle("minecraft:water_splash_particle", pos)
 dim.spawnParticle("minecraft:water_splash_particle", pos)

 player.runCommandAsync(`playsound random.splash @a[r=10] ${pos.x} ${pos.y} ${pos.z}`)

 system.clearRun(proj)
 return
}

if(ticks > 30){
system.clearRun(proj)
}

},1)

}
}

// Jet Snipe

function castJetSnipe(player){

if(getMastery(player) < 75){
 player.sendMessage("§cRequires 75 mastery")
 return
}

const spellIndex = currentSpell.get(player.id) ?? 0
const key = `${player.id}:${spellIndex}`

const cd = cooldowns.get(key) ?? 0

if(system.currentTick < cd){
 player.sendMessage("§7Spell on cooldown")
 return
}

cooldowns.set(key, system.currentTick + 100)

if(!spendMana(player,10)){
 player.sendMessage("§cNot enough mana")
 return
}

/* recoil damage (finger damage) */
player.applyDamage(2)

/* sound */
player.runCommandAsync("playsound random.splash @s")

const dir = player.getViewDirection()

let pos = {
 x: player.location.x,
 y: player.location.y + 1.5,
 z: player.location.z
}

let distance = 0

while(distance < 20){

distance += 0.7

pos.x += dir.x * 0.7
pos.y += dir.y * 0.7
pos.z += dir.z * 0.7

/* ======================
MAIN WATER BEAM
====================== */

player.dimension.spawnParticle(
"minecraft:water_splash_particle",
pos
)

/* ======================
PRESSURE RINGS
====================== */

for(let a=0;a<360;a+=60){

const rad = a*Math.PI/180

const x = pos.x + Math.cos(rad)*0.25
const z = pos.z + Math.sin(rad)*0.25

player.dimension.spawnParticle(
"minecraft:water_splash_particle",
{x:x,y:pos.y,z:z}
)

}

/* ======================
VAPOR TRAIL
====================== */

player.dimension.spawnParticle(
"minecraft:water_splash_particle",
pos
)

/* ======================
HIT DETECTION
====================== */

for(const e of player.dimension.getEntities({
 location: pos,
 maxDistance: 1
})){

 if(e === player) continue
 if(!e.hasComponent("minecraft:health")) continue

 e.applyDamage(4)

 player.dimension.spawnParticle(
 "minecraft:water_splash_particle",
 pos
 )

 player.runCommandAsync(
 `playsound random.splash @a[r=10] ${pos.x} ${pos.y} ${pos.z}`
 )

 return
}

}
}

// Water Drill

function castWaterDrill(player){

if(getMastery(player) < 100){
player.sendMessage("§cRequires 100 mastery")
return
}

const spellIndex = currentSpell.get(player.id) ?? 0
const key = `${player.id}:${spellIndex}`

const cd = cooldowns.get(key) ?? 0

if(system.currentTick < cd){
 player.sendMessage("§7Spell on cooldown")
 return
}

cooldowns.set(key, system.currentTick + 100)

if(!spendMana(player,20)){
player.sendMessage("§cNot enough mana")
return
}

/* ======================
CHARGING PHASE
====================== */

player.sendMessage("Charging Water Drill, Wait Two Seconds")

let charge = 0
let rotation = 0

player.runCommandAsync("playsound random.splash @s")

const charging = system.runInterval(()=>{

charge++
rotation += 15

for(let r = 0.5; r <= 2; r+=0.4){

const angle = (rotation + r*60) * Math.PI/180

const x = player.location.x + Math.cos(angle)*r
const z = player.location.z + Math.sin(angle)*r

player.dimension.spawnParticle(
"minecraft:water_splash_particle",
{x:x,y:player.location.y+1,z:z}
)

}

if(charge >= 40){

system.clearRun(charging)
launchDrill()

}

},1)


/* ======================
DRILL PROJECTILE
====================== */

function launchDrill(){

player.runCommandAsync("playsound random.splash @a[r=20]")

const dir = player.getViewDirection()

let pos = {
x:player.location.x,
y:player.location.y+1.5,
z:player.location.z
}

let ticks = 0
let spin = 0

const drill = system.runInterval(()=>{

ticks++
spin += 25

pos.x += dir.x * 0.9
pos.y += dir.y * 0.9
pos.z += dir.z * 0.9

/* ======================
DRILL SPIRAL
====================== */

for(let i=0;i<6;i++){

const angle = (spin + i*60) * Math.PI/180

const radius = 0.6

const x = pos.x + Math.cos(angle)*radius
const y = pos.y + (i*0.05)
const z = pos.z + Math.sin(angle)*radius

player.dimension.spawnParticle(
"minecraft:water_splash_particle",
{x:x,y:y,z:z}
)

}

/* ======================
DRILL TIP
====================== */

player.dimension.spawnParticle(
"minecraft:water_splash_particle",
pos
)

player.dimension.spawnParticle(
"minecraft:water_splash_particle",
pos
)

/* ======================
CONE TRAIL
====================== */

for(let c=0;c<4;c++){

const back = {
x:pos.x - dir.x*(c*0.6),
y:pos.y - dir.y*(c*0.6),
z:pos.z - dir.z*(c*0.6)
}

player.dimension.spawnParticle(
"minecraft:water_splash_particle",
back
)

}

/* ======================
DAMAGE
====================== */

for(const e of player.dimension.getEntities({
location:pos,
maxDistance:1.5
})){

if(e === player) continue
if(!e.hasComponent("minecraft:health")) continue

e.applyDamage(6)

player.dimension.spawnParticle(
"minecraft:water_splash_particle",
pos
)

system.clearRun(drill)
return

}

/* ======================
MAX RANGE
====================== */

if(ticks > 30){
system.clearRun(drill)
}

},1)

}

}



/*=====================
Air Magic
=======================*/

// WIND ARROW

function castWindArrow(player){

if(getMastery(player) < 5){
 player.sendMessage("§cRequires 5 mastery")
 return
}

const spellIndex = currentSpell.get(player.id) ?? 0
const key = `${player.id}:${spellIndex}`

const cd = cooldowns.get(key) ?? 0

if(system.currentTick < cd){
 player.sendMessage("§7Spell on cooldown")
 return
}

if(!spendMana(player,10)){
 player.sendMessage("§cNot enough mana")
 return
}

cooldowns.set(key, system.currentTick + 60)

const dim = player.dimension
const origin = player.getHeadLocation()
const dir = player.getViewDirection()

player.runCommandAsync("playsound random.bow @s")

let pos = {
 x: origin.x,
 y: origin.y,
 z: origin.z
}

let ticks = 0
let spin = 0

const projectile = system.runInterval(()=>{

ticks++
spin += 20

/* ======================
MOVEMENT
====================== */

pos.x += dir.x * 0.9
pos.y += dir.y * 0.9
pos.z += dir.z * 0.9


/* ======================
ARROW TIP
====================== */

dim.spawnParticle(
"minecraft:basic_smoke_particle",
pos
)

dim.spawnParticle(
"minecraft:basic_smoke_particle",
pos
)


/* ======================
WIND SPIRAL
====================== */

for(let i=0;i<4;i++){

const angle = (spin + i*90) * Math.PI/180

const radius = 0.35

const x = pos.x + Math.cos(angle)*radius
const y = pos.y + Math.sin(spin*0.05)*0.05
const z = pos.z + Math.sin(angle)*radius

dim.spawnParticle(
"minecraft:basic_smoke_particle",
{x:x,y:y,z:z}
)

}


/* ======================
ARROW TRAIL
====================== */

for(let t=1;t<=4;t++){

const trail = {
x: pos.x - dir.x*(t*0.6),
y: pos.y - dir.y*(t*0.6),
z: pos.z - dir.z*(t*0.6)
}

dim.spawnParticle(
"minecraft:basic_smoke_particle",
trail
)

}


/* ======================
HIT DETECTION
====================== */

for(const e of dim.getEntities({
location: pos,
maxDistance: 1.2
})){

if(e === player) continue
if(!e.hasComponent("minecraft:health")) continue

e.applyDamage(3)

player.runCommandAsync(
`playsound random.pop @a[r=10] ${pos.x} ${pos.y} ${pos.z}`
)

/* IMPACT BURST */

for(let a=0;a<360;a+=20){

const rad = a*Math.PI/180

const burst = {
x: pos.x + Math.cos(rad)*0.7,
y: pos.y,
z: pos.z + Math.sin(rad)*0.7
}

dim.spawnParticle(
"minecraft:basic_smoke_particle",
burst
)

}

system.clearRun(projectile)
return

}


/* ======================
MAX RANGE (10 BLOCKS)
====================== */

if(ticks > 11){
system.clearRun(projectile)
}

},1)

}

/* ======================
RARITY SYSTEM
====================== */

const magicRarity = {

fire:"§7Common",
water:"§7Common",
earth:"§7Common",
air:"§7Common",

ice:"§aUncommon",

thunder:"§9Rare",

venom:"§5Epic",

light:"§eLegendary",
dark:"§eLegendary",
blood:"§eLegendary"

}

/* ======================
CELESTIAL RECOGNITION
====================== */

system.run(()=>{

try{
world.scoreboard.addObjective(
"celestial_recognition",
"Celestial Recognition"
)
}catch{}

})

const obj="celestial_recognition"

function getCR(player){

const o=world.scoreboard.getObjective(obj)
if(!o) return 0

try{
return o.getScore(player.scoreboardIdentity) ?? 0
}catch{
return 0
}

}

function addCR(player,a){
player.runCommandAsync(`scoreboard players add @s ${obj} ${a}`)
}

function removeCR(player,a){
player.runCommandAsync(`scoreboard players remove @s ${obj} ${a}`)
}

/* ======================
FIRST JOIN REWARD
====================== */

world.afterEvents.playerSpawn.subscribe(e => {

const player = e.player

// Only run first spawn
if(!e.initialSpawn) return

// If player already joined before do nothing
if(player.hasTag("joined")) return

// Give Celestial Recognition
addCR(player,1)
})

/* ======================
BOSS DROPS
====================== */

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

if(Math.random()<0.25){

addCR(killer,1)

killer.sendMessage("§dYou obtained Celestial Recognition")

}

})

/* ======================
GACHA POOL (PERCENTAGE BASED)
====================== */

const gachaPools = {
  common: ["fire", "water", "air"],      // 45% total
  uncommon: ["thunder", "earth"],                              // 25%
  rare: ["ice"],                              // 15%
  epic: ["venom"],                                // 10%
  legendary: ["light", "dark", "blood"]           // 5%
}

const gachaRates = {
  common: 45,
  uncommon: 25,
  rare: 15,
  epic: 10,
  legendary: 5
}

function rollGacha() {
  const roll = Math.random() * 100
  let accumulated = 0

  for (const [rarity, rate] of Object.entries(gachaRates)) {
    accumulated += rate
    
    if (roll < accumulated) {
      const pool = gachaPools[rarity]
      return pool[Math.floor(Math.random() * pool.length)]
    }
  }
  
  // Fallback (shouldn't reach here)
  return "fire"
}

/* ======================
MAGIC GUI
====================== */

export function openMagicUI(player){

const cr=getCR(player)
const magic=currentMagic(player) ?? "None"

const form=new ActionFormData()

.title("Magic Affinity")

.body(
`§7Common 45%
§aUncommon 25%
§9Rare 15%
§5Epic 10%
§eLegendary 5%

§dCelestial Recognition: ${cr}

§bCurrent Magic: ${magic} §7(${magicRarity[magic] ?? "Unknown"})`
)

.button("Reroll Magic")
.button("Go Back")

form.show(player).then(async r=>{

if(r.selection!==0) return

if(getCR(player)<1){
player.sendMessage("§cNot enough Celestial Recognition")
return
}

removeCR(player,1)

/* Gacha pool */

function waitTicks(ticks){
 return new Promise(resolve=>{
  system.runTimeout(resolve,ticks)
 })
}

async function animation(){

player.sendMessage("§6Rerolling magic...")

for(let i=0;i<15;i++){

const preview = rollGacha()

player.onScreenDisplay.setActionBar(
`§dRolling... §f${preview}`
)

await waitTicks(4)

}

const result = rollGacha()

player.dimension.spawnParticle(
 "minecraft:totem_particle",
 player.location
)

player.runCommandAsync(
`playsound random.levelup @s`
)

return result

}

const newMagic=await animation()

setMagic(player,newMagic)

player.sendMessage(`§bNew Magic: ${newMagic}`)

})

}