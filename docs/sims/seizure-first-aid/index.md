# Seizure First Aid Simulator

Practice responding to a seizure in real time. A student begins having a seizure; your job is
to take the correct actions (the three S's from [Chapter 2](../../chapters/02-seizure-first-aid/index.md))
and decide **if and when to call 911**. Each run uses a different seizure length, so you cannot
just memorize one answer.

<iframe src="main.html" width="100%" height="560" class="microsim" title="Seizure First Aid Simulator" loading="lazy"></iframe>

[Open the simulator full screen](main.html){ .md-button }

## How to use it
1. Press **START**.
2. While the seizure is in progress, click the correct actions: time it, clear the area,
   cushion the head, and turn the student on their side.
3. Watch the clock. If a convulsive seizure passes **5 minutes**, it becomes a 911 emergency.
4. Some scenarios stop on their own before 5 minutes (do not call 911); others run long (you
   must call). Press **RESET** to try another.

## What it teaches
- Timing the seizure is what tells you when to escalate.
- Never restrain or put anything in the mouth (there is no button for those because you should
  never do them).
- Turn on the side only once the jerking eases.
- Calling 911 is right for long or repeating seizures, breathing trouble, water, injury, a
  first seizure, or when the student's plan says so.

!!! warning
    This is a learning tool, not medical advice or certification. For free, real certification,
    see the [Epilepsy Foundation training](https://www.epilepsy.com/programs/training-education).

## MicroSim metadata
- **Type:** p5.js interactive simulation
- **Files:** `main.html`, `sketch.js`
- **Learning objective:** apply seizure first aid and the 5-minute 911 rule under time pressure
- **Source chapter:** [Seizure First Aid](../../chapters/02-seizure-first-aid/index.md)
