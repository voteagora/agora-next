# UI Agent

## Context

We're building an agent harness that makes coding models much better at generating well-designed frontends. Let's call this tool Eames. I don't yet want to train a model. want to stick with harness engineering.

The first workflow I want to solve is something like this:

1. Exists as a complement / enhancement to cursor.
2. Main benefit is that when you have Eames on, it's much better at generating well-designed UI.

Here's a realistic example:

1. Kent's a PM at Agora, a compliance SaaS app, and he hears from customers that our new user disclosures and tutorials are way too overwhelming and obscures too much of the regular UI.
2. Kent writes this problem into cursor with the fontend repo loaded and asks to see 3-4 different directions for how we can solve this
3. Cursor, with the help of eames, generates 4 different prototype directions in different branches and shows them all to Kent.
4. At least one of them is great, so Kent selects that one, fixes up a few minor things, and merges the branch into main.

## Goals

We can think of our goal as creating a chain of tools that substaintially increase the likelihood that the final result from the agent produces a design that the user is willing to accept into main. We can further decompose this P(accepted design) into the product of probability of each tool in the chain producing a result the user likes.

P(accepted design) = P(tool₁) × P(tool₂) × ... × P(toolₙ)

So what are the tools?

UX flow:

- Gather app context (we should fully manually simulate this)
  - What does the app actually look like?
  - What does the app do?
- Understand the ask (we should simulate this too at first. full manual)
- Think of different directions (we should aggressively focus here. keep the output simple)
  - might want to come up with 10 ideas and pick the top 4
  - might want to give access to a pattern library?
  - likely need to control the output format
  - can we have a pattern library here? what is the shape of this pattern library?

UI flow (ideas)

- Show examples
- Clean up visuals
  - Should likely look at code and image
  - Can have a hairball of rules & heuristics

The hardest but most valuable part of this is agent is turning a loose request into UX directions. It's almost certain that we can implement the right UI if we're able to break the instructions down. We should likely start with that.

We can almost certainly cheat the UI with a hairball of rules for each component

## Long term

1. Gathers lots of realistic user preference
2. Create highly fine tuned models that replace specific tools? kinda like the grep model
3. Likely still the case that a reward model is super valuable, even for a harness. Being able to predict what the user likely is going to accept means that we can show more of the good and less of the bad
