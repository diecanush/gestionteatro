// REEMPLAZAR en types.ts el interface Workshop:

export interface Workshop {
  id: string;
  name: string;
  schedule: string;
  startDate: string;
  endDate: string;
  classDays?: string;
  teacher: string;
  fee: number;
  students: Student[];
}
