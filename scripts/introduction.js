import { world, system } from "@minecraft/server";

const INTRO_DURATION = 35 * 20;
const FADE_TIME = 2 * 20;
const DRONE_TIME = 31 * 20;

const INTRO_TAG = "intro_finished";

/* =========================================
   SUBTITLE SEQUENCE
========================================= */

const subtitles = [
    {
        text: '§e"Welcome To Bestiary Of The Ancient"',
        duration: 2
    },
    {
        text: '§e"Here Lies Many Monsters And Allies"',
        duration: 4
    },
    {
        text: '§e"Whether Within The Depths Of The Ocean, Sky Or In The Land"',
        duration: 4
    },
    {
        text: '§e"There Is Danger Everywhere"',
        duration: 3
    },
    {
        text: '§e"Though As The Player You Have Access To Multiple System"',
        duration: 4
    },
    {
        text: '§e"Such as"',
        duration: 1
    },
    {
        text: '§e"Stats, Magic And Races."',
        duration: 3
    },
    {
        text: '§e"In Order To Benefit From These Features"',
        duration: 3
    },
    {
        text: '§e"Open Your Adventurers Guide And Begin Your Journey"',
        duration: 4
    },
    {
        text: '§e"This Is The World Of Bestiary Of The Ancient"',
        duration: 3
    },
    {
        text: '§e"Welcome And Good Luck Surviving"',
        duration: 3
    }
];

/* =========================================
   PLAY SUBTITLES
========================================= */

function playSubtitles(player) {

    let delay = 0;

    for (const sub of subtitles) {

        system.runTimeout(() => {

            player.runCommandAsync(
                `title @s actionbar ${sub.text}`
            );

        }, delay);

        delay += sub.duration * 20;
    }
}

/* =========================================
   CAMERA EASING
========================================= */

function easeInOut(t) {

    return t < 0.5
        ? 2 * t * t
        : 1 - Math.pow(-2 * t + 2, 2) / 2;

}

/* =========================================
   INTRO SEQUENCE
========================================= */

world.afterEvents.playerSpawn.subscribe((ev) => {

    const player = ev.player;

    // Only play once ever
    if (player.hasTag(INTRO_TAG)) return;

    system.run(() => {

// Wait for player to fully load
        system.runTimeout(() => {
        /* =========================================
           LOCK PLAYER
        ========================================= */

        player.runCommandAsync(`inputpermission set @s movement disabled`);
        player.runCommandAsync(`inputpermission set @s camera disabled`);

        player.runCommandAsync(`effect @s blindness 35 1 true`);
        player.runCommandAsync(`effect @s resistance 35 255 true`);
        player.runCommandAsync(`effect @s weakness 35 255 true`);

        /* =========================================
           STOP ALL PREVIOUS AUDIO
        ========================================= */

        player.runCommandAsync(`stopsound @s`);

        /* =========================================
           PLAY INTRO AUDIO
        ========================================= */

        player.runCommandAsync(`playsound introduction @s`);
        player.runCommandAsync(`playsound haggstrom @s`);
player.addTag("intro_playing");

        /* =========================================
           START SUBTITLES
        ========================================= */

        playSubtitles(player);

        /* =========================================
           INITIAL FADE
        ========================================= */

        player.runCommandAsync(
            `camera @s fade time 0 2 0 color 0 0 0`
        );

        const startLoc = player.location;

        /* =========================================
           DRONE SETTINGS
        ========================================= */

        const centerX = startLoc.x;
        const centerY = startLoc.y + 48;
        const centerZ = startLoc.z;

        const radius = 55;

        /* =========================================
           START DRONE CAMERA
        ========================================= */

        system.runTimeout(() => {

            let tick = 0;

            const interval = system.runInterval(() => {

                tick++;

/* =========================================
   SMOOTHED PROGRESS
========================================= */

const rawProgress = tick / DRONE_TIME;

const progress = easeInOut(
    Math.min(rawProgress, 1)
);

/* =========================================
   DYNAMIC CAMERA SPEED
========================================= */

const angle =
    progress * Math.PI * 2.4;

/* =========================================
   DYNAMIC RADIUS
========================================= */

const dynamicRadius =
    radius - (progress * 20);

/* =========================================
   BASE CAMERA POSITION
========================================= */

const baseX =
    centerX +
    Math.cos(angle) * dynamicRadius;

const baseZ =
    centerZ +
    Math.sin(angle) * dynamicRadius;

/* =========================================
   CINEMATIC ALTITUDE
========================================= */

const baseY =
    centerY +
    Math.sin(progress * Math.PI * 2) * 12 +
    Math.sin(progress * Math.PI) * 8;

/* =========================================
   CAMERA SWAY
========================================= */

const swayX =
    Math.sin(tick * 0.03) * 0.8;

const swayY =
    Math.sin(tick * 0.05) * 0.5;

const swayZ =
    Math.cos(tick * 0.03) * 0.8;

/* =========================================
   FINAL CAMERA POSITION
========================================= */

const camX = baseX + swayX;
const camY = baseY + swayY;
const camZ = baseZ + swayZ;

/* =========================================
   DYNAMIC LOOK-AHEAD
========================================= */

const lookAhead = angle + 0.35;

const lookX =
    centerX +
    Math.cos(lookAhead) * 12;

const lookY =
    startLoc.y + 10;

const lookZ =
    centerZ +
    Math.sin(lookAhead) * 12;

                player.runCommandAsync(
    `camera @s set minecraft:free pos ${camX.toFixed(2)} ${camY.toFixed(2)} ${camZ.toFixed(2)} facing ${lookX.toFixed(2)} ${lookY.toFixed(2)} ${lookZ.toFixed(2)}`
);

                /* =========================================
                   FINAL FADE
                ========================================= */

                if (tick >= DRONE_TIME) {

                    system.clearRun(interval);

                    player.runCommandAsync(
                        `camera @s fade time 0 2 0 color 0 0 0`
                    );

                    system.runTimeout(() => {

                        /* =========================================
                           RESTORE PLAYER
                        ========================================= */

                        player.runCommandAsync(`camera @s clear`);

                        player.runCommandAsync(
                            `inputpermission set @s movement enabled`
                        );

                        player.runCommandAsync(
                            `inputpermission set @s camera enabled`
                        );

player.removeTag("intro_playing");
player.addTag(INTRO_TAG);

                        player.runCommandAsync(`effect @s clear`);

                    }, FADE_TIME);

                }

            }, 1);

        }, FADE_TIME);

        /* =========================================
           FORCE STOP AUDIO
        ========================================= */

        system.runTimeout(() => {

            player.runCommandAsync(
                `stopsound @s introduction`
            );

            player.runCommandAsync(
                `stopsound @s haggstrom`
            );

        }, INTRO_DURATION);

    }, 200);

    });

});