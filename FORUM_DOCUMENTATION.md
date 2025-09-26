# Forum System Documentation

## Overview

The Agora Forum system is a comprehensive discussion platform built for DAO governance and community engagement. It provides a multi-tenant architecture supporting categories, topics, posts, attachments, reactions, upvoting, and advanced moderation features. The system includes specialized DUNA integration for quarterly reports and document management.

### Key Features

- **Multi-tenant Architecture**: Isolated data per DAO using `dao_slug`
- **Real-time Interactions**: Emoji reactions, upvoting, and live updates
- **Content Moderation**: NSFW detection, soft/hard deletion, archival
- **File Management**: IPFS-based document storage and sharing
- **Search Integration**: Full-text search with real-time indexing
- **Admin System**: Role-based permissions and audit logging
- **DUNA Integration**: Specialized components for quarterly reports

## Architecture

### System Overview

```mermaid
graph TB
    subgraph "Client Layer"
        UI[Forum UI Components]
        DUNA[DUNA Components]
        Hooks[React Hooks]
        Utils[Utility Functions]
    end

    subgraph "API Layer"
        Actions[Server Actions]
        Routes[API Routes]
        Auth[Authentication]
    end

    subgraph "Service Layer"
        Search[Search Service]
        Moderation[Content Moderation]
        Analytics[Analytics & Tracking]
        FileStorage[IPFS Storage]
        Reactions[Emoji Reactions]
        Upvoting[Topic Upvoting]
    end

    subgraph "Data Layer"
        DB[(PostgreSQL)]
        Redis[(Redis Cache)]
        Index[Search Index]
    end

    UI --> Hooks
    DUNA --> Hooks
    Hooks --> Actions
    Actions --> Auth
    Actions --> DB
    Actions --> Search
    Actions --> Moderation
    Actions --> FileStorage
    Actions --> Reactions
    Actions --> Upvoting
    Routes --> Analytics
    Analytics --> Redis
    Search --> Index
    Moderation --> DB
    FileStorage --> DB
    Reactions --> DB
    Upvoting --> DB
```

### Database Schema

The forum system uses PostgreSQL with Prisma ORM and follows a multi-tenant architecture where each DAO has its own data isolation through `dao_slug`.

#### Core Entities

```mermaid
erDiagram
    forum_categories {
        serial id PK
        config_dao_slug dao_slug
        text name
        text description
        timestamptz created_at
        timestamptz updated_at
        boolean archived
        boolean admin_only_topics
        boolean is_duna
        text[] tags
    }

    forum_topics {
        serial id PK
        config_dao_slug dao_slug
        text title
        text address
        integer category_id FK
        integer posts_count
        timestamptz created_at
        timestamptz updated_at
        boolean archived
        timestamptz deleted_at
        text deleted_by
        boolean is_nsfw
    }

    forum_posts {
        serial id PK
        config_dao_slug dao_slug
        integer topic_id FK
        text address
        integer parent_post_id FK
        text content
        timestamptz created_at
        timestamptz deleted_at
        text deleted_by
        boolean is_nsfw
    }

    forum_post_votes {
        config_dao_slug dao_slug PK
        text address PK
        integer post_id PK
        smallint vote
        timestamptz created_at
    }

    forum_post_reactions {
        config_dao_slug dao_slug PK
        text address PK
        integer post_id PK
        text emoji PK
        timestamptz created_at
    }

    forum_post_attachments {
        serial id PK
        config_dao_slug dao_slug
        integer post_id FK
        text ipfs_cid
        text file_name
        text content_type
        bigint file_size
        text address
        boolean archived
        timestamptz created_at
    }

    forum_category_attachments {
        serial id PK
        config_dao_slug dao_slug
        integer category_id FK
        text ipfs_cid
        text file_name
        text content_type
        bigint file_size
        text address
        boolean archived
        timestamptz created_at
    }

    forum_topic_subscriptions {
        config_dao_slug dao_slug PK
        text address PK
        integer topic_id PK
        timestamptz created_at
    }

    forum_category_subscriptions {
        config_dao_slug dao_slug PK
        text address PK
        integer category_id PK
        timestamptz created_at
    }

    forum_audit_logs {
        serial id PK
        config_dao_slug dao_slug
        text admin_address
        text action
        attachable_type target_type
        integer target_id
        timestamptz created_at
    }

    forum_topic_view_stats {
        config_dao_slug dao_slug PK
        integer topic_id PK
        integer views
        timestamptz last_updated
    }

    forum_permissions {
        serial id PK
        config_dao_slug dao_slug
        forum_permission_type permission_type
        permission_scope scope
        integer scope_id
        text address
    }

    forum_admins {
        config_dao_slug dao_slug PK
        text address PK
        admin_role role
        config_dao_slug[] managed_accounts
        timestamptz created_at
    }

    attachable_type {
        enum forum
        enum category
        enum topic
        enum post
    }

    forum_permission_type {
        enum manage_topics
        enum create_topics
        enum manage_attachments
        enum create_attachments
    }

    permission_scope {
        enum forum
        enum category
    }

    admin_role {
        enum admin
        enum duna_admin
        enum super_admin
    }

    forum_categories ||--o{ forum_topics : "has many"
    forum_topics ||--o{ forum_posts : "has many"
    forum_posts ||--o{ forum_posts : "replies to"
    forum_post_votes }o--|| forum_posts : "votes on"
    forum_post_reactions }o--|| forum_posts : "reacts to"
    forum_post_attachments }o--|| forum_posts : "attached to"
    forum_category_attachments }o--|| forum_categories : "attached to"
    forum_topic_subscriptions }o--|| forum_topics : "subscribes to"
    forum_category_subscriptions }o--|| forum_categories : "subscribes to"
    forum_audit_logs }o--|| forum_categories : "logs actions on"
    forum_audit_logs }o--|| forum_topics : "logs actions on"
    forum_audit_logs }o--|| forum_posts : "logs actions on"
    forum_topic_view_stats }o--|| forum_topics : "tracks views"
    forum_permissions }o--|| forum_categories : "scoped to"
```

