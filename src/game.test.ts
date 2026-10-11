import { createCanvas } from "@napi-rs/canvas";
import { ConstantClock, createEngine } from "@clockwyrks/simple-2d";
import { describe, expect, it } from "vitest";
import { game } from "./game";
import type { CaromDebugApi, CaromState } from "./game";

function setup(stepMs = 10) {
  const canvas = createCanvas(1280, 720) as unknown as HTMLCanvasElement;
  const engine = createEngine({
    canvas,
    width: 1280,
    height: 720,
    game,
    clock: new ConstantClock(stepMs),
    surface: {
      cssWidth: () => 1280,
      cssHeight: () => 720,
      dpr: () => 1,
      events: () => new EventTarget(),
    },
  });
  return { engine, initialize: () => engine.initialize() };
}

describe("Carom simulation", () => {
  it("initializes a complete title world and exposes derived readings", async () => {
    const { engine, initialize } = setup();
    await initialize();
    const debug = engine.debug as CaromDebugApi;
    const snapshot = debug.snapshot(engine.state as CaromState) as {
      screen: string;
      ball: { held: boolean; speed: number };
      obstacles: unknown[];
    };
    expect(snapshot.screen).toBe("title");
    expect(snapshot.ball).toMatchObject({ held: true, speed: 0 });
    expect(snapshot.obstacles).toHaveLength(2);
    engine.destroy();
  });

  it("serves on the frame the hold expires and advances time by dt", async () => {
    const { engine, initialize } = setup(100);
    await initialize();
    const debug = engine.debug as CaromDebugApi;
    engine.apply((state) => debug.setScreen(state, "countdown"));
    await engine.advance(11);
    const snap = debug.snapshot(engine.state as CaromState) as {
      screen: string;
      simTime: number;
      ball: { held: boolean; holdTimer: number; vx: number };
    };
    expect(snap.screen).toBe("playing");
    expect(snap.ball.held).toBe(false);
    expect(snap.ball.holdTimer).toBe(0);
    expect(Math.abs(snap.ball.vx)).toBeGreaterThan(500);
    expect(snap.simTime).toBeCloseTo(1.1);
    engine.destroy();
  });

  it("applies paddle-motion spin, scores, and preserves readonly pose inputs", async () => {
    const { engine, initialize } = setup(10);
    await initialize();
    const debug = engine.debug as CaromDebugApi;
    engine.apply((s) => {
      const playing = debug.setScreen(s, "playing");
      const moved = debug.setPaddleDriven(playing, "left", true);
      const speed = debug.setPaddleVy(moved, "left", 700);
      const ball = debug.setBallHeld(speed, false);
      const positioned = debug.setBallPosition(ball, 70, 360);
      return debug.setBallVelocity(positioned, -520, 0);
    });
    const before = debug.snapshot(engine.state as CaromState);
    await engine.advance(4);
    const after = debug.snapshot(engine.state as CaromState) as {
      ball: { vx: number; spin: number };
      paddles: { left: { vy: number } };
    };
    expect(after.ball.vx).toBeGreaterThan(0);
    expect(after.ball.spin).toBeGreaterThan(0);
    expect(after.paddles.left.vy).toBe(700);
    expect(before).toBeDefined();
    engine.destroy();
  });

  it("poses obstacles from their clock and rejects absent-ball edits", async () => {
    const { engine, initialize } = setup();
    await initialize();
    const debug = engine.debug as CaromDebugApi;
    engine.apply((s) =>
      debug.setObstacleClock(debug.setScreen(s, "playing"), 0.9),
    );
    const snapshot = debug.snapshot(engine.state as CaromState) as {
      obstacles: { theta: number; cy: number }[];
    };
    expect(snapshot.obstacles[0]!.theta).toBeCloseTo((0.9 * Math.PI) / 3);
    engine.apply((s) => debug.clearWorld(s));
    expect(() => debug.setBallSpin(engine.state as CaromState, 10)).toThrow(
      /no ball/,
    );
    engine.destroy();
  });
});
