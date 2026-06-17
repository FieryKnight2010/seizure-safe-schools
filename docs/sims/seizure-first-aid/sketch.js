// Seizure First Aid Simulator (p5.js MicroSim)
// A purposeful simulation: the user manages a simulated seizure in real time,
// choosing correct actions (the three S's) and deciding when to call 911.
// Teaches the protocol from Chapter 2; not medical advice.

let canvasWidth = 800;
let drawHeight = 380;
let controlHeight = 150;
let canvasHeight = drawHeight + controlHeight;

let state = "ready";        // ready | seizing | recovery | done
let seizureStart = 0;
let elapsed = 0;            // simulated seconds
let speed = 12;             // simulated seconds per real second
let score = 0;
let messages = [];
let did = { time: false, clear: false, cushion: false, side: false, called: false };
let seizureLength = 0;      // chosen randomly per run (simulated seconds)
let buttons = [];

function setup() {
  let c = createCanvas(canvasWidth, canvasHeight);
  c.parent('sketch-holder');
  textFont('system-ui');
  buildButtons();
  resetSim(2);  // first run deterministic-ish
}

function buildButtons() {
  buttons = [
    { label: "Time the seizure", key: "time", x: 20 },
    { label: "Clear the area", key: "clear", x: 165 },
    { label: "Cushion the head", key: "cushion", x: 310 },
    { label: "Turn on side", key: "side", x: 455 },
    { label: "Call 911", key: "called", x: 600 },
  ];
}

function resetSim(seedish) {
  state = "ready";
  elapsed = 0;
  score = 0;
  messages = ["Press START. A student is about to have a seizure. Respond correctly."];
  did = { time: false, clear: false, cushion: false, side: false, called: false };
  // seizure length between 60 and 360 simulated seconds; varies by run index
  seizureLength = 60 + ((frameCount + (seedish||0) * 97) % 6) * 60;
}

function draw() {
  // simulate time
  if (state === "seizing" || state === "recovery") {
    elapsed += speed / 60.0;
  }
  if (state === "seizing" && elapsed >= seizureLength) {
    state = "recovery";
    addMsg("The seizure has stopped on its own. Stay and reassure the student.");
  }
  if (state === "recovery" && elapsed >= seizureLength + 30) {
    finish();
  }

  // background
  background(247);
  noStroke();
  fill(255);
  rect(0, 0, canvasWidth, drawHeight);
  fill(240);
  rect(0, drawHeight, canvasWidth, controlHeight);

  drawScene();
  drawTimer();
  drawMessages();
  drawButtons();
}

function drawScene() {
  push();
  translate(canvasWidth / 2, 150);
  // figure: shakes during seizure, lies on side in recovery
  let shake = (state === "seizing") ? sin(frameCount * 0.9) * 6 : 0;
  fill(state === "recovery" || state === "done" ? "#7bb274" : "#c0c0c0");
  if (state === "recovery" || state === "done") {
    // lying on side
    ellipse(shake, 30, 150, 60);   // body
    ellipse(-70, 20, 46, 46);      // head
  } else {
    ellipse(shake, 30, 70, 110);   // body
    ellipse(shake, -30, 50, 50);   // head
  }
  pop();

  fill(60);
  textAlign(CENTER, TOP);
  textSize(15);
  let title = { ready: "Ready", seizing: "SEIZURE IN PROGRESS",
                recovery: "Recovery (postictal)", done: "Complete" }[state];
  text(title, canvasWidth / 2, 270);
}

function drawTimer() {
  textAlign(LEFT, TOP);
  textSize(14);
  fill(40);
  let mm = floor(elapsed / 60);
  let ss = floor(elapsed % 60);
  let t = nf(mm, 2) + ":" + nf(ss, 2);
  let overFive = elapsed >= 300 && state === "seizing";
  fill(overFive ? "#b3202c" : 40);
  text("Seizure time: " + (did.time ? t : "-- (not timing!)"), 20, 300);
  if (overFive && !did.called) {
    fill("#b3202c");
    text("Over 5 minutes - this is now a 911 emergency!", 20, 322);
  }
  fill(40);
  text("Score: " + score, canvasWidth - 110, 300);
}

