
export enum GradeValue {
  G0 = 0,
  G1 = 1,
  G2 = 2,
  G3 = 3,
  G4 = 4
}

export type ReportStatus = 'draft' | 'validated' | 'sent';

export interface GradeInfo {
  value: GradeValue;
  label: string;
  points: number;
  fullDescription: string;
}

export interface RegionData {
  id: string;
  label: string;
  comment: string;
  grade: GradeValue;
  isIncluded: boolean;
  isLocked: boolean;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: number;
}

export interface Report {
  id: string;
  horseName: string;
  clinic: string;
  date: string;
  veterinary: string;
  regions: RegionData[];
  totalScore: number;
  createdAt: number;
  status: ReportStatus;
  clientId?: string; // Lien vers la base client
}

export const GRADES_CONFIG: Record<GradeValue, GradeInfo> = {
  [GradeValue.G0]: { 
    value: GradeValue.G0, 
    label: "Grade 0", 
    points: 0, 
    fullDescription: "Pas d'anomalie radiographique significative" 
  },
  [GradeValue.G1]: { 
    value: GradeValue.G1, 
    label: "Grade 1", 
    points: 1, 
    fullDescription: "Image radiographique suspecte (entre normale et anormale) sans importance clinique" 
  },
  [GradeValue.G2]: { 
    value: GradeValue.G2, 
    label: "Grade 2", 
    points: 2, 
    fullDescription: "Image radiographique anormale d'expression clinique peu probable" 
  },
  [GradeValue.G3]: { 
    value: GradeValue.G3, 
    label: "Grade 3", 
    points: 4, 
    fullDescription: "Image radiographique anormale d'expression clinique probable" 
  },
  [GradeValue.G4]: { 
    value: GradeValue.G4, 
    label: "Grade 4", 
    points: 8, 
    fullDescription: "Image radiographique anormale d'expression clinique certaine" 
  },
};
