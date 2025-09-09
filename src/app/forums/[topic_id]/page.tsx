import React from "react";
import TopicHeader from "./components/TopicHeader";
import TopicContent from "./components/TopicContent";
import ReplyList from "./components/ReplyList";
import ReplyForm from "./components/ReplyForm";

interface PageProps {
  params: {
    topic_id: string;
  };
}

export default async function ForumTopicPage({ params }: PageProps) {
  const topicId = params.topic_id;

  // Mock data for static page
  const mockTopic = {
    id: parseInt(topicId),
    title: "Proposal: Implement New Governance Framework",
    author: "0x1234...5678",
    authorName: "alice.eth",
    createdAt: "2024-01-15T10:30:00Z",
    category: "Governance",
    tags: ["governance", "framework", "proposal"],
    views: 342,
    replies: 24,
    isLocked: false,
    isPinned: false,
  };

  const mockContent = {
    content: `<h1>Overview</h1>

<p>This proposal outlines a comprehensive governance framework to improve decision-making processes within our DAO.</p>

<h2>Key Points</h2>

<ol>
<li><strong>Transparent Voting</strong>: All votes will be recorded on-chain</li>
<li><strong>Delegation System</strong>: Token holders can delegate their voting power</li>
<li><strong>Proposal Thresholds</strong>: Minimum token requirements for proposal creation</li>
<li><strong>Execution Delays</strong>: Time delays for proposal execution</li>
</ol>

<h2>Implementation Timeline</h2>

<ul>
<li><strong>Phase 1</strong>: Framework design and community feedback (2 weeks)</li>
<li><strong>Phase 2</strong>: Smart contract development (4 weeks)</li>
<li><strong>Phase 3</strong>: Testing and audit (3 weeks)</li>
<li><strong>Phase 4</strong>: Deployment and rollout (1 week)</li>
</ul>

<h2>Next Steps</h2>

<p>Please review the proposal and provide feedback in the comments below.</p>`,
    attachments: [
      {
        id: 1,
        fileName: "governance-framework.pdf",
        fileSize: "2.4 MB",
        url: "#",
      },
    ],
  };

  const mockReplies = [
    {
      id: 1,
      author: "0x9876...1234",
      authorName: "bob.eth",
      content:
        "This looks great! I especially like the delegation system. Have you considered adding a minimum participation threshold?",
      createdAt: "2024-01-15T14:20:00Z",
      likes: 8,
      parentId: null,
    },
    {
      id: 2,
      author: "0x5555...9999",
      authorName: "charlie.eth",
      content:
        "Agreed with the proposal direction. The execution delays seem reasonable for security.",
      createdAt: "2024-01-15T16:45:00Z",
      likes: 5,
      parentId: null,
    },
    {
      id: 3,
      author: "0x1234...5678",
      authorName: "alice.eth",
      content:
        "@bob.eth Great point about participation thresholds. I'll add that to the framework specifications.",
      createdAt: "2024-01-15T17:10:00Z",
      likes: 3,
      parentId: 1,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1 max-w-4xl">
            {/* Topic Header */}
            <TopicHeader topic={mockTopic} content={mockContent} />
            
            {/* Topic Content */}
            <div className="mt-6">
              <TopicContent content={mockContent} />
            </div>

            {/* Replies Section */}
            <div className="mt-8">
              <ReplyList replies={mockReplies} />
            </div>

            {/* Reply Form */}
            <div className="mt-8 border-t pt-6">
              <ReplyForm topicId={topicId} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Categories</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="text-sm">Temperature checks</span>
                  </div>
                  <span className="text-xs text-gray-500">80 posts</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm">Request for comment</span>
                  </div>
                  <span className="text-xs text-gray-500">32 posts</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm">Governance meta</span>
                  </div>
                  <span className="text-xs text-gray-500">80 posts</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last comment</span>
                    <span>32 mins ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Activity last month</span>
                    <span>32 comments</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Top poster</span>
                    <span>Erin Koen</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