function drawMessages() {
  textAlign(LEFT, TOP);
  textSize(13);
  fill(70);
  let shown = messages.slice(-3);
  for (let i = 0; i < shown.length; i++) {
    text("- " + shown[i], 20, 340 + i * 18, canvasWidth - 40);
  }
}

function drawButtons() {
  textSize(13);
  // START / RESET button
  drawBtn(canvasWidth - 150, drawHeight + 95, 130, 36,
          state === "ready" ? "START" : "RESET", "#b3202c", "#fff");
  // action buttons (active during seizing/recovery)
  let active = (state === "seizing" || state === "recovery");
  for (let b of buttons) {
    let done = did[b.key];
    let col = done ? "#cccccc" : (active ? "#1f6f3f" : "#e6e6e6");
    let tc = (active && !done) ? "#fff" : "#888";
    drawBtn(b.x, drawHeight + 50, 135, 38, b.label, col, tc);
  }
  fill(110);
  textAlign(LEFT, TOP);
  text("During the seizure, choose the correct actions. Decide if and when to call 911.",
       20, drawHeight + 16, canvasWidth - 180);
}

function drawBtn(x, y, w, h, label, bg, tc) {
  push();
  fill(bg);
  rect(x, y, w, h, 8);
  fill(tc);
  textAlign(CENTER, CENTER);
  textSize(13);
  text(label, x + w / 2, y + h / 2);
  pop();
}

function mousePressed() {
  // start/reset
  if (hit(canvasWidth - 150, drawHeight + 95, 130, 36)) {
    if (state === "ready") startSeizure();
    else resetSim(floor(random(1, 6)));
    return;
  }
  if (state !== "seizing" && state !== "recovery") return;
  for (let b of buttons) {
    if (hit(b.x, drawHeight + 50, 135, 38)) handleAction(b.key);
  }
}

function startSeizure() {
  state = "seizing";
  elapsed = 0;
  addMsg("A student has collapsed and is convulsing. What do you do?");
}

function handleAction(key) {
  if (did[key] && key !== "called") return;
  switch (key) {
    case "time":
      did.time = true; score += 15;
      addMsg("Good. You are timing the seizure. This decides when to call 911.");
      break;
    case "clear":
      did.clear = true; score += 15;
      addMsg("Good. Area cleared and others kept back.");
      break;
    case "cushion":
      did.cushion = true; score += 15;
      addMsg("Good. Head cushioned; nothing in the mouth, no restraining.");
      break;
    case "side":
      if (state === "seizing" && elapsed < 8) {
        addMsg("Wait for the jerking to ease before turning them, but be ready.");
        score -= 3;
      } else {
        did.side = true; score += 20;
        addMsg("Good. Turned on their side to help breathing.");
      }
      break;
    case "called":
      handleCall();
      break;
  }
}

function handleCall() {
  if (state === "recovery") {
    addMsg("The seizure already stopped safely; 911 was not required this time.");
    score -= 5; did.called = true; return;
  }
  if (elapsed >= 300) {
    addMsg("Correct call. Over 5 minutes is a 911 emergency.");
    score += 25; did.called = true;
  } else {
    addMsg("A bit early: for a typical seizure you call 911 at 5 minutes (or per the plan). "
           + "Keep watching the clock.");
    score -= 8;
  }
}

function finish() {
  state = "done";
  // penalty if a long seizure was never escalated
  if (seizureLength >= 300 && !did.called) {
    addMsg("This seizure passed 5 minutes and 911 was never called. Always escalate.");
    score -= 20;
  }
  let core = did.time && did.clear && did.cushion && did.side;
  addMsg(core ? "You covered the core steps: Stay, Safe, Side."
              : "Some core steps were missed. Review: Stay, Safe, Side.");
  addMsg("Final score: " + score + ". Press RESET to try a different scenario.");
}

function addMsg(m) { messages.push(m); }

function hit(x, y, w, h) {
  return mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h;
}