### Key Design Decisions

1. **Post-Centric Design**: All user interactions (votes, reactions) are post-specific
2. **Multi-Tenant Architecture**: Every table includes `dao_slug` for tenant isolation
3. **Content Moderation**: Supports archival, soft deletion, hard deletion, and NSFW filtering
4. **Enhanced Admin System**: Role hierarchy with granular permissions
5. **Real-time Analytics**: Redis overlay for view tracking with Postgres persistence

## API Layer

### Data Flow Architecture

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant Hook
    participant Action
    participant DB
    participant Search
    participant IPFS

    User->>UI: Create Topic
    UI->>Hook: createTopic()
    Hook->>Action: createForumTopic()
    Action->>Action: Verify Signature
    Action->>Action: Moderate Content
    Action->>DB: Create Topic & Post
    Action->>Search: Index Content
    Action->>IPFS: Upload Attachments
    Action-->>Hook: Success Response
    Hook-->>UI: Update State
    UI-->>User: Show Success
```

### Server Actions

The forum system uses Next.js server actions for all database operations:

#### Topics (`src/lib/actions/forum/topics.ts`)

- `getForumTopics(options)` - Fetch topics with pagination and filtering
- `getForumTopic(topicId)` - Get single topic with posts
- `createForumTopic(data)` - Create new topic with signature verification
- `deleteForumTopic(data)` - Hard delete topic (admin only)
- `softDeleteForumTopic(data)` - Soft delete topic
- `restoreForumTopic(data)` - Restore soft-deleted topic
- `archiveForumTopic(data)` - Archive topic
- `upvoteForumTopic(data)` - Upvote a topic
- `removeUpvoteForumTopic(data)` - Remove upvote from topic
- `getForumTopicUpvotes(topicId)` - Get upvote count for topic
- `getMyForumTopicVote(topicId, address)` - Get user's vote on topic

#### Posts (`src/lib/actions/forum/posts.ts`)

- `createForumPost(topicId, data)` - Create new post/reply
- `deleteForumPost(data)` - Hard delete post
- `softDeleteForumPost(data)` - Soft delete post
- `restoreForumPost(data)` - Restore soft-deleted post
- `getForumPostsByTopic(topicId)` - Get all posts for a topic
- `getForumPost(postId)` - Get single post

#### Reactions (`src/lib/actions/forum/reactions.ts`)

- `addForumReaction(data)` - Add emoji reaction to post
- `removeForumReaction(data)` - Remove emoji reaction from post

#### Categories (`src/lib/actions/forum/categories.ts`)

- `getForumCategories()` - Fetch all categories
- `getForumCategory(categoryId)` - Get single category
- `getDunaCategoryId()` - Get DUNA-specific category

#### Attachments (`src/lib/actions/forum/attachments.ts`)

- `getForumAttachments()` - Fetch all attachments
- `uploadFileToIPFS(file)` - Upload file to IPFS
- `uploadDocumentFromBase64(data, fileName, contentType, address, signature, message, categoryId)` - Upload document
- `deleteForumAttachment(data)` - Delete attachment
- `archiveForumAttachment(data)` - Archive attachment

#### Admin (`src/lib/actions/forum/admin.ts`)

- `checkForumPermissions(address, categoryId?)` - Check user permissions
- `logForumAuditAction(daoSlug, adminAddress, action, targetType, targetId)` - Log admin actions

#### Analytics (`src/lib/actions/forum/analytics.ts`)

- `trackForumView(data)` - Track topic view
- `getForumViewStats(targetType, targetId)` - Get view statistics
- `subscribeToForumContent(data)` - Subscribe to topic/category
- `unsubscribeFromForumContent(data)` - Unsubscribe from content
- `getForumSubscriptions(address)` - Get user subscriptions

#### Search (`src/lib/actions/forum/search.ts`)

- `indexForumTopic(data)` - Index topic for search
- `indexForumPost(data)` - Index post for search
- `removeForumTopicFromIndex(topicId, daoSlug)` - Remove from search index
- `removeForumPostFromIndex(postId, daoSlug)` - Remove from search index

### API Routes

#### View Sync (`src/app/api/v1/forum/sync-views/route.ts`)

- `POST /api/v1/forum/sync-views` - Sync Redis view counts to Postgres (cron job)

## Frontend Layer

### Hooks

#### `useForum` Hook (`src/hooks/useForum.ts`)

Main hook for forum operations:

```typescript
const {
  loading,
  error,
  isAuthenticated,
  fetchTopics,
  fetchTopic,
  createTopic,
  createPost,
  deleteTopic,
  deletePost,
  deleteAttachment,
  fetchDocuments,
  uploadDocument,
  fetchCategories,
  archiveTopic,
  archiveAttachment,
  restoreTopic,
  restorePost,
} = useForum();
```

#### `useForumAdmin` Hook

Permission checking hook:

```typescript
const {
  isAdmin,
  canCreateTopics,
  canManageTopics,
  canCreateAttachments,
  canManageAttachments,
  isLoading,
} = useForumAdmin(categoryId?);
```

### Utilities

#### `forumUtils.ts` (`src/lib/forumUtils.ts`)

Type definitions and utility functions:

```typescript
interface ForumTopic {
  id: number;
  title: string;
  author: string;
  content: string;
  createdAt: string;
  comments: ForumPost[];
  attachments: ForumAttachment[];
  deletedAt?: string | null;
  deletedBy?: string | null;
  isNsfw?: boolean;
}

