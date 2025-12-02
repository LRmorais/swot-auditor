
export enum ProjectStatus {
  INTAKE = 'INTAKE',
  ANALYZING_CONTEXT = 'ANALYZING_CONTEXT', // Step 0
  CONTEXT_CONFIRMED = 'CONTEXT_CONFIRMED', // Waiting for Manual Selector
  ANALYZING_PRE = 'ANALYZING_PRE',
  AWAITING_PAYMENT = 'AWAITING_PAYMENT',
  PAID_APPROVED = 'PAID_APPROVED',
  ANALYZING_QUESTIONS = 'ANALYZING_QUESTIONS',
  AWAITING_ANSWERS = 'AWAITING_ANSWERS',
  ANALYZING_FINAL = 'ANALYZING_FINAL',
  COMPLETED = 'COMPLETED',
  AUDITING = 'AUDITING', // Step 3
  AUDITED = 'AUDITED'    // Step 3 Done
}

export enum ProjectMode {
  AUDITOR = 'AUDITOR',
  ENGINEER = 'ENGINEER'
}

export type AuditorType = 'CONSULTANCY' | 'GOVERNANCE'; // Mode 1 vs Mode 2
export type ProjectLens = 'A' | 'B' | 'C'; // The V25 Selector Lenses

export interface UploadedFile {
  name: string;
  mimeType: string;
  data?: string; // Base64 (Legacy/Memory)
  url?: string;  // Cloud Storage URL (Architecture V28)
  path?: string; // Storage Path
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; 
  type: 'PF' | 'PJ';
  document: string; 
  whatsapp: string;
  uf: string;
  city: string; 
  isAdmin?: boolean; // New Role for Prompt CMS
  isApproved?: boolean; // V28 Security: Requires Admin Validation
  createdAt?: number;
}

export interface Project {
  id: string;
  userId: string; 
  clientName: string;
  projectName: string;
  description: string; 
  createdAt: number;
  status: ProjectStatus;
  mode: ProjectMode; 
  auditorType?: AuditorType; 
  selectedLens?: ProjectLens; 
  
  tier?: 'NÍVEL 1' | 'NÍVEL 2' | 'NÍVEL 3';
  detectedLens?: string; 
  
  // Content Fields
  preReportContent?: string; 
  questionnaireContent?: string; 
  clientAnswers?: string;
  
  // Artifacts
  finalReportContent?: string; 
  investmentOnePagerContent?: string; 
  engineerComplianceContent?: string; 
  auditorMetadataContent?: string; 
  governanceParecerContent?: string; 
  rankingMetadata?: string; 
  
  auditReportContent?: string; 
  
  files?: UploadedFile[]; 
  version?: string; 
}

export interface AIConfig {
  apiKey: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  suggestions?: string[]; 
}
