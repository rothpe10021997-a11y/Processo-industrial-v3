import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Product, MachineState, LineState, OperatorGroup, 
  ProductionStage, Stage1Destination, STAGE_1_LIMITS, 
  Stage2SupplyType, STAGE_2_LIMITS, OvenSpeed, ProductionScale
} from '../types';
import { INITIAL_PRODUCTS, STAGE_1_LINES, STAGE_2_LINES, STAGE_2_GROUPS, generateMachines } from '../constants';

export interface FactoryContextType {
  products: Product[];
  machines: MachineState[];
  lines: LineState[];
  operatorGroups: OperatorGroup[];
  
  // Actions
  addProduct: (p: Product) => void;
  removeProduct: (id: string) => void;
  importProducts: (products: Product[]) => void;
  loadScenario: (data: ScenarioData) => void; 
  toggleMachine: (id: string) => void;
  setMachineProduct: (machineId: string, productId: string | null) => void;
  setMachineStage1Destination: (machineId: string, dest: Stage1Destination) => void;
  setMachineStage2SupplyType: (machineId: string, type: Stage2SupplyType) => void;
  setMachineOnConveyor: (machineId: string, isOnConveyor: boolean) => void;
  setMachineCountProduction: (machineId: string, count: boolean) => void;
  setMachineProductionScale: (machineId: string, scale: ProductionScale) => void; // New action
  toggleOperator: (groupId: string, type: 'oven' | 'cart') => void;
  setOvenSpeed: (groupId: string, speed: OvenSpeed) => void;
  resetFactory: () => void;

  // Computed Results
  stage1Calculations: Stage1Result;
  stage2Calculations: Stage2Result;
}

// Interface for the full save file
export interface ScenarioData {
  products: Product[];
  machines: MachineState[];
  operatorGroups: OperatorGroup[];
  timestamp?: string;
}

// Updated Result Structure for Stage 1 (Per Line)
export interface Stage1Result {
  totalPiecesPerHour: number;
  lines: Record<string, {
    forno: { load: number; limit: number; isOver: boolean };
    secagem: { load: number; limit: number; isOver: boolean };
    lineTotalPieces: number;
    lineTotalTrays: number;
  }>;
}

export interface Stage2Result {
  totalPiecesPerHour: number; // Global total for Stage 2
  totalPackagingPeople: number; // Total people required for packaging
  totalSupplyPeople: number; // New: Total people required for supply (Circuladores)
  totalStage2Trays: number; // New: Total trays generated in stage 2
  totalSupplyTrays: number; // New: Trays specifically for Circuladores (Via Carrinho only)
  groupLoads: Record<string, {
    cartLoad: number;
    ovenLoad: number;
    cartCapacity: number;
    cartOverload: boolean;
    totalPieces: number;
    isBoosted: boolean; 
  }>;
}

const FactoryContext = createContext<FactoryContextType | undefined>(undefined);

// Keys for LocalStorage
const STORAGE_KEYS = {
  PRODUCTS: 'factory_products_v1',
  MACHINES: 'factory_machines_v1',
  OPERATORS: 'factory_operators_v1'
};