interface ForumPost {
  id: number;
  author: string;
  content: string;
  createdAt: string;
  parentId?: number;
  attachments?: ForumAttachment[];
  deletedAt?: string | null;
  deletedBy?: string | null;
  isNsfw?: boolean;
}

interface ForumCategory {
  id: number;
  name: string;
  description?: string;
  archived: boolean;
  adminOnlyTopics: boolean;
  createdAt: string;
  updatedAt: string;
  isDuna?: boolean;
}

// Utility functions
function transformForumTopics(
  data: any[],
  options?: TransformForumTopicsOptions
): ForumTopic[];
function canArchiveContent(
  userAddress: string,
  contentAuthor: string,
  isAdmin: boolean,
  isModerator: boolean
): boolean;
function canDeleteContent(
  userAddress: string,
  contentAuthor: string,
  isAdmin: boolean,
  isModerator: boolean
): boolean;
```

## Interactive Features

### Emoji Reactions

The forum system supports emoji reactions on posts, allowing users to express their feelings and engagement:

#### `EmojiReactions` Component (`src/components/Forum/EmojiReactions.tsx`)

- **Default Emojis**: 👍, 🔥, 🤔, 👀, 🎉, ❤️, 👏, 😄, 🤝
- **Real-time Updates**: Optimistic UI updates with server sync
- **User-specific**: Tracks which users have reacted with which emojis
- **Unicode Normalization**: Ensures consistent emoji storage using NFC normalization

#### Features:

- Click to add/remove reactions
- Visual feedback for user's own reactions
- Reaction count display
- Popover picker for emoji selection
- Graceful error handling with rollback

### Topic Upvoting

Users can upvote topics to show support and help surface quality content:

#### Upvoting System:

- **One vote per user per topic**: Prevents vote manipulation
- **Real-time counts**: Immediate UI updates
- **Signature verification**: All votes require wallet signature
- **Vote persistence**: Stored in `forum_post_votes` table

#### Features:

- Upvote/remove upvote functionality
- Vote count display on topic cards
- User vote status tracking
- Admin and author vote management

### Admin Badges

Visual indicators for forum administrators and moderators:

#### `ForumAdminBadge` Component (`src/components/Forum/ForumAdminBadge.tsx`)

- **Role-based badges**: Different styles for different admin roles
- **Admin types**: Admin, Duna Admin, Super Admin
- **Visual hierarchy**: Color-coded badges for easy identification
- **Contextual display**: Shows on user avatars and content

## DUNA Integration

The forum system includes special integration for DUNA (Decentralized Universal Node Administration) with dedicated components:

### Components

#### `DunaAdministration.tsx`

Main DUNA administration component that fetches and displays documents and reports. Includes tenant-specific configuration and error handling.

#### `QuarterlyReportsSection.tsx`

Manages quarterly reports with:

- Report creation and display
- Comment system integration
- Archive/delete functionality
- Pagination for older reports
- Real-time updates

#### `DocumentsSection.tsx`

Handles document management with:

- Document upload and display
- File type validation and support
- Archive/delete operations
- Permission-based access control
- Progress tracking for uploads

#### `QuarterlyReportCard.tsx`

Individual report card component with metadata display and interaction controls.

#### `ReportModal.tsx`

Modal for viewing full reports with:

- Full report content display
- Comment system integration
- Reply functionality
- Admin controls for moderation
- Real-time comment updates

#### `DocumentUploadModal.tsx`

Modal for uploading new documents with:

- File selection and validation
- Progress tracking
- Error handling and retry
- File type restrictions
- Size limit enforcement

#### `CommentList.tsx`

Comment system for reports and posts with:

- Nested reply support
- Real-time updates
- Moderation controls
- User identification

#### `CreatePostModal.tsx`

Modal for creating new posts and replies with rich text editing capabilities.

## Content Moderation

### Moderation Flow

```mermaid
flowchart TD
    A[User Creates Content] --> B{Content Type}
    B -->|Topic/Post| C[Automatic Moderation]
    B -->|Attachment| D[File Validation]

    C --> E{NSFW Detection}
    E -->|Safe| F[Content Approved]
    E -->|NSFW| G[Flag as NSFW]

    D --> H{File Type Valid}
    H -->|Valid| I[Upload to IPFS]
    H -->|Invalid| J[Reject Upload]

    F --> K[Index for Search]
    G --> L[Hide from Public]
    I --> M[Store Metadata]

    K --> N[Content Live]
    L --> O[Admin Review]
    M --> N

    O --> P{Admin Decision}
    P -->|Approve| Q[Restore Content]
    P -->|Reject| R[Soft Delete]

    Q --> N
    R --> S[Content Hidden]
