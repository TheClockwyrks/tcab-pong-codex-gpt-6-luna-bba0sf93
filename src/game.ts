import type {
  Game,
  InitApi,
  RenderApi,
  UpdateApi,
} from "@clockwyrks/simple-2d";
import type { DeepReadonly } from "ts-essentials";
import {
  ACTIONS,
  AI_DEADZONE,
  AI_HOME_DEADZONE,
  AI_HOME_Y,
  AI_REACT,
  AI_SPEED,
  BALL_R,
  BINDINGS,
  CAROM_DEBUG_VERSION,
  CUES,
  FIELD_CX,
  FIELD_CY,
  FIELD_H,
  FIELD_W,
  HOLD_TIME,
  MAX_BOUNCE_ANGLE,
  MAX_SUBSTEP,
  MATCHOVER_ITEMS,
  NET_X,
  OBSTACLE_CENTERS,
  OBSTACLE_H,
  OBSTACLE_HH,
  OBSTACLE_W,
  OBSTACLE_HW,
  OBSTACLE_SPIN_RATE,
  OBSTACLE_SWAY_AMP,
  OBSTACLE_SWAY_PERIOD,
  P1_X0,
  P1_X1,
  P2_X0,
  P2_X1,
  PADDLE_HALF,
  PADDLE_H,
  PADDLE_MAX_CY,
  PADDLE_MIN_CY,
  PADDLE_SPEED,
  PADDLE_W,
  PAUSE_ITEMS,
  SERVE_ANGLE,
  SERVE_SPEED,
  SPEED_CAP,
  SPEED_MULT,
  SPIN_FROM_PADDLE,
  SPIN_HALFLIFE,
  SPIN_CLAMP,
  TITLE_ITEMS,
  TITLE_TEXT,
  TRAIL_TIME,
  WIN_LEAD,
  WIN_SCORE,
} from "./constants";

export const BACKGROUND = "#0c1524";
export type Screen =
  "title" | "howto" | "countdown" | "playing" | "paused" | "matchover";
