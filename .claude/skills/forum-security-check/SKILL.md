---
name: forum-security-check
description: Security review checklist for forum/TipTap/markdown code paths. Checks sanitization, XSS vectors, SSR injection, and permission boundaries.
---

# Forum Security Check

Run this review whenever touching forum rendering, sanitize-html config, TipTap extensions, or forum API endpoints.

## Usage

```
/forum-security-check [file-or-directory]
```

If no path given, scan `src/app/forums/`, `src/components/forum*/`, and `src/lib/forum*.ts`.

## Checklist

### 1. sanitize-html allowlists
- [ ] `allowedTags` is an explicit allowlist — never use `false` (allows all)
- [ ] `allowedAttributes` is scoped per-tag, not `{ '*': ['*'] }`
- [ ] `href` attributes on `<a>` run through `allowedSchemes` (`['http','https','mailto']`) — no `javascript:` or `data:` URIs
- [ ] `src` on `<img>` restricted to same schemes
- [ ] No `<script>`, `<iframe>`, `<object>`, `<embed>`, `<form>` in allowedTags

### 2. TipTap extension config
- [ ] `Link` extension has `validate: href => /^https?:\/\//.test(href)` or equivalent
- [ ] `Image` extension restricts `src` — no `data:` URIs accepted
- [ ] Custom extensions that render HTML use `DOMPurify.sanitize()` or equivalent before setting innerHTML
- [ ] `allowedContent` / `parseHTML` in custom marks don't accept arbitrary attributes

### 3. `dangerouslySetInnerHTML` audit
- [ ] Every usage passes output through `sanitize-html` or DOMPurify, not raw DB content
- [ ] No user-supplied strings concatenated into JSX via `dangerouslySetInnerHTML`
- [ ] `rehype-external-links` is applied for any `react-markdown` rendering of user content

### 4. API / Server-side
- [ ] Forum post content is sanitized **before** storage in DB (not only on render)
- [ ] Forum API endpoints check `forumPermissionUtils` before write operations
- [ ] Markdown-to-HTML conversion in SSR paths uses the same sanitizer as client
- [ ] Rate limiting / auth applied to post/edit/delete endpoints

### 5. Forum subscription & notifications
- [ ] Email notification content is sanitized (strips HTML) before inclusion in email body
- [ ] Forum article slugs / IDs are validated to prevent path traversal in API routes

## Common pitfall patterns to grep for

```bash
# Check for unsanitized dangerouslySetInnerHTML
grep -rn "dangerouslySetInnerHTML" src/components src/app --include="*.tsx" --include="*.ts"

# Check for allowedTags: false
grep -rn "allowedTags.*false" src/ --include="*.ts" --include="*.tsx"

# Check for javascript: in link handling
grep -rn "javascript:" src/ --include="*.ts" --include="*.tsx"

# Check sanitize-html usage
grep -rn "sanitize-html\|sanitizeHtml\|DOMPurify" src/ --include="*.ts" --include="*.tsx"
```

## Reference incidents
- **Stored XSS** (fixed ~Apr 2025): Forum rendered unsanitized HTML from DB — fix added `sanitize-html` to render path. Verify the fix is present at `src/lib/forum*.ts` or equivalent.