```

### Automatic Moderation

- **NSFW Detection**: Automatic content filtering using Open AI moderation service
- **Content Analysis**: Text analysis for inappropriate content
- **Auto-flagging**: Automatic flagging of problematic content

### Manual Moderation

- **Soft Delete**: Content hidden but recoverable
- **Hard Delete**: Permanent removal from database
- **Archive**: Content moved to archived state
- **Restore**: Recovery of soft-deleted content

### Permission System

- **Role-based Access**: Admin, Duna Admin, Super Admin roles
- **Granular Permissions**: Topic creation, management, attachment handling
- **Scope-based Access**: Forum-wide or category-specific permissions

## Search Integration

### Search Service

- **Full-text Search**: Topics and posts indexed for search
- **Real-time Indexing**: Automatic indexing on content creation
- **Multi-tenant Search**: Isolated search per DAO
- **Content Filtering**: NSFW content excluded from search

### Search Features

- Topic and post content search
- Author-based filtering
- Category-based filtering
- Date range filtering

## Analytics and Tracking

### View Tracking Architecture

```mermaid
graph LR
    subgraph "Real-time Layer"
        U[User Views Topic]
        R[Redis Counter]
        V[View Tracker]
    end

    subgraph "Persistence Layer"
        C[Cron Job]
        P[Postgres Stats]
        S[Sync Process]
    end

    subgraph "Analytics Layer"
        A[Analytics API]
        D[Dashboard]
        M[Metrics]
    end

    U --> V
    V --> R
    C --> S
    S --> R
    S --> P
    A --> P
    A --> R
    A --> D
    D --> M
