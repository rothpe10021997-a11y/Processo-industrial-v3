export enum ProductionStage {
  SUCCAO = 'SUCCAO',
  CONFORMACAO = 'CONFORMACAO',
}

export enum Stage1Destination {
  FORNO = 'FORNO',
  SECAGEM_NATURAL = 'SECAGEM_NATURAL',
}

export enum Stage2SupplyType {
  VIA_FORNO = 'VIA_FORNO',
  VIA_CARRINHO = 'VIA_CARRINHO',
  PALETIZADA = 'PALETIZADA',
}

export type OvenSpeed = 'RAPIDO' | 'LENTO';

// New type for production scaling
export type ProductionScale = 1 | 0.75 | 0.5;

export interface Product {
  id: string;
  name: string;
  piecesPerTray: number; // Peças por tela
  stage1Rate: number; // Produção hora Sucção
  stage2Target: number; // Meta hora Conformação
  packagingFactor: number; // Fator de Carga Embalagem (Decimal por Máquina)
}

// Machine Definition
export interface MachineState {
  id: string;
  lineId: string;
  machineIndex: number;
  isActive: boolean;
  productId: string | null; // The product currently running
  // Per-machine configurations
  stage1Destination?: Stage1Destination;
  isOnConveyor?: boolean; // New: Does it go to the conveyor? (Stage 1 specific)
  stage2SupplyType?: Stage2SupplyType;
  countProduction?: boolean; // New: Should this machine count towards totals/packaging? (Stage 2 specific)
  productionScale?: ProductionScale; // New: 1 (100%), 0.75 (75%) or 0.5 (50%)
}

// Line Definition
export interface LineState {
  id: string;
  stage: ProductionStage;
  associatedOven?: 'A' | 'B' | null;
}

// Operator Logic
export interface OperatorGroup {
  id: string; // e.g., "AB", "CD", "EF"
  lineIds: string[];
  hasOvenOperator: boolean;
  hasCartOperator: boolean;
  ovenSpeed: OvenSpeed; // New field
}

export const STAGE_1_LIMITS = {
  [Stage1Destination.FORNO]: 400, // Telas/hora PER LINE
  [Stage1Destination.SECAGEM_NATURAL]: 300, // Telas/hora PER LINE
};

export const STAGE_2_LIMITS = {
  CART_OPERATOR_MAX: 300, // Telas/hora (Base capacity for 1 person)
  OVEN_OPERATOR_HELP: 300, // Telas/hora (Additional capacity provided by Oven Op when oven is SLOW)
  SUPPLY_OPERATOR_CAPACITY: 360, // Telas/hora per person (Circulador)
};