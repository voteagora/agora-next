import { useState, useCallback } from "react";

interface Report {
  id: number;
  title: string;
  author: string;
  content: string;
  createdAt: string;
  attachment?: {
    name: string;
    url: string;
  };
  comments: Comment[];
}

interface Comment {
  id: number;
  author: string;
  content: string;
  createdAt: string;
  parentId?: number;
}

interface Document {
  id: number;
  name: string;
  url: string;
  createdAt: string;
}

interface CreateReportData {
  title: string;
  content: string;
  categoryId?: number;
}

interface CreateCommentData {
  content: string;
  parentId?: number;
}

interface UploadDocumentData {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  contentType: string;
}

export const useDunaAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async (): Promise<Report[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/v1/duna/reports");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("API response:", data);
      
      // Transform forum topics to reports format
      const transformedReports = data.data.map((topic: any) => ({
        id: topic.id,
        title: topic.title,
        author: topic.address,
        content: topic.posts?.[0]?.content || "",
        createdAt: topic.createdAt,
        comments: topic.posts?.slice(1) || [], // Skip first post as it's the content
      }));
      
      console.log("Transformed reports:", transformedReports);
      return transformedReports;
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch reports");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReport = useCallback(async (reportId: number): Promise<Report | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/v1/duna/reports/${reportId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Transform forum topic to report format
      return {
        id: data.topic.id,
        title: data.topic.title,
        author: data.topic.address,
        content: data.posts?.[0]?.content || "",
        createdAt: data.topic.createdAt,
        comments: data.posts?.slice(1) || [], // Skip first post as it's the content
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch report");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createReport = useCallback(async (data: CreateReportData): Promise<Report | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/v1/duna/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Transform the created topic to report format
      return {
        id: result.topic.id,
        title: result.topic.title,
        author: result.topic.address,
        content: result.post.content,
        createdAt: result.topic.createdAt,
        comments: [],
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create report");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createComment = useCallback(async (reportId: number, data: CreateCommentData): Promise<Comment | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/v1/duna/reports/${reportId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      return {
        id: result.post.id,
        author: result.post.address,
        content: result.post.content,
        createdAt: result.post.createdAt,
        parentId: result.post.parentPostId,
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create comment");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDocuments = useCallback(async (): Promise<Document[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/v1/duna/documents");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch documents");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadDocument = useCallback(async (data: UploadDocumentData): Promise<Document | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/v1/duna/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      return {
        id: result.document.id,
        name: result.document.name,
        url: result.document.url,
        createdAt: result.document.createdAt,
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload document");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    isAuthenticated: true, // Always return true since we're not using authentication
    fetchReports,
    fetchReport,
    createReport,
    createComment,
    fetchDocuments,
    uploadDocument,
  };
}; 