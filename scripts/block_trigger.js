import { system, world } from '@minecraft/server';
import { decrementStack, getOppositeDirection, DirectionType, cardinalSides, randomFunction } from './utils/helper';
import { directionToVector3 } from './utils/math';

world.beforeEvents.worldInitialize.subscribe(initEvent => {
  initEvent.blockComponentRegistry.registerCustomComponent('cb_pheonix_heart:trigger', {
  onPlayerDestroy: e => { const randomizes = [{"run_command":{"command":["function pheonixtrueheart"],"target":"dimension"},"weight":9999}];

const resultRandom = Math.floor(Math.random() * 9999) + 1;

let weightStart = 0;

for (const element of randomizes) {
    if (element.weight != null) {
        if (typeof element.weight === "string") {
            element.weight = parseInt(element.weight) || 1;
        }

        if (
            resultRandom > 0 &&
            resultRandom >= weightStart &&
            resultRandom <= element.weight + weightStart
        ) {
            const randomizeType = Object.keys(element)[0];
            if (randomizeType === "add_mob_effect") {
                const effect = element.add_mob_effect.effect;
                const duration = element.add_mob_effect.duration;
                let amplifier = element.add_mob_effect.amplifier;
                if (typeof amplifier === "string") {
                    amplifier = parseInt(amplifier) || 1;
                }
                const target = element.add_mob_effect.target;

                if (target === "dimension") {
                    e.dimension.addEffect("minecraft:" + effect, duration * 20, { amplifier: amplifier });
                } else if (target === "player") {
                    e.player.addEffect("minecraft:" + effect, duration * 20, { amplifier: amplifier });
                } else {
                    e.entity.addEffect("minecraft:" + effect, duration * 20, { amplifier: amplifier });
                }
            }
            if (randomizeType === "remove_mob_effect") {
                const effect = element.remove_mob_effect.effect;
                const target = element.remove_mob_effect.target;

                if (target === "dimension") {
                    e.dimension.removeEffect("minecraft:" + effect);
                } else if (target === "player") {
                    e.player.removeEffect("minecraft:" + effect);
                } else {
                    e.entity.removeEffect("minecraft:" + effect);
                }
            }
            if (randomizeType === "run_command") {
                const commands = element.run_command.command;
                const target = element.run_command.target;
                for (const command of commands) {
                    if (target === "dimension") {
                        e.dimension.runCommand(command);
                    } else if (target === "player") {
                        e.player.runCommand(command);
                    } else {
                        e.entity.runCommand(command);
                    }
                }
            }
            break;
        }
        weightStart += element.weight;
    }
}
 },
});

});
