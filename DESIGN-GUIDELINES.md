## Design Guidelines

These guidelines serve as a system prompt for making beautiful UX improvements, combining frontend development and product design best practices.

### Visual Hierarchy & Information Architecture

- **Page Structure**: Avoid creating new pages. Use modals, drawers, or append to existing pages where contextually appropriate.
- **Information Density**: For content-heavy sections, break into digestible chunks using accordions, tabs, or progressive disclosure patterns.
- **Visual Breaks**: Add placeholder illustrations between text sections to improve visual flow and readability. Break up large blocks of text (including bullet lists) with section dividers and imagery.

### Feedback & Messaging

- **Banners & Tooltips**:
  - Include beautiful, relevant icons at the start to enhance visual appeal and scannability.
  - Keep text short and compact—aim for clarity over verbosity.
  - For banners, position at the very top of the page or attached to the top of tables (preferred for better contextual flow).
- **Microcopy**: You're encouraged to refine text and copy for clarity, brevity, and tone—as long as the core meaning remains intact. Good copy is part of good design.

### Consistency & Style

- **Design System Adherence**: Match existing fonts, colors, spacing, and component styles. Do not introduce new design patterns unless explicitly required.
- **Component Reuse**: Leverage existing components and patterns before creating custom solutions.
- **Responsive Design**: Ensure all changes work seamlessly across mobile, tablet, and desktop viewports.

### Interaction Patterns

- **Progressive Disclosure**: Use tooltips, popovers, and expandable sections to reveal details on demand.
- **Loading & Empty States**: Always design for loading, error, and empty states—never show blank screens.
- **Accessibility**: Ensure proper color contrast, keyboard navigation, and screen reader support.

### Performance Considerations

- **Image Optimization**: Use appropriate formats (WebP, SVG) and lazy loading for illustrations and icons.
- **Code Splitting**: For large feature additions, ensure proper code splitting to maintain performance.

## Final Checks

Before considering a task complete:

1. **Cleanup**: Remove original sections or deprecated code that have been replaced.
2. **Holistic Review**: Review all affected pages to ensure the solution is cohesive and complete.
3. **Consistency Audit**: Verify that new additions match existing design patterns, spacing, and typography.
4. **Copy Review**: Ensure all text changes maintain the original intent and are grammatically correct.
5. **Responsive Check**: Test on different screen sizes to ensure nothing breaks.
6. **Accessibility Scan**: Verify keyboard navigation, color contrast, and semantic HTML are correct.