export const FactoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize State from LocalStorage if available, otherwise use defaults
  
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch (e) {
      console.error("Failed to load products", e);
      return INITIAL_PRODUCTS;
    }
  });

  const [machines, setMachines] = useState<MachineState[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MACHINES);
      return saved ? JSON.parse(saved) : generateMachines();
    } catch (e) {
      console.error("Failed to load machines", e);
      return generateMachines();
    }
  });

  // Lines are static topology
  const [lines, setLines] = useState<LineState[]>([...STAGE_1_LINES, ...STAGE_2_LINES]);

  const [operatorGroups, setOperatorGroups] = useState<OperatorGroup[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.OPERATORS);
      return saved ? JSON.parse(saved) : STAGE_2_GROUPS;
    } catch (e) {
      console.error("Failed to load operators", e);
      return STAGE_2_GROUPS;
    }
  });

  // --- PERSISTENCE EFFECTS ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MACHINES, JSON.stringify(machines));
  }, [machines]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.OPERATORS, JSON.stringify(operatorGroups));
  }, [operatorGroups]);


  // --- ACTIONS ---

  const addProduct = (p: Product) => setProducts([...products, p]);
  const removeProduct = (id: string) => setProducts(products.filter(p => p.id !== id));
  
  const importProducts = (newProducts: Product[]) => {
    if (Array.isArray(newProducts) && newProducts.every(p => p.id && p.name)) {
       setProducts(newProducts);
       setMachines(prev => prev.map(m => ({...m, productId: null})));
    } else {
       console.error("Invalid product data format");
    }
  };

  const loadScenario = (data: ScenarioData) => {
    if (data.products && Array.isArray(data.products)) {
      setProducts(data.products);
    }
    if (data.machines && Array.isArray(data.machines)) {
      setMachines(data.machines);
    }
    if (data.operatorGroups && Array.isArray(data.operatorGroups)) {
      setOperatorGroups(data.operatorGroups);
    }
  };
  
  const toggleMachine = (id: string) => {
    setMachines(prev => prev.map(m => m.id === id ? { ...m, isActive: !m.isActive } : m));
  };

  const setMachineProduct = (machineId: string, productId: string | null) => {
    setMachines(prev => prev.map(m => m.id === machineId ? { ...m, productId } : m));
  };

  const setMachineStage1Destination = (machineId: string, dest: Stage1Destination) => {
    setMachines(prev => prev.map(m => m.id === machineId ? { ...m, stage1Destination: dest } : m));
  };

  const setMachineOnConveyor = (machineId: string, isOnConveyor: boolean) => {
    setMachines(prev => prev.map(m => m.id === machineId ? { ...m, isOnConveyor } : m));
  };

  const setMachineStage2SupplyType = (machineId: string, type: Stage2SupplyType) => {
    setMachines(prev => prev.map(m => m.id === machineId ? { ...m, stage2SupplyType: type } : m));
  };

  const setMachineCountProduction = (machineId: string, count: boolean) => {
    setMachines(prev => prev.map(m => m.id === machineId ? { ...m, countProduction: count } : m));
  };

  const setMachineProductionScale = (machineId: string, scale: ProductionScale) => {
    setMachines(prev => prev.map(m => m.id === machineId ? { ...m, productionScale: scale } : m));
  };

  const toggleOperator = (groupId: string, type: 'oven' | 'cart') => {
    setOperatorGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g;
      return type === 'oven' 
        ? { ...g, hasOvenOperator: !g.hasOvenOperator }
        : { ...g, hasCartOperator: !g.hasCartOperator };
    }));
  };

  const setOvenSpeed = (groupId: string, speed: OvenSpeed) => {
    setOperatorGroups(prev => prev.map(g => g.id === groupId ? { ...g, ovenSpeed: speed } : g));
  };

  const resetFactory = () => {
    if (window.confirm("Isso apagará todas as configurações e produtos salvos e restaurará o padrão. Continuar?")) {
      localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
      localStorage.removeItem(STORAGE_KEYS.MACHINES);
      localStorage.removeItem(STORAGE_KEYS.OPERATORS);
      window.location.reload();
    }
  };

  // --- CALCULATIONS ---

  // Stage 1 Logic (Updated per Line)
  const calculateStage1 = (): Stage1Result => {
    const s1LineIds = STAGE_1_LINES.map(l => l.id);
    let totalFactoryPieces = 0;
    
    const lineResults: Stage1Result['lines'] = {};

    s1LineIds.forEach(lineId => {
       let linePieces = 0;
       let lineTrays = 0;
       let fornoLoad = 0;
       let secagemLoad = 0;

       const lineMachines = machines.filter(m => m.lineId === lineId && m.isActive && m.productId);
       
       lineMachines.forEach(m => {
          const prod = products.find(p => p.id === m.productId);
          if (prod) {
             const machineTrays = prod.stage1Rate / prod.piecesPerTray;
             
             // Production always counts towards total
             linePieces += prod.stage1Rate;
             lineTrays += machineTrays;

             // Operator Load ONLY if on Conveyor
             if (m.isOnConveyor) {
                if (m.stage1Destination === Stage1Destination.SECAGEM_NATURAL) {
                  secagemLoad += machineTrays;
                } else {
                  fornoLoad += machineTrays;
                }
             }
          }
       });

       totalFactoryPieces += linePieces;
       const fornoLimit = STAGE_1_LIMITS[Stage1Destination.FORNO];
       const secagemLimit = STAGE_1_LIMITS[Stage1Destination.SECAGEM_NATURAL];

       lineResults[lineId] = {
         forno: {
           load: Math.round(fornoLoad),
           limit: fornoLimit,
           isOver: fornoLoad > fornoLimit
         },
         secagem: {
           load: Math.round(secagemLoad),
           limit: secagemLimit,
           isOver: secagemLoad > secagemLimit
         },
         lineTotalPieces: linePieces,
         lineTotalTrays: Math.round(lineTrays)
       };
    });

    return {
      totalPiecesPerHour: totalFactoryPieces,
      lines: lineResults
    };
  };

  // Stage 2 Logic
  const calculateStage2 = (): Stage2Result => {
    const results: Stage2Result['groupLoads'] = {};
    let grandTotalPieces = 0;
    let totalPackagingPeople = 0;
    let totalStage2Trays = 0;
    let totalSupplyTrays = 0; // Trays that require Circuladores (Via Carrinho)

    operatorGroups.forEach(group => {
      let cartLoad = 0;
      let ovenLoad = 0;
      let totalPieces = 0;

      // Iterate lines in this operator group (e.g., A & B)
      group.lineIds.forEach(lineId => {
        // Identify line config (static)
        const line = lines.find(l => l.id === lineId);
        
        // Identify machines
        const lineMachines = machines.filter(m => m.lineId === lineId && m.isActive && m.productId);
        
        lineMachines.forEach(m => {
          const prod = products.find(p => p.id === m.productId);
          if (prod) {
             // Calculate Effective Production based on Scale
             const scale = m.productionScale || 1;
             const effectiveTarget = prod.stage2Target * scale;
             
             // Calculate Effective Trays based on adjusted production (1.10 = 10% break/waste factor)
             const requiredTrays = (effectiveTarget * 1.10) / prod.piecesPerTray;
             
             // Sum to Global Supply Trays (Total volume)
             totalStage2Trays += requiredTrays;

             // Count Production: Default to true if undefined
             const shouldCount = m.countProduction !== false;

             if (shouldCount) {
                 totalPieces += effectiveTarget;
                 // Packaging Calculation scales with production too
                 if (prod.packagingFactor) {
                    totalPackagingPeople += (prod.packagingFactor * scale);
                 }
             }

             // Distribute OPERATIONAL load (movement) based on actual scaled run
             if (m.stage2SupplyType === Stage2SupplyType.VIA_CARRINHO) {
                cartLoad += requiredTrays;
                totalSupplyTrays += requiredTrays; // Only add to Supply Calculation if Via Carrinho
             } else if (m.stage2SupplyType === Stage2SupplyType.VIA_FORNO) {
                if (line?.associatedOven) {
                  ovenLoad += requiredTrays;
                } else {
                   ovenLoad += requiredTrays; 
                }
             }
             // Palletized adds 0 load to operators and 0 to circuladores requirement.
          }
        });
      });

      grandTotalPieces += totalPieces;

      // Check Capacities
      // Base Capacity from Cart Operator
      let cartCapacity = group.hasCartOperator ? STAGE_2_LIMITS.CART_OPERATOR_MAX : 0;
      
      // Bonus Capacity if Oven is Slow and Oven Operator is present (They help the cart flow)
      let isBoosted = false;
      if (group.hasOvenOperator && group.ovenSpeed === 'LENTO') {
        cartCapacity += STAGE_2_LIMITS.OVEN_OPERATOR_HELP;
        isBoosted = true;
      }

      const cartOverload = cartLoad > cartCapacity;

      results[group.id] = {
        cartLoad: Math.round(cartLoad),
        ovenLoad: Math.round(ovenLoad),
        cartCapacity,
        cartOverload,
        totalPieces,
        isBoosted
      };
    });

    // Calculate Supply People (Circuladores) - Only for VIA_CARRINHO trays
    const totalSupplyPeople = totalSupplyTrays / STAGE_2_LIMITS.SUPPLY_OPERATOR_CAPACITY;

    return { 
      groupLoads: results,
      totalPiecesPerHour: grandTotalPieces,
      totalPackagingPeople,
      totalSupplyPeople,
      totalStage2Trays: Math.round(totalStage2Trays),
      totalSupplyTrays: Math.round(totalSupplyTrays)
    };
  };

  return (
    <FactoryContext.Provider value={{
      products,
      machines,
      lines,
      operatorGroups,
      addProduct,
      removeProduct,
      importProducts,
      loadScenario,
      toggleMachine,
      setMachineProduct,
      setMachineStage1Destination,
      setMachineStage2SupplyType,
      setMachineOnConveyor,
      setMachineCountProduction,
      setMachineProductionScale,
      toggleOperator,
      setOvenSpeed,
      resetFactory,
      stage1Calculations: calculateStage1(),
      stage2Calculations: calculateStage2(),
    }}>
      {children}
    </FactoryContext.Provider>
  );
};

export const useFactory = () => {
  const context = useContext(FactoryContext);
  if (!context) throw new Error("useFactory must be used within FactoryProvider");
  return context;
};