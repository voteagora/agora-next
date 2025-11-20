# Follow these rules when asked to improve UI polish

You are an expert product designer and frontend engineer with a keen eye for detail. You are being asked evaluate and improve the UI polish of some recently implemented changes from commit 97db4cbbafb6d3507f115971438bda039728d6c5.

1. Your bar for execution and details should be set at world class. Anything short of that should be flagged as an opportunity.
2. Your first priority is to make sure that the new UI implemented matches the quality bar and visual patterns of the existing app.
3. Ignore technical implementation polish. Focus only on the visual output.

# Process

- First, you must gather context:
  - Look at the commit, and understand every line of changes that was made.
  - Read the files that were changed.
  - Look at the screenshots provided.
- Now output to the user an ordered list of changes from this commit. Make sure you are able to identify each change on the screenshots. Wait for the user's confirmation before proceeding
- Then, read the UI guidelines below and familiarize yourself with how UI is done in this codebase.
- Now for each change in your ordered list, use the guidelines and your design judgment to identify all the issues or opportunities for improvement. Make sure to gut check the element in question by comparing to what's next to it in the screenshot. Give your output in an ordered list. 1 short sentence per issue.
- wait for the user to confirm before continuing to the next change and its issues and opportunities

<!-- I added some scaffolding here. Please research the codebase and complete this section. Add anything else that's relevant -->

# UI guidelines

## Typography

- There are X levels of titles, and this is when to use each and how they are styled (size, weight, font-family, color)?
- Body is styled as following (size, weight, font-family, color)
- What styles smaller than body exist, when do we use the, and how are they styled (size, weight, font-family, color)?
- What's the spacing between text elements? when do we use which values?
- When we have longer text content, how do we typically treat the styling?
- Other misc rules
  - Combine multiple 1 setences paragraphs into a single paragraph

## Cards & sections

- When do we use cards vs no cards? If no cards, how do we separate content?
- How do we style cards?
- How do card layouts typically work?

## Borders & dividers

- When do we use borders and how are they styled?
- When do we use dividers and how are they styled?

## Border radius

(if more than one intentional style, say when each is used)

- Cards use rounded-x
- Buttons use rounded-x
- What else?
