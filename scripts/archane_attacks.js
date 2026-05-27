// scripts/archane_attacks.js
//
//  • MELEE ATTACK   – plays attack anim (state 1) on entityHitEntity.
//                     Locked until animation finishes.
//
//  • POISON ATTACK  – first shot fires 10 s after spawn (so you can see it works),
//                     then every 2 mins after that.
//                     Freezes AI movement, steps back 5 blocks, fires a
//                     minecraft:arrow projectile aimed at the player.
//                     Arrow applies Poison II (5 s) on hit. Plays attack3.
//
//  • WEB ATTACK     – enraged phase only (≤25% HP), every 12–18 s.
//                     Freezes AI movement, steps back 5 blocks, places 3×3
//                     cobwebs around the player. Plays attack2.

import { world, system, GameMode } from "@minecraft/server";

// ─── Constants ────────────────────────────────────────────────────────────────

const ENTITY_ID         = "cb:archane";
const PROP_ATTACK_STATE = "cb:attack_state";
// 0 = none  1 = melee  2 = web  3 = poison

const MELEE_ANIM_TICKS  = 30;

const POISON_RANGE      = 15;
const POISON_FIRST_CD   = 10 * 20;     // 10 s — first shot fires quickly so you can verify it works
const POISON_CD         = 2 * 60 * 20; // 2 min after that
const POISON_PROJ_SPEED = 1.1;
const POISON_DURATION   = 5 * 20;
const POISON_AMPLIFIER  = 1;           // Poison II
const POISON_FIRE_DELAY = 2;           // ticks after step-back before projectile spawns

const WEB_RANGE         = 12;
const WEB_MIN_CD        = 12 * 20;
const WEB_MAX_CD        = 18 * 20;
const WEB_RADIUS        = 1;
const WEB_FIRE_DELAY    = 2;

const STEPBACK_DIST     = 5;
const STEPBACK_TICKS    = 14;
// Speed multiplier >1 to overcome physics drag while AI is frozen
const STEPBACK_SPEED    = (STEPBACK_DIST / STEPBACK_TICKS) * 1.5;

const ENRAGE_THRESHOLD  = 0.25;

// ─── Utilities ────────────────────────────────────────────────────────────────

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function distSq(a, b) {
  const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
  return dx * dx + dy * dy + dz * dz;
}

function getClosestPlayer(entity, maxRange) {
  const maxSq = maxRange * maxRange;
  let closest = null, closestSq = Infinity;
  for (const player of entity.dimension.getPlayers()) {
    const gm = player.getGameMode();
    if (gm === GameMode.creative || gm === GameMode.spectator) continue;
    const sq = distSq(entity.location, player.location);
    if (sq <= maxSq && sq < closestSq) { closestSq = sq; closest = player; }
  }
  return closest;
}

function setAttackState(entity, state) {
  try { entity.setProperty(PROP_ATTACK_STATE, state); } catch {}
}

/**
 * Freezes AI movement via cb:start_ranged_attack (sets movement speed = 0),
 * applies backward impulses for STEPBACK_TICKS ticks, then calls onComplete().
 * Restoring movement is the caller's responsibility via cb:end_ranged_attack.
 */
function stepBackThenFire(archane, target, onComplete) {
  // Freeze pathfinding so it doesn't fight the impulse
  try { archane.triggerEvent("cb:start_ranged_attack"); } catch {}

  const archLoc = archane.location;
  const targLoc = target.location;

  let dx = archLoc.x - targLoc.x;
  let dz = archLoc.z - targLoc.z;
  const hLen = Math.sqrt(dx * dx + dz * dz);
  if (hLen < 0.01) { dx = 1; dz = 0; }
  else { dx /= hLen; dz /= hLen; }

  let ticks = 0;
  const handle = system.runInterval(() => {
    ticks++;
    try {
      if (!archane.isValid()) { system.clearRun(handle); return; }
      archane.applyImpulse({ x: dx * STEPBACK_SPEED, y: 0, z: dz * STEPBACK_SPEED });
    } catch {
      system.clearRun(handle);
      return;
    }
    if (ticks >= STEPBACK_TICKS) {
      system.clearRun(handle);
      onComplete();
    }
  }, 1);
}

