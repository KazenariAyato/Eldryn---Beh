import { system, world } from '@minecraft/server';
import { decrementStack, getOppositeDirection, DirectionType, cardinalSides, randomFunction } from './utils/helper';
import { directionToVector3 } from './utils/math';

function durabilityOnChanged(item, player, isHitEntity = false) {
    let level = item.getComponent("minecraft:enchantable")?.getEnchantment("unbreaking")?.level;

    function durability() {
        let durability = item.getComponent("minecraft:durability");

        const t = Math.floor(Math.random() * 100);

        if (t < durability.getDamageChance()) {
            if (!isHitEntity) durability.damage += 1;
            if (durability.damage >= durability.maxDurability) {
                player.playSound("random.break");
                if (!isHitEntity) player.getComponent('equippable').setEquipment('Mainhand', undefined)
            } else {
                if (!isHitEntity) player.getComponent('equippable').setEquipment('Mainhand', item)
            }
        } else {
            if (!isHitEntity) return;
            durability.damage -= 1;
            if (!isHitEntity) player.getComponent('equippable').setEquipment('Mainhand', item);
        }
    }

    const t = Math.floor(Math.random() * 10)
    if (level === 1 && t > 8) return;
    else if (level === 2 && t > 6) return;
    else if (level === 3 && t > 4) return;
    else durability();
}

