import React from 'react';
import { useFactory } from '../services/factoryContext';
import { MachineState, ProductionStage, Stage1Destination, Stage2SupplyType, ProductionScale } from '../types';
import { Power, Settings2, Flame, Wind, ArrowRight, Calculator, Gauge } from 'lucide-react';

interface Props {
  machine: MachineState;
  stage: ProductionStage;
}

export const MachineCard: React.FC<Props> = ({ machine, stage }) => {
  const { 
    toggleMachine, setMachineProduct, 
    setMachineStage1Destination, setMachineStage2SupplyType, 
    setMachineOnConveyor, setMachineCountProduction, setMachineProductionScale,
    products, lines 
  } = useFactory();

  // Find line info to check constraints (e.g. if oven is available)
  const line = lines.find(l => l.id === machine.lineId);
  const hasOven = !!line?.associatedOven;
  
  // Calculate display values
  const product = products.find(p => p.id === machine.productId);
  const scale = machine.productionScale || 1;
  const baseRate = stage === ProductionStage.CONFORMACAO ? (product?.stage2Target || 0) : (product?.stage1Rate || 0);
  const effectiveRate = baseRate * scale;

  return (
    <div className={`p-3 rounded-lg border flex flex-col h-full ${machine.isActive ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-100 border-slate-200 opacity-75'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-slate-500 uppercase">M{machine.machineIndex}</span>
        <button 
          onClick={() => toggleMachine(machine.id)}
          className={`p-1 rounded-full transition-colors ${machine.isActive ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' : 'bg-slate-200 text-slate-400 hover:bg-slate-300'}`}
          title={machine.isActive ? "Desligar Máquina" : "Ligar Máquina"}
        >
          <Power size={14} />
        </button>
      </div>

      <div className="space-y-3 flex-1">
        {/* Product Selector */}
        <div>
          <label className="block text-[10px] font-medium text-slate-500 mb-1">PRODUTO</label>
          <select 
            disabled={!machine.isActive}
            value={machine.productId || ''}
            onChange={(e) => setMachineProduct(machine.id, e.target.value || null)}
            className="w-full text-xs p-1.5 rounded border border-slate-300 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-transparent"
          >
            <option value="">-- Parada --</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        
        {/* Stage 1: Conveyor Toggle */}
        {stage === ProductionStage.SUCCAO && machine.isActive && machine.productId && (
           <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded border border-slate-200">
              <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                 <ArrowRight size={12}/> Vai p/ Esteira?
              </span>
              <button
                onClick={() => setMachineOnConveyor(machine.id, !machine.isOnConveyor)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors ${machine.isOnConveyor ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'}`}
              >
                {machine.isOnConveyor ? 'SIM' : 'NÃO'}
              </button>
           </div>
        )}

        {/* Stage 2 Options Container */}
        {stage === ProductionStage.CONFORMACAO && machine.isActive && machine.productId && (
          <div className="space-y-2">
            {/* Scale Selector */}
            <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1 mb-1">
                    <Gauge size={10}/> Ritmo / Escala
                </span>
                <div className="flex gap-1">
                   {[1, 0.75, 0.5].map((val) => (
                      <button
                        key={val}
                        onClick={() => setMachineProductionScale(machine.id, val as ProductionScale)}
                        className={`flex-1 py-1 text-[9px] font-bold rounded border transition-colors ${scale === val 
                           ? (val === 1 ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-amber-100 text-amber-700 border-amber-200') 
                           : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-100'}`}
                      >
                         {val * 100}%
                      </button>
                   ))}
                </div>
            </div>

            {/* Count Production Toggle */}
            <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded border border-slate-200">
                <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                    <Calculator size={12}/> Contar Produção?
                </span>
                <button
                    onClick={() => setMachineCountProduction(machine.id, machine.countProduction === undefined ? false : !machine.countProduction)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors ${machine.countProduction !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}
                    title="Se desmarcado, não soma na produção total nem no cálculo de embalagem"
                >
                    {machine.countProduction !== false ? 'SIM' : 'NÃO'}
                </button>
            </div>
           </div>
        )}
        
        {/* Destination/Supply Selector */}
        {machine.isActive && machine.productId && (
          <div>
            <label className="block text-[10px] font-medium text-slate-500 mb-1 flex items-center gap-1">
              <Settings2 size={10} />
              {stage === ProductionStage.SUCCAO ? 'DESTINO' : 'ABASTECIMENTO'}
            </label>
            
            {stage === ProductionStage.SUCCAO ? (
              <div className={`flex rounded border border-slate-200 overflow-hidden ${!machine.isOnConveyor ? 'opacity-50 pointer-events-none' : ''}`}>
                <button
                  onClick={() => setMachineStage1Destination(machine.id, Stage1Destination.FORNO)}
                  className={`flex-1 py-1 flex justify-center items-center ${machine.stage1Destination === Stage1Destination.FORNO ? 'bg-orange-100 text-orange-600' : 'bg-white text-slate-400 hover:bg-slate-50'}`}
                  title="Forno"
                >
                  <Flame size={14} />
                </button>
                <div className="w-[1px] bg-slate-200"></div>
                <button
                  onClick={() => setMachineStage1Destination(machine.id, Stage1Destination.SECAGEM_NATURAL)}
                  className={`flex-1 py-1 flex justify-center items-center ${machine.stage1Destination === Stage1Destination.SECAGEM_NATURAL ? 'bg-sky-100 text-sky-600' : 'bg-white text-slate-400 hover:bg-slate-50'}`}
                  title="Secagem Natural"
                >
                  <Wind size={14} />
                </button>
              </div>
            ) : (
              <select
                value={machine.stage2SupplyType}
                onChange={(e) => setMachineStage2SupplyType(machine.id, e.target.value as Stage2SupplyType)}
                className="w-full text-xs p-1.5 rounded border border-slate-300 bg-white focus:ring-1 focus:ring-blue-500 outline-none"
              >
                {hasOven && <option value={Stage2SupplyType.VIA_FORNO}>Via Forno ({line?.associatedOven})</option>}
                <option value={Stage2SupplyType.VIA_CARRINHO}>Via Carrinho</option>
                <option value={Stage2SupplyType.PALETIZADA}>Paletizada</option>
              </select>
            )}
          </div>
        )}

        {/* Info Metric */}
        {machine.isActive && machine.productId && (
          <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100 flex justify-between mt-auto">
            <span>Ritmo Efetivo:</span>
            <span className={`font-mono font-medium ${machine.countProduction === false && stage === ProductionStage.CONFORMACAO ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
               {effectiveRate.toFixed(0)} pçs/h
               {scale !== 1 && stage === ProductionStage.CONFORMACAO && (
                 <span className="text-[9px] text-amber-600 ml-1">({scale * 100}%)</span>
               )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};