export type Mode = "solo" | "versus";
export type Side = "left" | "right";
export interface PaddleState {
  readonly cy: number;
  readonly vy: number;
  readonly driven: boolean;
  readonly drivenVy: number;
}
export interface AiState {
  readonly tracking: boolean;
  readonly movement: boolean;
}
export interface TrailSample {
  readonly x: number;
  readonly y: number;
  readonly t: number;
}
export interface BallState {
  readonly x: number;
  readonly y: number;
  readonly vx: number;
  readonly vy: number;
  readonly spin: number;
  readonly held: boolean;
  readonly holdTimer: number;
  readonly serveSign: 1 | -1;
  readonly trail: readonly TrailSample[];
}
export interface ObstacleState {
  readonly index: number;
  readonly cx: number;
  readonly cy: number;
  readonly theta: number;
}
export interface CaromState {
  readonly screen: Screen;
  readonly mode: Mode;
  readonly menuIndex: number;
  readonly titleIndex: number;
  readonly resumeScreen: "countdown" | "playing";
  readonly score: { readonly p1: number; readonly p2: number };
  readonly winner: Side | null;
  readonly paddles: { readonly left: PaddleState; readonly right: PaddleState };
  readonly ai: AiState;
  readonly receiver: Side;
  readonly ball: BallState | null;
  readonly obstacles: readonly ObstacleState[];
  readonly obstacleClock: number;
  readonly obstacleClockRunning: boolean;
  readonly simTime: number;
  readonly muted: boolean;
}
export interface CaromDebugApi {
  version: number;
  clearWorld(s: DeepReadonly<CaromState>): CaromState;
  spawnBall(s: DeepReadonly<CaromState>): CaromState;
  spawnObstacle(s: DeepReadonly<CaromState>, index: number): CaromState;
  reset(s: DeepReadonly<CaromState>): CaromState;
  reconcile(s: DeepReadonly<CaromState>): CaromState;
  setScreen(s: DeepReadonly<CaromState>, v: Screen): CaromState;
  setMode(s: DeepReadonly<CaromState>, v: Mode): CaromState;
  setMenuIndex(s: DeepReadonly<CaromState>, v: number): CaromState;
  setTitleIndex(s: DeepReadonly<CaromState>, v: number): CaromState;
  setResumeScreen(
    s: DeepReadonly<CaromState>,
    v: "countdown" | "playing",
  ): CaromState;
  setScore(s: DeepReadonly<CaromState>, p1: number, p2: number): CaromState;
  setWinner(s: DeepReadonly<CaromState>, v: Side | null): CaromState;
  setReceiver(s: DeepReadonly<CaromState>, v: Side): CaromState;
  setPaddleCy(s: DeepReadonly<CaromState>, side: Side, v: number): CaromState;
  setPaddleVy(s: DeepReadonly<CaromState>, side: Side, v: number): CaromState;
  setPaddleDriven(
    s: DeepReadonly<CaromState>,
    side: Side,
    v: boolean,
  ): CaromState;
  setBallPosition(
    s: DeepReadonly<CaromState>,
    x: number,
    y: number,
  ): CaromState;
  setBallVelocity(
    s: DeepReadonly<CaromState>,
    vx: number,
    vy: number,
  ): CaromState;
  setBallSpin(s: DeepReadonly<CaromState>, v: number): CaromState;
  setBallHeld(s: DeepReadonly<CaromState>, v: boolean): CaromState;
  setBallHoldTimer(s: DeepReadonly<CaromState>, v: number): CaromState;
  setBallServeSign(s: DeepReadonly<CaromState>, v: 1 | -1): CaromState;
  drawBallServeSign(s: DeepReadonly<CaromState>): CaromState;
  setAiTracking(s: DeepReadonly<CaromState>, v: boolean): CaromState;
  setAiMovement(s: DeepReadonly<CaromState>, v: boolean): CaromState;
  setMuted(s: DeepReadonly<CaromState>, v: boolean): CaromState;
  setObstacleClock(s: DeepReadonly<CaromState>, v: number): CaromState;
  setObstacleClockRunning(s: DeepReadonly<CaromState>, v: boolean): CaromState;
  snapshot(s: DeepReadonly<CaromState>): unknown;
  menuItemRect(
    s: DeepReadonly<CaromState>,
    i: number,
  ): { x: number; y: number; w: number; h: number } | null;
}
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const pose = (i: number, t: number): ObstacleState => ({
  index: i,
  cx: OBSTACLE_CENTERS[i]!.x,
  cy:
    OBSTACLE_CENTERS[i]!.y +
    (i === 0 ? 1 : -1) *
      OBSTACLE_SWAY_AMP *
      Math.sin((2 * Math.PI * t) / OBSTACLE_SWAY_PERIOD),
  theta: OBSTACLE_SPIN_RATE * t,
});
const randomSign = (): 1 | -1 => (Math.random() < 0.5 ? -1 : 1);
const park = (): BallState => ({
  x: FIELD_CX,
  y: FIELD_CY,
  vx: 0,
  vy: 0,
  spin: 0,
  held: true,
  holdTimer: HOLD_TIME,
  serveSign: randomSign(),
  trail: [],
});
const makeState = (muted = false): CaromState => ({
  screen: "title",
  mode: "solo",
  menuIndex: 0,
  titleIndex: 0,
  resumeScreen: "playing",
  score: { p1: 0, p2: 0 },
  winner: null,
  paddles: {
    left: { cy: FIELD_CY, vy: 0, driven: false, drivenVy: 0 },
    right: { cy: FIELD_CY, vy: 0, driven: false, drivenVy: 0 },
  },
  ai: { tracking: true, movement: true },
  receiver: "left",
  ball: park(),
  obstacles: [pose(0, 0), pose(1, 0)],
  obstacleClock: 0,
  obstacleClockRunning: true,
  simTime: 0,
  muted,
});
const checkBall = (s: DeepReadonly<CaromState>) => {
  if (!s.ball) throw new Error("Carom debug: no ball");
  return s.ball;
};
const menuRects = (
  screen: Screen,
): { x: number; y: number; w: number; h: number }[] => {
  const items =
    screen === "title"
      ? TITLE_ITEMS
      : screen === "paused"
        ? PAUSE_ITEMS
        : screen === "matchover"
          ? MATCHOVER_ITEMS
          : screen === "howto"
            ? ["BACK"]
            : [];
  const y0 = screen === "title" ? 350 : screen === "howto" ? 590 : 390;
  return items.map((_, i) => ({ x: 440, y: y0 + i * 68, w: 400, h: 52 }));
};
const setPaddle = (
  s: DeepReadonly<CaromState>,
  side: Side,
  p: Partial<PaddleState>,
): CaromState => ({
  ...s,
  paddles: { ...s.paddles, [side]: { ...s.paddles[side], ...p } },
});
const updatePose = (s: CaromState, t: number) => ({
  ...s,
  obstacles: s.obstacles.map((o) => pose(o.index, t)),
});
const beginMatch = (
  s: DeepReadonly<CaromState>,
  mode = s.mode,
): CaromState => ({
  ...s,
  screen: "countdown",
  mode,
  menuIndex: 0,
  resumeScreen: "playing",
  score: { p1: 0, p2: 0 },
  winner: null,
  receiver: "left",
  ball: park(),
  paddles: {
    left: { ...s.paddles.left, cy: FIELD_CY, vy: 0 },
    right: { ...s.paddles.right, cy: FIELD_CY, vy: 0 },
  },
  obstacleClock: 0,
  obstacleClockRunning: true,
  obstacles: [pose(0, 0), pose(1, 0)],
});
const rectHit = (
  x: number,
  y: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
) => x > x0 - BALL_R && x < x1 + BALL_R && y > y0 - BALL_R && y < y1 + BALL_R;
const stepBall = (
  ball: BallState,
  paddles: CaromState["paddles"],
  obstacles: readonly ObstacleState[],
  h: number,
  api: UpdateApi,
): BallState => {
  const played = new Set<string>();
  const play = (cue: string) => {
    if (!played.has(cue)) {
      played.add(cue);
      api.audio.play(cue);
    }
  };
  let { x, y, vx, vy, spin } = ball;
  const speed0 = Math.hypot(vx, vy),
    n = Math.max(1, Math.ceil((speed0 * h) / MAX_SUBSTEP)),
    sh = h / n;
  for (let k = 0; k < n; k++) {
    const speed = Math.hypot(vx, vy);
    if (speed > 0) {
      const a = (spin / speed) * sh,
        c = Math.cos(a),
        si = Math.sin(a);
      [vx, vy] = [vx * c - vy * si, vx * si + vy * c];
    }
    spin *= Math.pow(0.5, sh / SPIN_HALFLIFE);
    x += vx * sh;
    y += vy * sh;
    if (y - BALL_R < 0 && vy < 0) {
      y = BALL_R;
      vy = -vy;
      play(CUES.wallBounce);
    } else if (y + BALL_R > FIELD_H && vy > 0) {
      y = FIELD_H - BALL_R;
      vy = -vy;
      play(CUES.wallBounce);
    }
    for (const side of ["left", "right"] as const) {
      const p = paddles[side],
        x0 = side === "left" ? P1_X0 : P2_X0,
        x1 = side === "left" ? P1_X1 : P2_X1,
        y0 = p.cy - PADDLE_HALF,
        y1 = p.cy + PADDLE_HALF;
      if (!rectHit(x, y, x0, y0, x1, y1)) continue;
      const ds = [
          x - (x0 - BALL_R),
          x1 + BALL_R - x,
          y - (y0 - BALL_R),
          y1 + BALL_R - y,
        ],
        face = ds.indexOf(Math.min(...ds));
      if (face === 0) {
        x = x0 - BALL_R;
        if (vx > 0) vx = -vx;
      } else if (face === 1) {
        x = x1 + BALL_R;
        if (vx < 0) vx = -vx;
      } else if (face === 2) {
        y = y0 - BALL_R;
        if (vy > 0) vy = -vy;
        play(CUES.wallBounce);
      } else {
        y = y1 + BALL_R;
        if (vy < 0) vy = -vy;
        play(CUES.wallBounce);
      }
      if (face < 2) {
        const off = clamp((y - p.cy) / PADDLE_HALF, -1, 1),
          a = off * MAX_BOUNCE_ANGLE,
          sp = Math.min(Math.hypot(vx, vy) * SPEED_MULT, SPEED_CAP);
        vx = (side === "left" ? 1 : -1) * sp * Math.cos(a);
        vy = sp * Math.sin(a);
        spin = clamp(spin + p.vy * SPIN_FROM_PADDLE, -SPIN_CLAMP, SPIN_CLAMP);
        x = side === "left" ? P1_X1 + BALL_R : P2_X0 - BALL_R;
        play(CUES.paddleHit);
      }
      break;
    }
    for (const o of obstacles) {
      const dx = x - o.cx,
        dy = y - o.cy,
        c = Math.cos(o.theta),
        si = Math.sin(o.theta),
        lx = dx * c + dy * si,
        ly = -dx * si + dy * c,
        qx = clamp(lx, -OBSTACLE_HW, OBSTACLE_HW),
        qy = clamp(ly, -OBSTACLE_HH, OBSTACLE_HH),
        ox = lx - qx,
        oy = ly - qy,
        d = Math.hypot(ox, oy);
      if (d >= BALL_R) continue;
      let nx: number,
        ny: number,
        insideDepth = 0;
      if (d > 0) {
        nx = ox / d;
        ny = oy / d;
      } else {
        const depths = [OBSTACLE_HW - Math.abs(lx), OBSTACLE_HH - Math.abs(ly)];
        if (depths[0]! <= depths[1]!) {
          nx = Math.sign(lx) || 1;
          ny = 0;
          insideDepth = depths[0]!;
        } else {
          nx = 0;
          ny = Math.sign(ly) || 1;
          insideDepth = depths[1]!;
        }
      }
      const wx = nx * c - ny * si,
        wy = nx * si + ny * c,
        dot = vx * wx + vy * wy;
      if (dot < 0) {
        vx -= 2 * dot * wx;
        vy -= 2 * dot * wy;
        play(CUES.obstacleBounce);
      }
      const push = (d === 0 ? BALL_R + insideDepth : BALL_R - d) + 0.01;
      x += wx * push;
      y += wy * push;
    }
  }
  return { ...ball, x, y, vx, vy, spin };
};
const debug: CaromDebugApi = {
  version: CAROM_DEBUG_VERSION,
  clearWorld: (s) => ({ ...s, ball: null, obstacles: [] }),
  spawnBall: (s) => ({ ...s, ball: park() }),
  spawnObstacle: (s, i) => {
    if (i !== 0 && i !== 1)
      throw new Error(`Carom debug: invalid obstacle ${i}`);
    return {
      ...s,
      obstacles: [
        ...s.obstacles.filter((o) => o.index !== i),
        pose(i, s.obstacleClock),
      ].sort((a, b) => a.index - b.index),
    };
  },
  reset: (s) => ({ ...makeState(s.muted), simTime: 0 }),
  reconcile: (s) => ({
    ...s,
    obstacles: s.obstacles.map((o) => pose(o.index, s.obstacleClock)),
  }),
  setScreen: (s, v) => ({ ...s, screen: v }),
  setMode: (s, v) => ({ ...s, mode: v }),
  setMenuIndex: (s, v) => ({ ...s, menuIndex: v }),
  setTitleIndex: (s, v) => ({ ...s, titleIndex: v }),
  setResumeScreen: (s, v) => ({ ...s, resumeScreen: v }),
  setScore: (s, p1, p2) => ({ ...s, score: { p1, p2 } }),
  setWinner: (s, v) => ({ ...s, winner: v }),
  setReceiver: (s, v) => ({ ...s, receiver: v }),
  setPaddleCy: (s, side, v) => setPaddle(s, side, { cy: v }),
  setPaddleVy: (s, side, v) => setPaddle(s, side, { drivenVy: v }),
  setPaddleDriven: (s, side, v) => setPaddle(s, side, { driven: v }),
  setBallPosition: (s, x, y) => ({ ...s, ball: { ...checkBall(s), x, y } }),
  setBallVelocity: (s, vx, vy) => ({ ...s, ball: { ...checkBall(s), vx, vy } }),
  setBallSpin: (s, v) => ({ ...s, ball: { ...checkBall(s), spin: v } }),
  setBallHeld: (s, v) => ({ ...s, ball: { ...checkBall(s), held: v } }),
  setBallHoldTimer: (s, v) => ({
    ...s,
    ball: { ...checkBall(s), holdTimer: v },
  }),
  setBallServeSign: (s, v) => ({
    ...s,
    ball: { ...checkBall(s), serveSign: v },
  }),
  drawBallServeSign: (s) => ({
    ...s,
    ball: { ...checkBall(s), serveSign: randomSign() },
  }),
  setAiTracking: (s, v) => ({ ...s, ai: { ...s.ai, tracking: v } }),
  setAiMovement: (s, v) => ({ ...s, ai: { ...s.ai, movement: v } }),
  setMuted: (s, v) => ({ ...s, muted: v }),
  setObstacleClock: (s, v) => ({
    ...s,
    obstacleClock: v,
    obstacles: s.obstacles.map((o) => pose(o.index, v)),
  }),
  setObstacleClockRunning: (s, v) => ({ ...s, obstacleClockRunning: v }),
  snapshot: (s) => ({
    version: CAROM_DEBUG_VERSION,
    screen: s.screen,
    mode: s.mode,
    menuIndex: s.menuIndex,
    titleIndex: s.titleIndex,
    resumeScreen: s.resumeScreen,
    score: { ...s.score },
    winner: s.winner,
    muted: s.muted,
    paddles: { left: { ...s.paddles.left }, right: { ...s.paddles.right } },
    ai: { ...s.ai },
    receiver: s.receiver,
    ball: s.ball
      ? {
          ...s.ball,
          speed: Math.hypot(s.ball.vx, s.ball.vy),
          trail: s.ball.trail.map((t) => ({ ...t })),
        }
      : null,
    obstacles: s.obstacles.map((o) => ({ ...pose(o.index, s.obstacleClock) })),
    obstacleClock: s.obstacleClock,
    obstacleClockRunning: s.obstacleClockRunning,
    simTime: s.simTime,
  }),
  menuItemRect: (s, i) => menuRects(s.screen)[i] ?? null,
};
const confirm = (s: CaromState): CaromState => {
  if (s.screen === "title") {
    const ix = s.menuIndex;
    if (ix === 0 || ix === 1)
      return { ...beginMatch(s, ix === 0 ? "solo" : "versus"), titleIndex: ix };
    if (ix === 2)
      return { ...s, screen: "howto", menuIndex: 0, titleIndex: ix };
  } else if (s.screen === "howto")
    return { ...s, screen: "title", menuIndex: s.titleIndex };
  else if (s.screen === "paused") {
    if (s.menuIndex === 0) return { ...s, screen: s.resumeScreen };
    if (s.menuIndex === 1) return beginMatch(s);
    return {
      ...makeState(s.muted),
      titleIndex: s.titleIndex,
      menuIndex: s.titleIndex,
      simTime: s.simTime,
    };
  } else if (s.screen === "matchover") {
    if (s.menuIndex === 0) return beginMatch(s);
    return {
      ...makeState(s.muted),
      titleIndex: s.titleIndex,
      menuIndex: s.titleIndex,
      simTime: s.simTime,
    };
  }
  return s;
};
export const game: Game<CaromState, CaromDebugApi> = {
  initialize(api: InitApi<CaromState>) {
    for (const a of ACTIONS) api.input.register(a, { keys: [...BINDINGS[a]] });
    for (const [cue, freq] of [
      [CUES.paddleHit, 520],
      [CUES.wallBounce, 340],
      [CUES.obstacleBounce, 760],
      [CUES.score, 180],
    ] as const)
      api.audio.define(cue, {
        wave: "triangle",
        freq,
        freqTo: freq * 0.55,
        durationMs: 95,
        gain: 0.12,
      });
    for (const [name, fn] of Object.entries({
      screen: (s: DeepReadonly<CaromState>) => s.screen,
      mode: (s: DeepReadonly<CaromState>) => s.mode,
      score: (s: DeepReadonly<CaromState>) => `${s.score.p1}–${s.score.p2}`,
      ball: (s: DeepReadonly<CaromState>) =>
        s.ball ? `${s.ball.x.toFixed(0)},${s.ball.y.toFixed(0)}` : "absent",
      velocity: (s: DeepReadonly<CaromState>) =>
        s.ball ? `${s.ball.vx.toFixed(0)},${s.ball.vy.toFixed(0)}` : "—",
      speed: (s: DeepReadonly<CaromState>) =>
        s.ball ? Math.hypot(s.ball.vx, s.ball.vy).toFixed(0) : "—",
      spin: (s: DeepReadonly<CaromState>) =>
        s.ball ? s.ball.spin.toFixed(0) : "—",
      paddles: (s: DeepReadonly<CaromState>) =>
        `L ${s.paddles.left.cy.toFixed(0)} / ${s.paddles.left.vy.toFixed(0)} · R ${s.paddles.right.cy.toFixed(0)} / ${s.paddles.right.vy.toFixed(0)}`,
    }))
      api.diagnostics.register(name, fn);
    return [makeState(false), debug];
  },
  update(state, api, dt) {
    let s = { ...state, simTime: state.simTime + dt, muted: api.audio.muted() };
    const wasMuted = state.muted;
    const mute = api.input.pressed("mute");
    if (mute) {
      api.audio.setMuted(!api.audio.muted());
      s = { ...s, muted: api.audio.muted() };
    } else if (wasMuted !== api.audio.muted())
      s = { ...s, muted: api.audio.muted() };
    const edges = {
      up1: api.input.pressed("p1-up"),
      up2: api.input.pressed("p2-up"),
      down1: api.input.pressed("p1-down"),
      down2: api.input.pressed("p2-down"),
      confirm: api.input.pressed("confirm"),
      back: api.input.pressed("back"),
      pause: api.input.pressed("pause"),
    };
    const ptr = api.input.pointer(),
      samples = api.input.pointerSamples(),
      press = api.input.pointerPressed(),
      release = api.input.pointerReleased();
    let pointerConfirm = false;
    if (["title", "howto", "paused", "matchover"].includes(s.screen)) {
      const rects = menuRects(s.screen);
      for (const sm of samples) {
        const ix = rects.findIndex(
          (r) =>
            sm.x >= r.x &&
            sm.x <= r.x + r.w &&
            sm.y >= r.y &&
            sm.y <= r.y + r.h,
        );
        if (ix >= 0) s = { ...s, menuIndex: ix };
      }
      if (press) {
        const ix = rects.findIndex(
          (r) =>
            ptr.x >= r.x &&
            ptr.x <= r.x + r.w &&
            ptr.y >= r.y &&
            ptr.y <= r.y + r.h,
        );
        if (ix >= 0) s = { ...s, menuIndex: ix };
      }
      if (release) {
        const ix = rects.findIndex(
          (r) =>
            ptr.x >= r.x &&
            ptr.x <= r.x + r.w &&
            ptr.y >= r.y &&
            ptr.y <= r.y + r.h,
        );
        if (ix >= 0) {
          s = { ...s, menuIndex: ix };
          pointerConfirm = true;
        }
      }
    }
    if (s.screen === "title") {
      if (edges.up1 || edges.up2 || edges.down1 || edges.down2)
        s = {
          ...s,
          menuIndex: (s.menuIndex + (edges.up1 || edges.up2 ? -1 : 1) + 3) % 3,
        };
      else if (edges.confirm) {
        s = { ...s, titleIndex: s.menuIndex };
        s = confirm(s);
      } else if (pointerConfirm) {
        s = { ...s, titleIndex: s.menuIndex };
        s = confirm(s);
      }
    } else if (s.screen === "howto") {
      if (edges.confirm || edges.back || pointerConfirm)
        s = { ...s, screen: "title", menuIndex: s.titleIndex };
    } else if (s.screen === "countdown" || s.screen === "playing") {
      if (edges.pause) {
        s = { ...s, screen: "paused", resumeScreen: s.screen, menuIndex: 0 };
      }
    } else if (s.screen === "paused") {
      if (edges.pause || edges.back) s = { ...s, screen: s.resumeScreen };
      else if (edges.up1 || edges.up2 || edges.down1 || edges.down2)
        s = {
          ...s,
          menuIndex: (s.menuIndex + (edges.up1 || edges.up2 ? -1 : 1) + 3) % 3,
        };
      else if (edges.confirm || pointerConfirm) s = confirm(s);
    } else if (s.screen === "matchover") {
      if (edges.up1 || edges.up2 || edges.down1 || edges.down2)
        s = {
          ...s,
          menuIndex: (s.menuIndex + (edges.up1 || edges.up2 ? -1 : 1) + 2) % 2,
        };
      else if (edges.back)
        s = {
          ...makeState(s.muted),
          titleIndex: s.titleIndex,
          menuIndex: s.titleIndex,
          simTime: s.simTime,
        };
      else if (edges.confirm || pointerConfirm) s = confirm(s);
    }
    if (s.screen === "countdown" || s.screen === "playing") {
      const move = (side: Side): PaddleState => {
        const old = s.paddles[side];
        let vy = 0;
        if (old.driven) vy = old.drivenVy;
        else if (side === "left") {
          const up =
              api.input.value("p1-up") +
              (s.mode === "solo" ? api.input.value("p2-up") : 0),
            down =
              api.input.value("p1-down") +
              (s.mode === "solo" ? api.input.value("p2-down") : 0);
          vy = (down > 0 ? 1 : 0) - (up > 0 ? 1 : 0);
          vy *= PADDLE_SPEED;
        } else if (s.mode === "versus")
          vy =
            (api.input.value("p2-down") - api.input.value("p2-up")) *
            PADDLE_SPEED;
        else if (s.ai.movement) {
          let target = AI_HOME_Y,
            dz = AI_HOME_DEADZONE;
          if (
            s.screen === "playing" &&
            s.ai.tracking &&
            s.ball &&
            s.ball.vx > 0
          ) {
            target = s.ball.y - s.ball.vy * AI_REACT;
            dz = AI_DEADZONE;
          }
          const d = target - old.cy;
          vy =
            Math.abs(d) <= dz
              ? 0
              : Math.sign(d) *
                Math.min(AI_SPEED, Math.abs(d) / Math.max(dt, 1e-9));
        }
        const cy = clamp(old.cy + vy * dt, PADDLE_MIN_CY, PADDLE_MAX_CY);
        if (cy !== old.cy && dt > 0) vy = (cy - old.cy) / dt;
        return { ...old, cy, vy };
      };
      s = { ...s, paddles: { left: move("left"), right: move("right") } };
      if (s.ball) {
        let b = s.ball;
        if (s.screen === "countdown") {
          const hold = Math.max(0, b.holdTimer - dt);
          if (hold <= 0) {
            const dir = s.receiver === "left" ? -1 : 1;
            b = {
              ...b,
              held: false,
              holdTimer: 0,
              vx: dir * SERVE_SPEED * Math.cos(SERVE_ANGLE),
              vy: b.serveSign * SERVE_SPEED * Math.sin(SERVE_ANGLE),
              trail: [],
            };
            s = { ...s, screen: "playing" };
          } else b = { ...b, holdTimer: hold };
        } else if (!b.held) {
          b = stepBall(b, s.paddles, s.obstacles, dt, api);
          if (b.x - BALL_R > FIELD_W || b.x + BALL_R < 0) {
            const scorer: Side = b.x - BALL_R > FIELD_W ? "left" : "right",
              p1 = s.score.p1 + (scorer === "left" ? 1 : 0),
              p2 = s.score.p2 + (scorer === "right" ? 1 : 0);
            api.audio.play(CUES.score);
            if (
              (p1 >= WIN_SCORE && p1 - p2 >= WIN_LEAD) ||
              (p2 >= WIN_SCORE && p2 - p1 >= WIN_LEAD)
            ) {
              s = {
                ...s,
                score: { p1, p2 },
                winner: scorer,
                screen: "matchover",
                menuIndex: 0,
                ball: b,
              };
            } else {
              s = {
                ...s,
                score: { p1, p2 },
                receiver: scorer === "left" ? "right" : "left",
                screen: "countdown",
                ball: park(),
              };
            }
          }
        }
        if (
          s.ball === b ||
          s.screen === "playing" ||
          s.screen === "countdown"
        ) {
          const now = s.simTime;
          b = {
            ...b,
            trail: [...b.trail, { x: b.x, y: b.y, t: now }].filter(
              (q) => now - q.t <= TRAIL_TIME,
            ),
          };
          s = { ...s, ball: b };
        }
      }
      if (s.obstacleClockRunning) {
        s = { ...s, obstacleClock: s.obstacleClock + dt };
        s = updatePose(s, s.obstacleClock);
      }
    }
    return s;
  },
  render(s: DeepReadonly<CaromState>, api: RenderApi) {
    const c = api.ctx;
    const field = s.screen === "title" || s.screen === "howto" ? 0.35 : 1;
    c.fillStyle = "#0c1524";
    c.fillRect(0, 0, FIELD_W, FIELD_H);
    c.strokeStyle = "rgba(145,185,215,.23)";
    c.lineWidth = 2;
    c.setLineDash([10, 14]);
    c.beginPath();
    c.moveTo(NET_X, 24);
    c.lineTo(NET_X, FIELD_H - 24);
    c.stroke();
    c.setLineDash([]);
    for (const o of s.obstacles) {
      c.save();
      c.translate(o.cx, o.cy);
      c.rotate(o.theta);
      c.shadowColor = "#ffc766";
      c.shadowBlur = 22;
      c.fillStyle = "#f1a94e";
      c.beginPath();
      c.roundRect(-OBSTACLE_W / 2, -OBSTACLE_H / 2, OBSTACLE_W, OBSTACLE_H, 10);
      c.fill();
      c.restore();
    }
    const drawPad = (side: Side, p: PaddleState, color: string) => {
      c.shadowColor = color;
      c.shadowBlur = 25;
      c.fillStyle = color;
      c.beginPath();
      c.roundRect(
        side === "left" ? P1_X0 : P2_X0,
        p.cy - PADDLE_H / 2,
        PADDLE_W,
        PADDLE_H,
        8,
      );
      c.fill();
      c.shadowBlur = 0;
    };
    drawPad("left", s.paddles.left, "#5be3d0");
    drawPad("right", s.paddles.right, "#ff718f");
    if (s.ball) {
      for (let i = 0; i < s.ball.trail.length; i++) {
        const q = s.ball.trail[i]!,
          a = (i + 1) / s.ball.trail.length;
        c.globalAlpha = 0.04 + 0.28 * a;
        c.fillStyle = "#e9f7ff";
        c.beginPath();
        c.arc(q.x, q.y, BALL_R * (0.38 + 0.42 * a), 0, Math.PI * 2);
        c.fill();
      }
      c.globalAlpha = 1;
      c.shadowColor = "#e9f7ff";
      c.shadowBlur = 24;
      c.fillStyle = "#f4fbff";
      c.beginPath();
      c.arc(s.ball.x, s.ball.y, BALL_R, 0, Math.PI * 2);
      c.fill();
      c.shadowBlur = 0;
    }
    if (
      s.screen === "playing" ||
      s.screen === "countdown" ||
      s.screen === "paused" ||
      s.screen === "matchover"
    ) {
      c.textAlign = "center";
      c.font = "700 58px system-ui";
      c.fillStyle = "#f5f8ff";
      c.fillText(String(s.score.p1), 560, 86);
      c.fillText(String(s.score.p2), 720, 86);
      c.font = "600 14px system-ui";
      c.fillStyle = "#91a8bd";
      c.fillText(
        s.mode === "solo" ? "SOLO · SPIN DUEL" : "VERSUS · LOCAL DUEL",
        FIELD_CX,
        115,
      );
    }
    if (s.screen === "title" || s.screen === "howto") {
      c.fillStyle = "rgba(5,10,18,.65)";
      c.fillRect(0, 0, FIELD_W, FIELD_H);
      c.textAlign = "center";
      c.shadowColor = "#56e1ce";
      c.shadowBlur = 30;
      c.fillStyle = "#f4fbff";
      c.font = "900 92px system-ui";
      c.fillText(TITLE_TEXT, FIELD_CX, 210);
      c.shadowBlur = 0;
      c.font = "600 15px system-ui";
      c.fillStyle = "#9bb1c6";
      c.fillText("A BANK SHOT DUEL OF ANGLES & SPIN", FIELD_CX, 250);
      if (s.screen === "title") {
        TITLE_ITEMS.forEach((item, i) => {
          const selected = i === s.menuIndex;
          c.fillStyle = selected ? "#5be3d0" : "#7e91a5";
          c.font = `${selected ? 800 : 600} ${selected ? 21 : 17}px system-ui`;
          c.fillText(item, FIELD_CX, 350 + i * 68);
          if (selected) c.fillText("◆", 370, 350 + i * 68);
        });
      } else {
        [
          "MOVE  W/S  ·  PLAYER TWO  ↑/↓",
          "PADDLE MOTION ADDS SPIN",
          "BANK SHOTS OFF THE MOVING GYRES",
        ].forEach((item, i) => {
          c.fillStyle = "#9bb1c6";
          c.font = "600 17px system-ui";
          c.fillText(item, FIELD_CX, 360 + i * 48);
        });
        c.fillStyle = "#5be3d0";
        c.font = "800 21px system-ui";
        c.fillText("BACK TO TITLE", FIELD_CX, 590);
      }
      c.font = "500 13px system-ui";
      c.fillStyle = "#778ba0";
      c.fillText("ENTER TO SELECT  ·  P TO PAUSE  ·  M TO MUTE", FIELD_CX, 650);
    }
    if (s.screen === "countdown") {
      c.textAlign = "center";
      c.font = "800 28px system-ui";
      c.fillStyle = "#eef8ff";
      c.fillText("GET READY", FIELD_CX, FIELD_CY - 55);
    }
    if (s.screen === "paused" || s.screen === "matchover") {
      c.fillStyle = "rgba(3,8,16,.76)";
      c.fillRect(0, 0, FIELD_W, FIELD_H);
      c.textAlign = "center";
      c.fillStyle = "#f4fbff";
      c.font = "900 52px system-ui";
      c.fillText(
        s.screen === "paused"
          ? "PAUSED"
          : `${s.winner === "left" ? "PLAYER ONE" : "PLAYER TWO"} WINS`,
        FIELD_CX,
        265,
      );
      if (s.screen === "matchover") {
        c.font = "600 23px system-ui";
        c.fillText(`${s.score.p1}  —  ${s.score.p2}`, FIELD_CX, 310);
      }
      const items = s.screen === "paused" ? PAUSE_ITEMS : MATCHOVER_ITEMS;
      items.forEach((item, i) => {
        c.fillStyle = i === s.menuIndex ? "#5be3d0" : "#a2b4c5";
        c.font = `${i === s.menuIndex ? 800 : 600} 20px system-ui`;
        c.fillText(item, FIELD_CX, 390 + i * 68);
      });
    }
    c.globalAlpha = field;
    c.globalAlpha = 1;
  },
};
