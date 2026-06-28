// src/engine/chemicalReaction/AnimationEngine.js

/**
 * ==========================================================
 * STUDY AI - Chemical Reaction Animation Engine
 * ----------------------------------------------------------
 * Handles:
 * • Reaction timing
 * • Particle effects (gas, smoke, bubbles)
 * • Color transitions
 * • Explosion effects
 * • Precipitate fall
 * • Temperature-driven speed
 * ==========================================================
 */

class AnimationEngine {
  constructor() {
    this.activeAnimations = new Map();
  }

  /* =========================
      CORE ANIMATION STATE
  ========================= */

  createSession(id, data = {}) {
    this.activeAnimations.set(id, {
      progress: 0,
      running: true,
      speed: data.speed || 1,
      type: data.type || "normal",
      particles: [],
      startTime: Date.now(),
      ...data,
    });
  }

  getSession(id) {
    return this.activeAnimations.get(id);
  }

  removeSession(id) {
    this.activeAnimations.delete(id);
  }

  /* =========================
      PROGRESS CONTROL
  ========================= */

  updateProgress(id, delta) {
    const session = this.getSession(id);
    if (!session) return null;

    session.progress += delta * session.speed;

    if (session.progress >= 100) {
      session.progress = 100;
      session.running = false;
    }

    return session;
  }

  reset(id) {
    const session = this.getSession(id);
    if (!session) return;

    session.progress = 0;
    session.running = true;
    session.particles = [];
  }

  /* =========================
      PARTICLE SYSTEM
  ========================= */

  spawnParticle(
    id,
    particle = {}
  ) {
    const session = this.getSession(id);
    if (!session) return;

    session.particles.push({
      x: particle.x || 0,
      y: particle.y || 0,
      vx:
        particle.vx ||
        (Math.random() - 0.5) * 2,
      vy:
        particle.vy ||
        (Math.random() - 0.5) * 2,
      life: particle.life || 100,
      color: particle.color || "#38bdf8",
      size: particle.size || 4,
      type: particle.type || "bubble",
    });
  }

  updateParticles(id) {
    const session = this.getSession(id);
    if (!session) return [];

    session.particles = session.particles
      .map((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1;

        return p;
      })
      .filter((p) => p.life > 0);

    return session.particles;
  }

  /* =========================
      EFFECT GENERATORS
  ========================= */

  createGasEffect(id, intensity = 5) {
    for (let i = 0; i < intensity; i++) {
      this.spawnParticle(id, {
        x: Math.random() * 100,
        y: 100,
        vy: -Math.random() * 2,
        vx: (Math.random() - 0.5) * 1,
        color: "#94a3b8",
        type: "gas",
        size: 3,
      });
    }
  }

  createBubbleEffect(id, intensity = 5) {
    for (let i = 0; i < intensity; i++) {
      this.spawnParticle(id, {
        x: Math.random() * 100,
        y: 100,
        vy: -Math.random() * 1.5,
        vx: 0,
        color: "#38bdf8",
        type: "bubble",
        size: 4,
      });
    }
  }

  createExplosion(id, intensity = 10) {
    for (let i = 0; i < intensity; i++) {
      this.spawnParticle(id, {
        x: 50,
        y: 50,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        color: "#ef4444",
        type: "explosion",
        size: 5,
        life: 60,
      });
    }
  }

  createPrecipitate(id, intensity = 5) {
    for (let i = 0; i < intensity; i++) {
      this.spawnParticle(id, {
        x: Math.random() * 100,
        y: 20,
        vy: Math.random() * 1.5,
        vx: (Math.random() - 0.5) * 0.5,
        color: "#facc15",
        type: "precipitate",
        size: 3,
      });
    }
  }

  /* =========================
      TEMPERATURE EFFECTS
  ========================= */

  applyTemperatureEffects(id, temperature) {
    if (temperature > 80) {
      this.createGasEffect(id, 8);
    }

    if (temperature > 150) {
      this.createExplosion(id, 5);
    }

    if (temperature < 5) {
      this.createPrecipitate(id, 4);
    }
  }

  /* =========================
      MAIN UPDATE LOOP
  ========================= */

  tick(id, options = {}) {
    const session = this.getSession(id);
    if (!session) return null;

    this.updateProgress(id, options.delta || 1);

    const particles = this.updateParticles(id);

    if (options.temperature) {
      this.applyTemperatureEffects(
        id,
        options.temperature
      );
    }

    return {
      progress: session.progress,
      running: session.running,
      particles,
    };
  }

  /* =========================
      UTIL
  ========================= */

  isRunning(id) {
    return this.getSession(id)?.running || false;
  }

  clearAll() {
    this.activeAnimations.clear();
  }
}

const animationEngine = new AnimationEngine();

export default animationEngine;