function spawnParticleProjectile(
  archane,
  target,
  dimId,
  {
    speed = 2.8,
    size = 2.2,
    maxLife = 35,
    trailParticle,
    sphereParticle,
    onHit
  }
) {

  const dim = world.getDimension(dimId);

  let liveTarget = null;
  try {
    liveTarget = dim.getPlayers()
      .find(p => p.id === target.id) ?? null;
  } catch {}

  if (!liveTarget || !archane.isValid()) return;

  // ───── RIGHT SIDE SPAWN (3 BLOCKS) ─────
  const rotY =
    archane.getRotation().y * Math.PI / 180;

  const rightX = Math.cos(rotY);
  const rightZ = Math.sin(rotY);

  const pos = {
    x: archane.location.x + rightX * 3,
    y: archane.location.y + 1.2,
    z: archane.location.z + rightZ * 3
  };

  const targetPos = {
    x: liveTarget.location.x,
    y: liveTarget.location.y + 1,
    z: liveTarget.location.z
  };

  let dx = targetPos.x - pos.x;
  let dy = targetPos.y - pos.y;
  let dz = targetPos.z - pos.z;

  const len =
    Math.sqrt(dx * dx + dy * dy + dz * dz);

  if (len === 0) return;

  dx /= len;
  dy /= len;
  dz /= len;

  let age = 0;
  let rotation = 0;

  const projectile = system.runInterval(() => {

    age++;

    // FASTER SPIN
    rotation += 0.9;

    // EXTREMELY FAST MOVEMENT
    pos.x += dx * speed;
    pos.y += dy * speed;
    pos.z += dz * speed;

    // ───── DENSE TRAIL ─────
    for (let i = 0; i < 7; i++) {

      try {
        dim.spawnParticle(trailParticle, {
          x: pos.x - dx * (i * 0.25),
          y: pos.y - dy * (i * 0.25),
          z: pos.z - dz * (i * 0.25)
        });
      } catch {}
    }

    // ───── FAST ROTATING SPHERE ─────
    const rings = 5;
    const particlesPerRing = 12;

    for (let r = 0; r < rings; r++) {

      const pitch =
        ((r / (rings - 1)) - 0.5)
        * Math.PI;

      const radius =
        Math.cos(pitch)
        * size * 0.4;

      const yOffset =
        Math.sin(pitch)
        * size * 0.4;

      for (let i = 0; i < particlesPerRing; i++) {

        const angle =
          ((Math.PI * 2 * i)
          / particlesPerRing)
          + rotation
          + (r * 0.6);

        const xOffset =
          Math.cos(angle) * radius;

        const zOffset =
          Math.sin(angle) * radius;

        try {
          dim.spawnParticle(sphereParticle, {
            x: pos.x + xOffset,
            y: pos.y + yOffset,
            z: pos.z + zOffset
          });
        } catch {}
      }
    }

    // ───── BIG HITBOX ─────
    try {
      const nearby = dim.getPlayers({
        location: pos,
        maxDistance: size
      });

      for (const player of nearby) {
        onHit(player);
        system.clearRun(projectile);
        return;
      }
    } catch {}

    // ───── WALL COLLISION ─────
    try {
      const block = dim.getBlock({
        x: Math.floor(pos.x),
        y: Math.floor(pos.y),
        z: Math.floor(pos.z)
      });

      if (block && !block.isAir) {
        system.clearRun(projectile);
      }
    } catch {}

    if (age >= maxLife) {
      system.clearRun(projectile);
    }

  }, 1);
}

function firePoison(archane, target, dimId) {
  spawnParticleProjectile(
    archane,
    target,
    dimId,
    {
      speed: 3.6,
      size: 2.8,
      maxLife: 28,

      trailParticle: "cb:archane_poison",
      sphereParticle: "cb:archane_poison",

      onHit(player) {
        try {
          player.addEffect(
            "minecraft:poison",
            POISON_DURATION,
            {
              amplifier: POISON_AMPLIFIER,
              showParticles: true
            }
          );
        } catch {}
      }
    }
  );
}

