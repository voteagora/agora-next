# Follow these rules when you create design directions

## Process

1. Always check out the screenshots in the app-context folder before starting your task. Look at each screenshot to understand the overall design & layout of the app
2. For any surface you suggest changes to, make sure to read the code for that surface to understand its layout, content and core features before you suggest anything.
3. Always think of 3 distinct solutions
4. Each direction should be formatted as such:
   - one sentence explanation of the core concept
   - Bullet points that describe the changes needed to execute this direction. The bullet points should be 1 sentence. Bullet points should capture all changes needed. Make sure to address what should be done with every element called out in the brief, even if the action is "do nothing".
   - Bullet points must address what to do with all the elements highlighted in the brief. For example: "Delete [insert element] and replace it with [something new that does this, this, and that] on this page at the top of the right column"
   - 2-3 sentences to explain the general reasoning of the direction

## Design guidelines

Follow these when creating design directions. Break these guidelines only if user's instruction explicitly ask for it.

- Don't create new pages or sub-pages unless we're implementing large, significant new functionality. Prefer to modify existing pages. Second preference is to use modals or other pop up patterns
- When there are multiple informational UI elements, consider combining them.
- Don't call for new UI patterns unless it's the best way to do something. E.g. if an app never uses slide-over panels and you want to call for one, think first if there are ways to achieve the same outcome by using existing patterns.
- Educational content should not live permanently on any pages other than pages that are primary about education / information / faq. Education content can be displayed anywhere, but outside of info pages, it should be fully dismissable.
- Often when we need to move content / UI to a more appropriate place, we need to consider moving it to a completely different page / component. Forget where it lives now: if we started from scratch, where should it live?
- Avoid having multiple banners on the same page. See if you can combine them, use different patterns, or avoid getting into this situation.
- Avoid having multiple educational sections on the same page, unless it's explicitly a page about learning / information OR if the educational content is very small. Try to combine, use different patterns, or avoid getting into this situation.

## UI implementation guidelines

Follow these when implementing UI changes

- When using dividers or border that act like dividers inside a container or card that has a border, make sure that the dividers span all the way to the edge and touch and connect with the borders of the container.
- Avoid using bold or underline to emphasize text in paragraphs, find other ways to call attention to parts of paragraphs, or rephrase the paragraphs so that the important elements are more obvious.
- When creating banners, don't assume they always have to be at the top. If they are relevant to a specific section, place them on top of that section and attach the banner to that section visually
- Don't use an icon on the left side of a tall multi-line banner. only use icons on short banners, otherwise it looks unbalanced.
- Avoid using bullet points in UI text or explainers. Prefer short sinccinct prose.
- When using a learn more text link inline with a paragraph, don't bold the text or add an arrow. treat it like a text link.
