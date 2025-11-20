# Follow these rules when asked to improve UI polish

You are an expert product designer and frontend engineer with a keen eye for detail. You are being asked evaluate and improve the UI polish of some recently implemented changes from commit 97db4cbbafb6d3507f115971438bda039728d6c5.

1. Your bar for execution and details should be set at world class. Anything short of that should be flagged as an opportunity.
2. Your first priority is to make sure that the new UI implemented matches the quality bar and visual patterns of the existing app.
3. Ignore technical implementation polish. Focus only on the visual output.

## Process

- First, you must gather context:
  - Look at the commit, and understand every line of changes that was made.
  - Read the files that were changed.
  - Look at the screenshots provided.
- Now output to the user an ordered list of changes from this commit. Make sure you are able to identify each change on the screenshots. Wait for the user's confirmation before proceeding
- Then, read the UI guidelines below and familiarize yourself with how UI is done in this codebase.
- Now for each change in your ordered list, use the guidelines and your design judgment to identify all the issues or opportunities for improvement and for each, propose a single solution. Make sure to gut check the element in question by comparing to what's next to it in the screenshot. Give your output in an ordered list. 1 short sentence per issue and 1 short sentence per solution.
- wait for the user to confirm before continuing to the next change and its issues and opportunities

<!-- I added some scaffolding here. Please research the codebase and complete this section. Add anything else that's relevant -->

# UI guidelines

## Typography

- **Fonts & colors**
  - **Text colors**: Use **`text-primary`** for headings and key labels; **`text-secondary`** for standard body text; **`text-tertiary`** for hints, captions, and secondary labels.

- **Title levels**
  - **Page hero / H1**: Large page titles (e.g. info hero) use `font-black` with **`text-4xl`** on desktop, tight line-height (`leading-tight` / custom `leading-[36px]`), and `text-primary`. Use for the single main title of a page.
  - **Section titles / H2**: Major sections like “Voting process” or “How voting power works” use `text-2xl font-black text-primary` with a top margin (`mt-8`–`mt-12`) from the previous section. Use when a new page-level section begins.
  - **Subsection titles / H3**: Subtitles inside cards and modals (e.g. “About …”, dialog titles) use `text-xl font-bold text-primary`. Use when labeling a card, modal, or major panel within a section.
  - **Inline subheadings / step titles (H4–H5)**: Small headings inside info sections and lists use `text-base font-semibold text-primary` or `text-sm font-semibold text-primary` (e.g. numbered steps in governance guides, small callouts).

- **Body text**
  - **Default body**: Use **`text-base text-secondary`** with normal or relaxed line-height for multi-line copy. This is used for hero descriptions, info cards, and standard paragraphs.

- **Smaller-than-body styles and when to use them**
  - **`text-sm`**: Form descriptions (`InputDescription`), card descriptions (`CardDescription`), banner body text, and small supporting labels. Weight is usually `font-normal` or `font-medium`; color is `text-secondary` or `text-muted-foreground`.
  - **`text-xs`**: Only for legal copy (e.g. explanatory footnotes inside info sections). Pair with `text-tertiary` and keep line length short so it remains legible.

- **Other misc rules**
  - Combine multiple one-sentence paragraphs into a single paragraph where possible so pages don’t look like a stack of tiny text blocks.
  - Use hierarchy (title sizes, `text-primary` vs `text-secondary`) and layout to create emphasis instead of bolding or underlining random phrases inside paragraphs.

## Cards & sections

- **How we style cards**
  - **Standard app cards**: Use a light background (`bg-wash` or `bg-neutral`), `border border-line`, `rounded-xl`, and `shadow-newDefault`. Padding is typically `p-6`.

- **How card layouts typically work**
  - Cards are usually laid out with responsive stacks: `flex flex-col` on mobile and `sm:flex-row` or `sm:grid-cols-2/3` on larger screens, with `gap-4` or `gap-6` between columns.
  - Large cards with multiple regions (e.g. main content plus footer or tabs) keep a **single outer card** and separate regions using `border-t border-line` and inner padding (`p-6`), rather than adding nested card borders and shadows.
  - Section titles (`text-2xl font-black text-primary`) generally sit **above** the card group with `mt-4`–`mt-6`, not repeated inside every individual card.