function fireWebProjectile(
  archane,
  target,
  dimId
) {
  spawnParticleProjectile(
    archane,
    target,
    dimId,
    {
      speed: 3.2,
      size: 3,
      maxLife: 28,

      trailParticle: "aofs:archane_web",
      sphereParticle: "aofs:archane_web",

      onHit(player) {
        placeWebsAround(player, WEB_RADIUS);
      }
    }
  );
}

function spawnMeleeSlash(archane) {

  const dim = archane.dimension;

  // Two diagonal lines swept simultaneously to form an X
  // Slash A: top-left → bottom-right  (angle: forward-left to forward-right, descending)
  // Slash B: top-right → bottom-left  (mirror)
  const STEPS   = 6;
  const REACH   = 1.8; // half-width of the X arms
  const FORWARD = 1.6; // how far in front of archane

  let tick = 0;

  const slashAnim = system.runInterval(() => {
    tick++;

    try {
      if (!archane.isValid()) {
        system.clearRun(slashAnim);
        return;
      }

      const rot =
        archane.getRotation().y * Math.PI / 180;

      // Unit vectors relative to archane's yaw
      const fwdX = -Math.sin(rot);
      const fwdZ =  Math.cos(rot);
      const rgtX =  Math.cos(rot);
      const rgtZ =  Math.sin(rot);

      const cx = archane.location.x + fwdX * FORWARD;
      const cy = archane.location.y + 1.1;
      const cz = archane.location.z + fwdZ * FORWARD;

      // t goes -1 → +1 across the 6 steps
      const t = ((tick - 1) / (STEPS - 1)) * 2 - 1;

      // Slash A: right offset follows t, y descends
      const axOffset = t * REACH;
      const ayOffset = -t * 0.7; // top at t=-1, bottom at t=+1

      // Slash B: mirror — right offset opposes t, same y arc
      const bxOffset = -t * REACH;
      const byOffset = -t * 0.7;

      // Spawn both arms each tick
      dim.spawnParticle("minecraft:critical_hit_emitter", {
        x: cx + rgtX * axOffset,
        y: cy + ayOffset,
        z: cz + rgtZ * axOffset
      });

      dim.spawnParticle("minecraft:critical_hit_emitter", {
        x: cx + rgtX * bxOffset,
        y: cy + byOffset,
        z: cz + rgtZ * bxOffset
      });

    } catch {
      system.clearRun(slashAnim);
      return;
    }

    if (tick >= STEPS) {
      system.clearRun(slashAnim);
    }

  }, 1);
}

function placeWebsAround(player, radius) {
  const loc = player.location, dim = player.dimension;
  const yFeet = Math.floor(loc.y);
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dz = -radius; dz <= radius; dz++) {
      const bx = Math.floor(loc.x) + dx;
      const bz = Math.floor(loc.z) + dz;
      for (const by of [yFeet, yFeet + 1]) {
        try {
          const block = dim.getBlock({ x: bx, y: by, z: bz });
          if (block?.isAir) dim.runCommand(`setblock ${bx} ${by} ${bz} minecraft:web`);
        } catch {}
      }
    }
  }
}

// ─── Manager ──────────────────────────────────────────────────────────────────

export class ArchaneAttackManager {

  constructor() {
    this._states = new Map();
  }

  register() {
    system.runInterval(() => this._tick(), 1);

    world.afterEvents.entityHitEntity.subscribe((ev) => {
      if (ev.damagingEntity?.typeId === ENTITY_ID) this._onMeleeHit(ev.damagingEntity);
    });

    world.afterEvents.entityDie.subscribe((ev) => {
      if (ev.deadEntity?.typeId === ENTITY_ID) this._states.delete(ev.deadEntity.id);
    });
  }

