// src/types/project.ts

export interface DesignImage {
  dataUrl: string;
  base64: string;
  mimeType: string;
  style: string; // e.g., "Original", "Modern Farmhouse", "Cleaned Slate"
}

export interface Space {
  id: string;      // A unique ID for this space
  name: string;    // "Kitchen", "Master Bathroom", etc.
  images: DesignImage[]; // Each space has its OWN gallery
}

export interface DamageAnalysisReport {
  architectural_features: {
    room_dimensions?: string;
    walls?: string[];
    windows?: string[];
    doors?: string[];
    ceiling?: string;
    floor?: string;
  };
  damage_assessment: {
    standing_water?: {
      present: boolean;
      locations?: string[];
    };
    water_stains?: string[];
    mold?: {
      present: boolean;
      locations?: string[];
    };
  };
  items_to_remove?: string[];
  preservation_notes?: string;
}

export interface StyleSuggestion {
  name: string;
  prompt: string;
}

/**
 * @interface ProjectData
 * @description A structured container for all project-specific data collected during a session.
 * This is used for generating comprehensive reports.
 */
export interface ProjectData {
  spaces?: Space[];
  diagnosis?: string | null;
  damageAnalysisReport?: DamageAnalysisReport | null;
}
