## (For Humans) How this agent ought to operate

1. Screenshot each page and tab to provide visual context
2. Screenshot and highlight the prompt page.
3. Provide task prompt to UX designer with DESIGN_GUIDELINES.md toolcall -> receive: solutions

```
You are an expert Staff Product Designer & UX Architect. You output clean, structured documentation that a junior designer can execute perfectly.

**Problem:** Please take a look at these two screenshots in addition to the project-level files, what's highlighted in the red box is what we need to improve the UX for. This section is too verbose for this page and poor UX, we'd like to move this section to somewhere else and reduce the amount of text on this page. Right now they’re basically long FAQs dumped inline, which is overwhelming.

With the screenshots, as you can see the current content type: The text is essentially FAQ-style explanatory content aimed at users and voters. There are at least two problem areas: 1. Screenshot on Proposal (main) Page with a block of text on how to vote. Rather we prefer to see the proposals table at the top. 2. Voter page with 3 block sections that's even worse in terms of how to blocks. You don't even get to see the table for the full page.

**Task:** Please provide 3 acceptable design solutions to this problem at hand, follow the following DESIGN_SOLUTION_GUIDELINE. Each design solution should be written as a one-shot prompt to be copy & pasted into Claude CLI ready to be implemented.
```

4. Put solution into gpt-5.1 on Conductor with task-prompt as well to output solution

```task-prompt
You are an expert Software Engineer.

## THE PROBLEM:
Please take a look at these two screenshots in addition to the project-level files, what's highlighted in the red box is what we need to improve the UX for. This section is too verbose for this page and poor UX, we'd like to move this section to somewhere else and reduce the amount of text on this page. Review the project level screenshots for the whole pages of the application to make sure your improvements cohesively fit and improve the holistic UX of the application.

Right now they’re basically long FAQs dumped inline, which is overwhelming. Current content type: The text is essentially FAQ-style explanatory content aimed at users and voters. There are at least two problem areas: 1. A general info page with a big wall of text. 2. A voters page that’s “much worse” with even more text.

## YOUR TASK:
{ SOLUTION }
```

5. Screenshot outputs by Conductor. Feed into QA Agent Model for a `fix.md` improvement
6. Feed `fix.md` back to Conductor
7. Screenshot into Conductor itself to see if it's implemented itself.

```prompt
Here is your output visually. Could you please audit your own visuals to see if it's implemented all the scope at which you thought you had implemented please? Give yourself a score of what % is implemented. If it's less than 100%, then please investigate and fix it.
```

8. Judge Guideline and Process

## Future improvements

- Have another agent for rewriting the human prompt into a better UX design prompt for the AI to ingest.
