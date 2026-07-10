import type {
  ForumSurveyKindInput,
  ForumSurveyQuestionTypeInput,
} from "./surveySchemas";

export type ForumSurveyStatus = "open" | "closed";
export type ForumSurveyErrorCode =
  | "DISABLED"
  | "NOT_FOUND"
  | "UNAUTHENTICATED"
  | "NOT_MEMBER"
  | "VERIFICATION_FAILED"
  | "CLOSED"
  | "ALREADY_RESPONDED"
  | "INVALID_RESPONSE"
  | "FORBIDDEN"
  | "CONTENT_REJECTED"
  | "ERROR";

export interface ForumSurveyAnswerDto {
  questionId: number;
  optionIds: number[];
  text: string | null;
}

export interface ForumSurveyViewerResponseDto {
  id: number;
  createdAt: string;
  answers: ForumSurveyAnswerDto[];
}

export interface ForumSurveyViewerDto {
  authenticated: boolean;
  isMember: boolean;
  canRespond: boolean;
  hasResponded: boolean;
  response: ForumSurveyViewerResponseDto | null;
  address: string | null;
  code?: "UNAUTHENTICATED" | "NOT_MEMBER" | "VERIFICATION_FAILED";
  error?: string;
}

export interface ForumSurveyOptionDto {
  id: number;
  label: string;
  position: number;
  order: number;
  responseCount?: number;
}

export interface ForumSurveyQuestionDto {
  id: number;
  prompt: string;
  type: ForumSurveyQuestionTypeInput;
  required: boolean;
  maxSelections: number | null;
  position: number;
  options: ForumSurveyOptionDto[];
}

export interface ForumSurveyRespondentDto {
  id: number;
  address: string | null;
  displayName: string;
  isDeleted: boolean;
  createdAt: string;
  answers: ForumSurveyAnswerDto[];
}

export interface ForumSurveyDto {
  id: number;
  topicId: number;
  title: string;
  description: string | null;
  key: string | null;
  kind: ForumSurveyKindInput;
  closesAt: string | null;
  closedAt: string | null;
  status: ForumSurveyStatus;
  isOpen: boolean;
  responseCount: number;
  canViewResults: boolean;
  viewer: ForumSurveyViewerDto;
  viewerResponse: ForumSurveyViewerResponseDto | null;
  questions: ForumSurveyQuestionDto[];
  responses?: ForumSurveyRespondentDto[];
  responsePagination?: {
    offset: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface ForumSurveySummaryDto {
  id: number;
  kind: ForumSurveyKindInput;
  status: ForumSurveyStatus;
  isOpen: boolean;
  responseCount: number;
}

export type ForumSurveyActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code: ForumSurveyErrorCode };
