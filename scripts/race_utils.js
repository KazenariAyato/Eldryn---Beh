export const races = [
"human",
"forest_elf",
"fishman",
"angel",
"demon",
"ancient_elf",
"dark_elf",
"frost_elf",
"phantom",
"vampire"
];

export function currentRace(player){
for(const r of races){
if(player.hasTag("race_"+r)) return r
}
return null
}