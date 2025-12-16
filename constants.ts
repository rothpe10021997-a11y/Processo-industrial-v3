import { LineState, MachineState, OperatorGroup, ProductionStage, Stage1Destination, Stage2SupplyType } from './types';

// Initial Products
// packagingFactor: 0.2 means the machine takes 20% of a person's time to pack.
export const INITIAL_PRODUCTS = [
  { id: 'p1', name: 'Model X-100', piecesPerTray: 12, stage1Rate: 1200, stage2Target: 500, packagingFactor: 0.2 },
  { id: 'p2', name: 'Model Y-Pro', piecesPerTray: 8, stage1Rate: 900, stage2Target: 400, packagingFactor: 0.3 },
  { id: 'p3', name: 'Model Eco-Z', piecesPerTray: 20, stage1Rate: 2000, stage2Target: 800, packagingFactor: 0.15 },
];

// Stage 1 Topology
export const STAGE_1_LINES: LineState[] = [
  { id: 'S1-A', stage: ProductionStage.SUCCAO },
  { id: 'S1-B', stage: ProductionStage.SUCCAO },
];

// Stage 2 Topology
export const STAGE_2_LINES: LineState[] = [
  { id: 'S2-A', stage: ProductionStage.CONFORMACAO, associatedOven: 'A' },
  { id: 'S2-B', stage: ProductionStage.CONFORMACAO, associatedOven: 'A' },
  { id: 'S2-C', stage: ProductionStage.CONFORMACAO, associatedOven: 'B' },
  { id: 'S2-D', stage: ProductionStage.CONFORMACAO, associatedOven: 'B' },
  { id: 'S2-E', stage: ProductionStage.CONFORMACAO, associatedOven: null }, // No oven
  { id: 'S2-F', stage: ProductionStage.CONFORMACAO, associatedOven: null }, // No oven
];

// Operator Groups for Stage 2 (Pairs)
export const STAGE_2_GROUPS: OperatorGroup[] = [
  { id: 'AB', lineIds: ['S2-A', 'S2-B'], hasOvenOperator: true, hasCartOperator: true, ovenSpeed: 'RAPIDO' },
  { id: 'CD', lineIds: ['S2-C', 'S2-D'], hasOvenOperator: true, hasCartOperator: true, ovenSpeed: 'RAPIDO' },
  { id: 'EF', lineIds: ['S2-E', 'S2-F'], hasOvenOperator: false, hasCartOperator: true, ovenSpeed: 'RAPIDO' }, // No Oven actually
];

// Helper to generate initial machines
export const generateMachines = (): MachineState[] => {
  const machines: MachineState[] = [];
  
  // Stage 1: 2 Lines * 4 Machines
  STAGE_1_LINES.forEach(line => {
    for (let i = 1; i <= 4; i++) {
      machines.push({
        id: `${line.id}-M${i}`,
        lineId: line.id,
        machineIndex: i,
        isActive: true,
        productId: null,
        stage1Destination: Stage1Destination.FORNO, // Default
        // M4 usually doesn't go on conveyor by default
        isOnConveyor: i !== 4 
      });
    }
  });

  // Stage 2: 6 Lines * 4 Machines
  STAGE_2_LINES.forEach(line => {
    // Determine default supply type based on line capability
    const defaultSupply = Stage2SupplyType.VIA_CARRINHO;

    for (let i = 1; i <= 4; i++) {
      machines.push({
        id: `${line.id}-M${i}`,
        lineId: line.id,
        machineIndex: i,
        isActive: true,
        productId: null,
        stage2SupplyType: defaultSupply,
        countProduction: true, // Default to counting production
        productionScale: 1, // Default 100%
      });
    }
  });

  return machines;
};