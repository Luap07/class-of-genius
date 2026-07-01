// src/engine/acidBase/AnimationEngine.js

class AnimationEngine {
  constructor() {
    this.sessions = new Map();
  }

  /* ===========================================
      SESSION
  =========================================== */

  createSession(id) {
    this.sessions.set(id, {
      id,
      running: false,
      progress: 0,
      speed: 1,
      particles: [],
      bubbles: [],
      heat: [],
      startTime: null,
    });

    return this.sessions.get(id);
  }

  getSession(id) {
    if (!this.sessions.has(id)) {
      return this.createSession(id);
    }

    return this.sessions.get(id);
  }

  removeSession(id) {
    this.sessions.delete(id);
  }

  clear() {
    this.sessions.clear();
  }

  /* ===========================================
      PLAYBACK
  =========================================== */

  start(id, speed = 1) {
    const session = this.getSession(id);

    session.running = true;
    session.progress = 0;
    session.speed = speed;
    session.startTime = Date.now();

    return session;
  }

  stop(id) {
    const session = this.getSession(id);

    session.running = false;

    return session;
  }

  reset(id) {
    const session = this.getSession(id);

    session.running = false;
    session.progress = 0;
    session.particles = [];
    session.bubbles = [];
    session.heat = [];

    return session;
  }

  /* ===========================================
      UPDATE
  =========================================== */

  update(id, delta = 1) {
    const session = this.getSession(id);

    if (!session.running) return session;

    session.progress += delta * session.speed;

    if (session.progress >= 100) {
      session.progress = 100;
      session.running = false;
    }

    this.updateParticles(session);
    this.updateBubbles(session);
    this.updateHeat(session);

    return session;
  }

  /* ===========================================
      PARTICLES
  =========================================== */

  spawnParticle(id, options = {}) {
    const session = this.getSession(id);

    session.particles.push({
      id: Date.now() + Math.random(),

      x: options.x ?? Math.random() * 100,
      y: options.y ?? Math.random() * 100,

      vx: options.vx ?? (Math.random() - 0.5),
      vy: options.vy ?? (Math.random() - 0.5),

      size: options.size ?? 6,
      color: options.color ?? "#38bdf8",

      opacity: 1,

      life: options.life ?? 100,
    });
  }

  updateParticles(session) {
    session.particles = session.particles
      .map((p) => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
        opacity: p.opacity - 0.01,
        life: p.life - 1,
      }))
      .filter((p) => p.life > 0);
  }

  /* ===========================================
      BUBBLES
  =========================================== */

  createBubbles(id, amount = 15) {
    const session = this.getSession(id);

    for (let i = 0; i < amount; i++) {
      session.bubbles.push({
        id: Date.now() + Math.random(),

        x: Math.random() * 100,
        y: 100,

        radius: Math.random() * 8 + 4,

        speed: Math.random() * 1.5 + 0.5,

        opacity: 1,
      });
    }
  }

  updateBubbles(session) {
    session.bubbles = session.bubbles
      .map((bubble) => ({
        ...bubble,
        y: bubble.y - bubble.speed,
        opacity: bubble.opacity - 0.008,
      }))
      .filter((bubble) => bubble.opacity > 0);
  }

  /* ===========================================
      HEAT WAVES
  =========================================== */

  createHeat(id, amount = 10) {
    const session = this.getSession(id);

    for (let i = 0; i < amount; i++) {
      session.heat.push({
        id: Date.now() + Math.random(),

        x: Math.random() * 100,
        y: Math.random() * 100,

        radius: 15,

        opacity: 0.6,
      });
    }
  }

  updateHeat(session) {
    session.heat = session.heat
      .map((heat) => ({
        ...heat,
        radius: heat.radius + 0.4,
        opacity: heat.opacity - 0.006,
      }))
      .filter((heat) => heat.opacity > 0);
  }

  /* ===========================================
      NEUTRALIZATION EFFECT
  =========================================== */

  triggerNeutralization(id) {
    this.createBubbles(id, 20);
    this.createHeat(id, 12);

    for (let i = 0; i < 30; i++) {
      this.spawnParticle(id, {
        color: "#14b8a6",
        size: Math.random() * 8 + 3,
        life: 70,
      });
    }
  }

  /* ===========================================
      GETTERS
  =========================================== */

  getProgress(id) {
    return this.getSession(id).progress;
  }

  isRunning(id) {
    return this.getSession(id).running;
  }

  getParticles(id) {
    return this.getSession(id).particles;
  }

  getBubbles(id) {
    return this.getSession(id).bubbles;
  }

  getHeat(id) {
    return this.getSession(id).heat;
  }

  /* ===========================================
      EXPORT
  =========================================== */

  exportState(id) {
    return this.getSession(id);
  }
}

const animationEngine = new AnimationEngine();

export default animationEngine;