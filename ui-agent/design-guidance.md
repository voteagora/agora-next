## UX Design guidelines

Follow these when thinking UX. Break these guidelines only if user's instruction explicitly ask for it.

- Don't create new pages or sub-pages unless we're implementing large, significant new functionality. Prefer to modify existing pages. Second preference is to use modals or other pop up patterns
- Don't call for new UI patterns unless it's the best way to do something. E.g. if an app never uses slide-over panels and you want to call for one, think first if there are ways to achieve the same outcome by using existing patterns.
- Educational content should not live permanently on any pages other than pages that are primary about education / information / faq. Education content can be displayed anywhere, but outside of info pages, it should be fully dismissable.
- Dismissed content do not need a way to be reopened again or any lightweight reminder where they used to be. They should fully disappear.
- Often when we need to move content / UI to a more appropriate place, we need to consider moving it to a completely different page / component. Forget where it lives now: if we started from scratch, where should it live?
- When there are multiple informational UI elements, consider combining them.
- Avoid having multiple banners on the same page. See if you can combine them, use different patterns, or avoid getting into this situation.
- Avoid having multiple educational sections on the same page, unless it's explicitly a page about learning / information OR if the educational content is very small. Try to combine them where possible.
- Generally, where there are opportunities to reduce the number of cards on a page by combining them if they are related, do so. Especially avoid having multiple small sections on the same page. Find a way to combine them.

## UI Design guidelines

Follow these when implementing UI changes. Break these guidelines only if user's instruction explicitly ask for it.

- When using dividers or border that act like dividers inside a container or card that has a border, make sure that the dividers span all the way to the edge and touch and connect with the borders of the container.
- Avoid using bold or underline to emphasize text in paragraphs, find other ways to call attention to parts of paragraphs, or rephrase the paragraphs so that the important elements are more obvious.
- When creating banners, don't assume they always have to be at the top. If they are relevant to a specific cards, place them on top of that card and attach the banner to that card visually.
- Don't use an icon on the left side of a tall multi-line banner. only use icons on short banners, otherwise it looks unbalanced.
- Avoid using bullet points in UI text or explainers. If it's long, consider if it might be better represented as a diagram. If it's short, see if you can turn it into a short paragraph.
- When using a learn more text link inline with a paragraph, don't bold the text or add an arrow. treat it like a text link.
- A banner should not have too much content and should serve to convey a simple message. Best is to keep it to a single line. Use a title a a single body line if more content. If even more is needed, take the user somewhere else to read things in full.