world.beforeEvents.worldInitialize.subscribe(initEvent => { initEvent.itemComponentRegistry.registerCustomComponent('cb_tentacle_sword:trigger', {
  
  
  onHitEntity: e => { durabilityOnChanged(e.itemStack, e.source, true); },
  onMineBlock: e => { durabilityOnChanged(e.itemStack, e.source, false); },
});

initEvent.itemComponentRegistry.registerCustomComponent('cb_red_orb:trigger', {
  onUse: e => { durabilityOnChanged(e.itemStack, e.source, false);
e.source.runCommand("function offhandredorb"); },
  onUseOn: e => { durabilityOnChanged(e.itemStack, e.source, false);
e.source.runCommand("function offhandredorb"); },
  onHitEntity: e => { durabilityOnChanged(e.itemStack, e.source, true); },
  onMineBlock: e => { durabilityOnChanged(e.itemStack, e.source, false); },
});

initEvent.itemComponentRegistry.registerCustomComponent('cb_xp_viole:trigger', {
  
  
  onHitEntity: e => { durabilityOnChanged(e.itemStack, e.source, true); },
  onMineBlock: e => { durabilityOnChanged(e.itemStack, e.source, false); },
});

initEvent.itemComponentRegistry.registerCustomComponent('cb_xp_viole_5:trigger', {
  
  
  onHitEntity: e => { durabilityOnChanged(e.itemStack, e.source, true); },
  onMineBlock: e => { durabilityOnChanged(e.itemStack, e.source, false); },
});

initEvent.itemComponentRegistry.registerCustomComponent('cb_xp_viole_4:trigger', {
  
  
  onHitEntity: e => { durabilityOnChanged(e.itemStack, e.source, true); },
  onMineBlock: e => { durabilityOnChanged(e.itemStack, e.source, false); },
});

initEvent.itemComponentRegistry.registerCustomComponent('cb_xp_viole_2:trigger', {
  
  
  onHitEntity: e => { durabilityOnChanged(e.itemStack, e.source, true); },
  onMineBlock: e => { durabilityOnChanged(e.itemStack, e.source, false); },
});

initEvent.itemComponentRegistry.registerCustomComponent('cb_xp_viole_3:trigger', {
  
  
  onHitEntity: e => { durabilityOnChanged(e.itemStack, e.source, true); },
  onMineBlock: e => { durabilityOnChanged(e.itemStack, e.source, false); },
});

initEvent.itemComponentRegistry.registerCustomComponent('cb_xp_viole_1:trigger', {
  
  
  onHitEntity: e => { durabilityOnChanged(e.itemStack, e.source, true); },
  onMineBlock: e => { durabilityOnChanged(e.itemStack, e.source, false); },
});

initEvent.itemComponentRegistry.registerCustomComponent('cb_orb_of_absorption_2:trigger', {
  onConsume: e => {
  e.source.addEffect("minecraft:absorption", 1200, {amplifier: 2});
  
},

  
});

initEvent.itemComponentRegistry.registerCustomComponent('cb_orb_of_regeneration_3:trigger', {
  onConsume: e => {
  e.source.addEffect("minecraft:regeneration", 1200, {amplifier: 3});
  
},

  
});

initEvent.itemComponentRegistry.registerCustomComponent('cb_orb_of_absorption_3:trigger', {
  onConsume: e => {
  e.source.addEffect("minecraft:absorption", 1200, {amplifier: 3});
  
},

  
});

initEvent.itemComponentRegistry.registerCustomComponent('cb_orb_of_regeneration:trigger', {
  onConsume: e => {
  e.source.addEffect("minecraft:regeneration", 1200, {amplifier: 1});
  
},

  
});

initEvent.itemComponentRegistry.registerCustomComponent('cb_orb_of_regeneration_2:trigger', {
  onConsume: e => {
  e.source.addEffect("minecraft:regeneration", 1200, {amplifier: 2});
  
},

  
});

initEvent.itemComponentRegistry.registerCustomComponent('cb_orb_of_absorption_1:trigger', {
  onConsume: e => {
  e.source.addEffect("minecraft:absorption", 1200, {amplifier: 1});
  
},

  
});

initEvent.itemComponentRegistry.registerCustomComponent('cb_orb_of_resistance:trigger', {
  onConsume: e => {
  e.source.addEffect("minecraft:resistance", 1200, {amplifier: 1});
  
},

  
});

initEvent.itemComponentRegistry.registerCustomComponent('cb_orb_of_speed:trigger', {
  onConsume: e => {
  e.source.addEffect("minecraft:speed", 1200, {amplifier: 1});
  
},

  
});

initEvent.itemComponentRegistry.registerCustomComponent('cb_orb_of_speed_3:trigger', {
  onConsume: e => {
  e.source.addEffect("minecraft:speed", 1200, {amplifier: 3});
  
},

  
});

initEvent.itemComponentRegistry.registerCustomComponent('cb_orb_of_fire_immunity:trigger', {
  onConsume: e => {
  e.source.addEffect("minecraft:fire_resistance", 1200, {amplifier: 1});
  
},

  
});

initEvent.itemComponentRegistry.registerCustomComponent('cb_orb_of_resistance_2:trigger', {
  onConsume: e => {
  e.source.addEffect("minecraft:resistance", 1200, {amplifier: 2});
  
},

  
});

initEvent.itemComponentRegistry.registerCustomComponent('cb_orb_of_resistance_3:trigger', {
  onConsume: e => {
  e.source.addEffect("minecraft:resistance", 1200, {amplifier: 3});
  
},

  
});

initEvent.itemComponentRegistry.registerCustomComponent('cb_orb_of_speed_2:trigger', {
  onConsume: e => {
  e.source.addEffect("minecraft:speed", 1200, {amplifier: 2});
  
},

  
});

initEvent.itemComponentRegistry.registerCustomComponent('cb_main_dark_staff:trigger', {
  onUse: e => { durabilityOnChanged(e.itemStack, e.source, false);
e.source.runCommand("function summondirewolves"); },
  onUseOn: e => { durabilityOnChanged(e.itemStack, e.source, false);
e.source.runCommand("function summondirewolves"); },
  onHitEntity: e => { durabilityOnChanged(e.itemStack, e.source, true); 
const functions = ["summondirewolves"];
          e.attackingEntity.runCommand(`function ${randomFunction(functions)}`);
           },
  onMineBlock: e => { durabilityOnChanged(e.itemStack, e.source, false); 
const functions = ["summondirewolves"];
          e.source.runCommand(`function ${randomFunction(functions)}`);
           },
});

initEvent.itemComponentRegistry.registerCustomComponent('cb_frost_dagger:trigger', {
  
  
  onHitEntity: e => { durabilityOnChanged(e.itemStack, e.source, true); e.attackingEntity.runCommand("function frozeneffect"); },
  onMineBlock: e => { durabilityOnChanged(e.itemStack, e.source, false); },
});

initEvent.itemComponentRegistry.registerCustomComponent('cb_frost_viole:trigger', {
  
  
  onHitEntity: e => { durabilityOnChanged(e.itemStack, e.source, true); },
  onMineBlock: e => { durabilityOnChanged(e.itemStack, e.source, false); },
});

initEvent.itemComponentRegistry.registerCustomComponent('cb_krakens_fang:trigger', {
  
  
  onHitEntity: e => { durabilityOnChanged(e.itemStack, e.source, true); 
const functions = ["krakensfang"];
          e.attackingEntity.runCommand(`function ${randomFunction(functions)}`);
           },
  onMineBlock: e => { durabilityOnChanged(e.itemStack, e.source, false); },
});

initEvent.itemComponentRegistry.registerCustomComponent('cb_pheonix_blade:trigger', {
  
  
  onHitEntity: e => { durabilityOnChanged(e.itemStack, e.source, true); e.attackingEntity.runCommand("function pheonixaspect"); },
  onMineBlock: e => { durabilityOnChanged(e.itemStack, e.source, false); e.source.runCommand("function pheonixaspect"); },
});

initEvent.itemComponentRegistry.registerCustomComponent('cb_kitsune_claws:trigger', {
  
  
  onHitEntity: e => { durabilityOnChanged(e.itemStack, e.source, true); },
  onMineBlock: e => { durabilityOnChanged(e.itemStack, e.source, false); },
});

initEvent.itemComponentRegistry.registerCustomComponent('cb_crimson_viole:trigger', {
  
  
  onHitEntity: e => { durabilityOnChanged(e.itemStack, e.source, true); },
  onMineBlock: e => { durabilityOnChanged(e.itemStack, e.source, false); },
});

initEvent.itemComponentRegistry.registerCustomComponent('cb_xp_viole_6:trigger', {
  
  
  onHitEntity: e => { durabilityOnChanged(e.itemStack, e.source, true); },
  onMineBlock: e => { durabilityOnChanged(e.itemStack, e.source, false); },
});

initEvent.itemComponentRegistry.registerCustomComponent('cb_pheonix_blade_skin_dvsb:trigger', {
  
  
  onHitEntity: e => { durabilityOnChanged(e.itemStack, e.source, true); 
const functions = ["pheonixaspect"];
          e.attackingEntity.runCommand(`function ${randomFunction(functions)}`);
           },
  onMineBlock: e => { durabilityOnChanged(e.itemStack, e.source, false); e.source.runCommand("function pheonixaspect"); },
});

initEvent.itemComponentRegistry.registerCustomComponent('cb_wooden_bat:trigger', {
  
  
  onHitEntity: e => { durabilityOnChanged(e.itemStack, e.source, true); },
  onMineBlock: e => { durabilityOnChanged(e.itemStack, e.source, false); },
});

initEvent.itemComponentRegistry.registerCustomComponent('cb_iron_spiked_bat:trigger', {
  
  
  onHitEntity: e => { durabilityOnChanged(e.itemStack, e.source, true); },
  onMineBlock: e => { durabilityOnChanged(e.itemStack, e.source, false); },
});

initEvent.itemComponentRegistry.registerCustomComponent('cb_centaur_axe:trigger', {
  
  
  onHitEntity: e => { durabilityOnChanged(e.itemStack, e.source, true); },
  onMineBlock: e => { durabilityOnChanged(e.itemStack, e.source, false); },
});

initEvent.itemComponentRegistry.registerCustomComponent('cb_horned_beer:trigger', {
  onConsume: e => {
  e.source.addEffect("minecraft:nausea", 100, {amplifier: 1});
  
},

  
});

initEvent.itemComponentRegistry.registerCustomComponent('cb_vampiric_viole:trigger', {
  
  
  onHitEntity: e => { durabilityOnChanged(e.itemStack, e.source, true); },
  onMineBlock: e => { durabilityOnChanged(e.itemStack, e.source, false); },
});

initEvent.itemComponentRegistry.registerCustomComponent('cb_toxic_viole:trigger', {
  
  
  onHitEntity: e => { durabilityOnChanged(e.itemStack, e.source, true); },
  onMineBlock: e => { durabilityOnChanged(e.itemStack, e.source, false); },
});

initEvent.itemComponentRegistry.registerCustomComponent('cb_vampiric_greatsword:trigger', {
  
  
  onHitEntity: e => { durabilityOnChanged(e.itemStack, e.source, true); e.attackingEntity.runCommand("function withereffect"); },
  onMineBlock: e => { durabilityOnChanged(e.itemStack, e.source, false); },
});

initEvent.itemComponentRegistry.registerCustomComponent('cb_toxic_spear:trigger', {
  
  
  onHitEntity: e => { durabilityOnChanged(e.itemStack, e.source, true); e.attackingEntity.runCommand("function krakensfang"); },
  onMineBlock: e => { durabilityOnChanged(e.itemStack, e.source, false); },
});

initEvent.itemComponentRegistry.registerCustomComponent('cb_archanoweave:trigger', {
  onUse: e => {
        const equippable = e.source.getComponent("minecraft:equippable");
if (!equippable) return;
const mainhand = equippable.getEquipment("Mainhand");
if (!mainhand.hasItem()) return;
mainhand.amount++;
    },
});

initEvent.itemComponentRegistry.registerCustomComponent('cb_kraken_poison_shooter:trigger', {
  onUse: e => {
        const equippable = e.source.getComponent("minecraft:equippable");
if (!equippable) return;
const mainhand = equippable.getEquipment("Mainhand");
if (!mainhand.hasItem()) return;
mainhand.amount++;
    },
});
 });