```

### Subscription Flow

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant Hook
    participant Action
    participant DB
    participant Notify

    User->>UI: Subscribe to Topic
    UI->>Hook: subscribeToContent()
    Hook->>Action: subscribeToForumContent()
    Action->>Action: Verify Signature
    Action->>DB: Create Subscription
    Action-->>Hook: Success
    Hook-->>UI: Update UI

    Note over DB,Notify: When new content is created
    DB->>Notify: Trigger Notification
    Notify->>User: Send Update
```

### View Tracking

- **Redis Overlay**: Real-time view counting
- **Postgres Persistence**: Long-term storage
- **Cron Sync**: Regular synchronization between Redis and Postgres
- **Unique Views**: IP and address-based deduplication

### Subscription System

- **Topic Subscriptions**: Follow specific topics
- **Category Subscriptions**: Follow entire categories
- **Notification System**: Real-time updates for subscribed content

## Security Features

### Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Wallet
    participant UI
    participant Action
    participant DB

    User->>Wallet: Connect Wallet
    Wallet-->>UI: Wallet Address

    User->>UI: Perform Action
    UI->>Wallet: Sign Message
    Wallet-->>UI: Signature

    UI->>Action: Action + Signature
    Action->>Action: Verify Signature
    Action->>Action: Check Permissions
    Action->>DB: Execute Action
    Action-->>UI: Success/Error
```

### Authentication

- **Wallet Integration**: Web3 wallet authentication
- **Signature Verification**: Signature validation
- **Message Signing**: Required for all write operations

### Authorization

- **Permission Checks**: Granular permission validation
- **Admin Roles**: Hierarchical admin system
- **Content Ownership**: Author-based access control

### Audit Trail

- **Action Logging**: Complete audit log of admin actions
- **Target Tracking**: Specific content and user tracking
- **Timestamp Recording**: Precise action timing

## File Management

### File Upload Flow

```mermaid
flowchart TD
    A[User Selects File] --> B{File Validation}
    B -->|Valid| C[Convert to Base64]
    B -->|Invalid| D[Show Error]

    C --> E[Sign Message]
    E --> F[Upload to IPFS]
    F --> G{Upload Success}
    G -->|Success| H[Store Metadata in DB]
    G -->|Failed| I[Show Upload Error]

    H --> J[Update UI]
    I --> K[Retry Option]
    D --> L[File Type Error]
```

### IPFS Integration Architecture

```mermaid
graph LR
    subgraph "Client Side"
        F[File Selection]
        B[Base64 Conversion]
        S[Signature Generation]
    end

    subgraph "Server Side"
        V[File Validation]
        P[Pinata Upload]
        M[Metadata Storage]
    end

    subgraph "Storage"
        I[IPFS Network]
        D[(Database)]
        C[Content Addressing]
    end

    F --> B
    B --> S
    S --> V
    V --> P
    P --> I
    P --> M
    M --> D
    I --> C
```

### IPFS Integration

- **Decentralized Storage**: Files stored on IPFS
- **Content Addressing**: Immutable file references
- **Metadata Storage**: File information in database
- **Access Control**: Permission-based file access

### File Types

- **Document Support**: PDF, DOC, TXT, etc.
- **Image Support**: JPG, PNG, GIF, etc.
- **Size Limits**: Configurable file size restrictions
- **Type Validation**: MIME type verification

## Configuration

### Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection for caching
- `PINATA_API_KEY`: IPFS file storage API key
- `PINATA_SECRET_KEY`: IPFS file storage secret key
- `CRON_SECRET`: Cron job authentication secret
- `NEXT_PUBLIC_PINATA_GATEWAY`: IPFS gateway URL for file access
