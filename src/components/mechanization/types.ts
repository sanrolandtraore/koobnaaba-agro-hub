export interface MechanizationService {
  id: string;
  name: string;
  category: "labour" | "semis" | "pulverisation" | "recolte" | "battage" | "transport";
  baseRatePerHa: number;
  rateUnit: "par_ha" | "par_tonne" | "par_rotation" | "par_heure";
  fuelPerHaLiters: number;
  hoursPerHa: number;
  description: string;
  iconName: string;
}

export interface MechanizationMachine {
  id: string;
  title: string;
  category: "tracteur" | "drone" | "moissonneuse" | "semoir" | "transport" | "motoculteur";
  powerHp?: number;
  brandModel: string;
  year: number;
  operatorIncluded: boolean;
  location: string;
  region: string;
  dailyCapacityHa: number;
  pricePerHa: number;
  hourlyRate?: number;
  status: "disponible" | "en_mission" | "maintenance";
  verifiedPartner: string;
  rating: number;
  completedJobs: number;
  fuelType: "diesel" | "electrique_batterie";
  implementsIncluded: string[];
  imageUrl?: string;
  engineHours?: number;
  transmission?: string;
}

export interface MechanizationJob {
  id: string;
  serviceType: string;
  parcelName: string;
  areaHa: number;
  totalCost: number;
  depositAmount: number;
  paymentMethod: "orange_money" | "moov_money" | "wave" | "cash_agent";
  escrowStatus: "acompte_bloque" | "solde_debloque" | "en_attente";
  jobStatus: "demande_recue" | "operateur_en_route" | "travail_en_cours" | "controle_qualite" | "termine";
  operatorName: string;
  operatorPhone: string;
  fieldAgentName: string;
  fieldAgentPhone: string;
  scheduledDate: string;
  machineName: string;
  engineHoursStart?: number;
  engineHoursEnd?: number;
  notes?: string;
}

export interface FieldAgent {
  id: string;
  name: string;
  zone: string;
  phone: string;
  whatsapp: string;
  languages: string[];
  activeVillages: number;
  assignedOperators: number;
}