## Borders & dividers

- **Outer borders**
  - Use **`border border-line`** for any surface that should read as a card, modal, or table container. `border-line` is the themed neutral stroke color and should be preferred over hard-coded grays.
  - Tables and list containers use row-level borders such as `border-b border-line` (or `divide-y divide-line`) while keeping a rounded outer container in some cases (e.g. delegate vote cards).

- **Dividers inside containers**
  - Inside a bordered container, use **full-width dividers** so the line visually connects to the card’s border. Implement this as `border-t border-line` on child sections or with the `Separator` component (`bg-line`, `h-[1px] w-full`).
  - Never leave dividers “floating” with side paddings that don’t meet the outer border; align them edge-to-edge within the card.
  - Use vertical dividers (`Separator` with `orientation="vertical"` or `w-[1px]`) sparingly for dense layouts; keep them aligned with other borders and avoid cutting through text.

## Border radius

- **Cards**
  - Standard data and content cards use **`rounded-lg`** or **`rounded-xl`**; info sections and larger feature cards lean toward `rounded-xl` (e.g. info page sections, governance guide blocks).
  - Avoid mixing multiple radius styles in the same visual cluster (e.g. an `rounded-md` card next to a `rounded-2xl` card) unless there is a strong reason (like a pill overlay).

- **Buttons and controls**
  - Shadcn `Button` defaults to **`rounded-md`**; this is the baseline for primary, secondary, and outline buttons.
  - Pills and special actions (e.g. header connect button, info hero CTAs, chip-like filters) use **`rounded-full`** or explicit large radii like `rounded-[40px]`.
  - Small controls such as number badges or icon-only chips may use `rounded-full` for perfectly circular shapes.

- **Banners and other elements**
  - Standalone banners use **`rounded-lg`** (see `DismissibleBanner`), matching the card radius but with slightly lighter shadow.
  - Banners **attached to cards** do not add extra radius; they align flush with the card’s top edge and use a `border-b` divider instead.
  - Avatars and circular icons always use **`rounded-full`**; thumbnail images inside info cards use `rounded-lg`.

## Commmon patterns

### Card sections in the info page

- **When we use them**
  - Info pages (e.g. “About …” and governance guides) use large card sections to group educational or narrative content that belongs together but should still feel distinct from the bare page background.
  - These sections often follow a `text-2xl font-black text-primary` heading and are used to explain concepts, show hero imagery, or present multi-step guides.

### Banners

- **Variants**
  - **Standalone banners**: Sit near the top of a page or above primary content (e.g. proposals lists, voters pages). They use `DismissibleBanner` without `attachedToCard`.
  - **Attached banners**: Live at the top of a specific card or panel when the message is scoped to that card. They use `DismissibleBanner` with `attachedToCard`, visually merging with the card rather than floating above it.

- **How they are styled**
  - **Standalone**: `flex items-start gap-3 px-4 py-3 bg-neutral border border-line rounded-lg shadow-newDefault`, optional small icon on the left, `text-sm font-semibold text-primary` title (if present), and `text-sm text-secondary leading-relaxed` body text. Close icon is right-aligned and subtle (`text-tertiary`).
  - **Attached**: `flex items-center gap-3 px-4 py-2.5 bg-wash/50 border-b border-line` with no extra radius or outer shadow. The banner’s border connects directly into the card’s top border.
  - Copy should be short and scannable: ideally a title plus **one** concise body line. If more explanation is needed, send users to an info page or modal; avoid turning banners into long multi-paragraph blocks.
  - Only use an icon when the banner is short and the icon meaningfully reinforces the message. Don’t pair a large multi-line banner with a leading icon, as it throws off vertical balance.

### Buttons

- Use our standard button when it is the main CTA on a screen in a flow or modal.
- Use the smaller button when it is repeated multiple times on a page or sits in a table row or small banner.