  _onMeleeHit(archane) {
    const state = this._getOrCreate(archane);
    if (state.locked) return;

    state.locked = true;
    state.meleeAnimTicks = MELEE_ANIM_TICKS;

    setAttackState(archane, 1);

    // Slash particle timing
    system.runTimeout(() => {
      if (archane.isValid()) {
        spawnMeleeSlash(archane);
      }
    }, 5);
  }

  _tick() {
    for (const dimId of ["overworld", "nether", "the_end"]) {
      let list;
      try { list = world.getDimension(dimId).getEntities({ type: ENTITY_ID }); } catch { continue; }
      for (const archane of list) this._process(archane);
    }
  }

  _getOrCreate(archane) {
    if (!this._states.has(archane.id)) {
      this._states.set(archane.id, {
        poisonCd:       POISON_FIRST_CD, // short first cooldown so it's immediately testable
        webCd:          randInt(WEB_MIN_CD, WEB_MAX_CD),
        enraged:        false,
        enrageFired:    false,
        locked:         false,
        meleeAnimTicks: 0,
      });
    }
    return this._states.get(archane.id);
  }

  _process(archane) {
    const state = this._getOrCreate(archane);

    // Enrage check
    try {
      const hp = archane.getComponent("minecraft:health");
      if (hp && !state.enrageFired && hp.currentValue / hp.effectiveMax <= ENRAGE_THRESHOLD) {
        state.enraged     = true;
        state.enrageFired = true;
        try { archane.triggerEvent("cb:enter_enraged_phase"); } catch {}
      }
    } catch { return; }

    // Melee anim countdown
    if (state.meleeAnimTicks > 0) {
      state.meleeAnimTicks--;
      if (state.meleeAnimTicks === 0) {
        state.locked = false;
        setAttackState(archane, 0);
      }
      return;
    }

    if (state.locked) return;

    if (state.poisonCd > 0) state.poisonCd--;
    if (state.webCd    > 0) state.webCd--;

    // Web — enraged, priority
    if (state.enraged && state.webCd <= 0) {
      const target = getClosestPlayer(archane, WEB_RANGE);
      if (target) { this._doWeb(archane, target, state); return; }
    }

    // Poison
    if (state.poisonCd <= 0) {
      const target = getClosestPlayer(archane, POISON_RANGE);
      if (target) this._doPoison(archane, target, state);
    }
  }

  // ── Poison: freeze → step back → fire arrow → unfreeze ───────────────────

  _doPoison(archane, target, state) {
    state.poisonCd = POISON_CD;
    state.locked   = true;
    const dimId    = archane.dimension.id;

    setAttackState(archane, 3);

    stepBackThenFire(archane, target, () => {
      // Fire projectile at the animation's release frame
      system.runTimeout(() => firePoison(archane, target, dimId), POISON_FIRE_DELAY);

      // Restore movement + release lock after anim completes
      system.runTimeout(() => {
        try {
          archane.triggerEvent(
            state.enraged ? "cb:end_ranged_attack_enraged" : "cb:end_ranged_attack"
          );
        } catch {}
        state.locked = false;
        setAttackState(archane, 0);
      }, POISON_FIRE_DELAY + 30);
    });
  }

  // ── Web: freeze → step back → place cobwebs → unfreeze ───────────────────

  _doWeb(archane, target, state) {
    state.webCd    = randInt(WEB_MIN_CD, WEB_MAX_CD);
    state.locked   = true;
    const targetId = target.id;
    const dimId    = archane.dimension.id;

    setAttackState(archane, 2);

    stepBackThenFire(archane, target, () => {
      system.runTimeout(() => {
        let liveTarget = null;
        try { liveTarget = world.getDimension(dimId).getPlayers().find(p => p.id === targetId) ?? null; } catch {}
        if (liveTarget) {
          fireWebProjectile(
            archane,
            liveTarget,
            dimId
          );
        }
      }, WEB_FIRE_DELAY);

      system.runTimeout(() => {
        try { archane.triggerEvent("cb:end_ranged_attack_enraged"); } catch {}
        state.locked = false;
        setAttackState(archane, 0);
      }, WEB_FIRE_DELAY + 30);
    });
  }
}