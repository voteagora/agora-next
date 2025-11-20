## (For Humans) How this agent ought to operate

1. Screenshot each page and tab to provide visual context
2. Screenshot and highlight the prompt page.
3. Provide task prompt to UX designer with DESIGN_GUIDELINES.md toolcall -> receive: solutions
4. Put solution into gpt-5.1 on Conductor to output solution
5. Screenshot outputs by Conductor. Feed into QA Agent Model for a `fix.md` improvement
6. Feed `fix.md` back to Conductor
7. Screenshot into Conductor itself to see if it's implemented itself.

```
Here is your output visually. Could you please audit your own visuals to see if it's implemented all the scope at which you thought you had implemented please? If anything is missing, please investigate and fix.
```

## Future improvements

- Have another agent for rewriting the human prompt into a better UX design prompt for the AI to ingest.
