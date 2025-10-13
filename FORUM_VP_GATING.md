# Forum Voting Power Gating

This document describes how voting power requirements are enforced for forum actions in agora-next.

## Overview

Forum actions are now gated based on voting power (VP) requirements configured per-DAO in the admin panel. The system checks VP server-side to prevent client-side manipulation.

## Architecture

### 1. Settings Storage (agora_admin)

- **Table**: `alltenant.dao_forum_settings`
- **Columns**:
  - `min_vp_for_topics` - VP required to create topics
  - `min_vp_for_replies` - VP required to post replies
  - `min_vp_for_actions` - VP required for upvotes/reactions

### 2. Settings API (agora_admin)

- **Endpoint**: `GET /api/forum-settings?daoSlug={slug}`
- **Returns**: Current VP requirements for the DAO
- **Caching**: 5 minutes

### 3. VP Utilities (agora-next)

- **File**: `src/lib/forumSettings.ts`
- **Functions**:
  - `getForumSettings(daoSlug)` - Fetch settings from admin API
  - `canCreateTopic(currentVP, daoSlug)` - Check if user can create topics
  - `canCreatePost(currentVP, daoSlug)` - Check if user can post replies
  - `canPerformAction(currentVP, daoSlug)` - Check if user can upvote/react
  - `formatVPError(check, action)` - Format user-friendly error messages

### 4. VP Fetching (agora-next)

- **Function**: `fetchCurrentVotingPowerForNamespace(address)`
- **Location**: `src/app/api/common/voting-power/getVotingPower.ts`
- **Returns**: `{ directVP, advancedVP, totalVP }`

## Gated Actions

### ✅ Create Topic

**File**: `src/lib/actions/forum/topics.ts`
**Function**: `createForumTopic()`
**Check**: After signature verification, before content moderation
**Error**: "You need {X} voting power to create topics. You currently have {Y}."

### ✅ Create Post/Reply

**File**: `src/lib/actions/forum/posts.ts`
**Function**: `createForumPost()`
**Check**: After signature verification and topic validation
**Error**: "You need {X} voting power to post replies. You currently have {Y}."

### ✅ Upvote Topic

**File**: `src/lib/actions/forum/posts.ts`
**Function**: `upvoteForumTopic()`
**Check**: After signature verification, before topic lookup
**Error**: "You need {X} voting power to upvote. You currently have {Y}."

### ✅ React to Post

**File**: `src/lib/actions/forum/reactions.ts`
**Function**: `addForumReaction()`
**Check**: After signature verification, before emoji normalization
**Error**: "You need {X} voting power to react to posts. You currently have {Y}."

## Error Handling

All VP checks are wrapped in try-catch blocks:

```typescript
try {
  const vpData = await fetchCurrentVotingPowerForNamespace(address);
  const currentVP = parseInt(vpData.totalVP);
  const vpCheck = await canCreateTopic(currentVP, slug);

  if (!vpCheck.allowed) {
    return {
      success: false,
      error: formatVPError(vpCheck, "create topics"),
    };
  }
} catch (vpError) {
  console.error("Failed to check voting power:", vpError);
  // Continue if VP check fails - don't block legitimate users
}
```

**Rationale**: If the VP check fails due to network/API issues, we don't want to block legitimate users. The check is logged but the action proceeds.

## Admin Bypass

Admins automatically bypass all VP requirements. This is checked in the agora_admin backend before returning settings.

## UI Integration

Frontend components should:

1. Fetch user's delegate data using `useDelegate({ address })`
2. Fetch forum settings using `getForumSettings(daoSlug)`
3. Show/hide UI elements based on VP requirements
4. Display helpful error messages when requirements aren't met

Example:

```tsx
const { data: delegate } = useDelegate({ address });
const settings = await getForumSettings(daoSlug);

const canPost = delegate?.votingPower?.total >= settings.minVpForTopics;

if (!canPost) {
  return <div>You need {settings.minVpForTopics} VP to create topics</div>;
}
```

## Security Notes

⚠️ **IMPORTANT**: VP is always fetched and validated server-side. Never trust client-provided VP values.

✅ **Server-side checks**: All forum actions validate VP in server actions
✅ **Signature verification**: All actions require wallet signature
✅ **Admin API**: Settings are managed through authenticated admin API
✅ **Database permissions**: Only `api_user` can read/write settings

## Configuration

Admins can configure VP requirements at:
**Admin Panel** → **Permissions** → **Forum Voting Power Requirements**

Default values:

- Topics: 1 VP
- Replies: 1 VP
- Actions: 1 VP

## Testing

To test VP gating:

1. Set high VP requirements in admin panel (e.g., 1000 VP)
2. Try to create topic/post with low-VP wallet
3. Verify error message shows current vs required VP
4. Test with admin wallet - should bypass requirements
5. Test with high-VP wallet - should succeed

## Future Enhancements

- [ ] Per-category VP requirements
- [ ] Time-based VP requirements (e.g., higher VP for first 24 hours)
- [ ] Reputation-based multipliers
- [ ] Grace period for new users
