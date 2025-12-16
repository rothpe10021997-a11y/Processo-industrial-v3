import React, { useMemo } from 'react';
import { useFactory } from '../services/factoryContext';
import { Activity, AlertTriangle, CheckCircle, Layers, Settings, ArrowRight, Flame, Wind, Truck, AlertOctagon, PieChart, Package } from 'lucide-react';

export const MainDashboard: React.FC = () => {
  const { stage1Calculations, stage2Calculations, operatorGroups, machines, products } = useFactory();

  const totalProdS1 = stage1Calculations.totalPiecesPerHour || 0;
  const totalProdS2 = stage2Calculations.totalPiecesPerHour || 0;
  
  // Checks
  // Stage 1 Alert if ANY line is over limit
  const s1Lines = stage1Calculations.lines ? Object.values(stage1Calculations.lines) : [];
  const s1Alert = s1Lines.some((l: any) => l?.forno?.isOver || l?.secagem?.isOver);
  
  // Aggregate Stage 1 Loads for display purposes
  const aggregatedS1FornoLoad = s1Lines.reduce((acc: number, l: any) => acc + (l?.forno?.load || 0), 0) as number;
  const aggregatedS1FornoLimit = s1Lines.reduce((acc: number, l: any) => acc + (l?.forno?.limit || 0), 0) as number;
  const aggregatedS1SecagemLoad = s1Lines.reduce((acc: number, l: any) => acc + (l?.secagem?.load || 0), 0) as number;
  const aggregatedS1SecagemLimit = s1Lines.reduce((acc: number, l: any) => acc + (l?.secagem?.limit || 0), 0) as number;

  const s2Alert = operatorGroups.some(g => stage2Calculations.groupLoads?.[g.id]?.cartOverload);
  const factoryAlert = s1Alert || s2Alert;

  // Helper for safe width calculation
  const getWidth = (load: number, limit: number) => {
    if (!limit || limit === 0) return 0;
    return Math.min(100, (load / limit) * 100);
  };

  // --- NEW: Calculate Production By Model (Stage 2 focus) ---
  const productionByModel = useMemo(() => {
    const totals: Record<string, { count: number; name: string }> = {};

    machines.forEach(m => {
        // Filter for Stage 2 machines that are active, have a product, and are set to Count Production
        if (m.lineId.startsWith('S2') && m.isActive && m.productId && m.countProduction !== false) {
            const p = products.find(prod => prod.id === m.productId);
            if (p) {
                if (!totals[p.id]) {
                    totals[p.id] = { count: 0, name: p.name };
                }
                // Apply Scale Factor
                const scale = m.productionScale || 1;
                totals[p.id].count += (p.stage2Target * scale);
            }
        }
    });

    // Convert to array and sort by quantity desc
    return Object.values(totals).sort((a, b) => b.count - a.count);
  }, [machines, products]);

  return (
    <div className="space-y-6">
       {/* Main Banner */}
       <div className={`p-6 rounded-xl border flex flex-col md:flex-row justify-between items-center ${factoryAlert ? 'bg-white border-rose-200 ring-1 ring-rose-100' : 'bg-slate-900 border-slate-800'}`}>
          <div className="flex items-center gap-4">
             <div className={`p-3 rounded-full ${factoryAlert ? 'bg-rose-100 text-rose-600' : 'bg-emerald-500/20 text-emerald-400'}`}>
                <Activity size={32} />
             </div>
             <div>
                <h2 className={`text-2xl font-bold ${factoryAlert ? 'text-slate-800' : 'text-white'}`}>
                   {factoryAlert ? 'Atenção Operacional Requerida' : 'Operação Estável'}
                </h2>
                <p className={`${factoryAlert ? 'text-slate-500' : 'text-slate-400'}`}>
                   {factoryAlert ? 'Gargalos de capacidade identificados no processo.' : 'Todos os postos de trabalho operando dentro dos limites.'}
                </p>
             </div>
          </div>
          {factoryAlert && (
             <div className="mt-4 md:mt-0 px-4 py-2 bg-rose-500 text-white font-bold rounded-lg animate-pulse flex items-center gap-2">
                <AlertTriangle size={20} />
                VERIFICAR GARGALOS
             </div>
          )}
       </div>

       {/* Production Flow Cards */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Stage 1 Summary */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Layers size={100} className="text-blue-500" />
             </div>
             <div className="relative z-10">
                <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                   <div className="w-2 h-6 bg-blue-500 rounded-sm"></div>
                   Etapa 1: Sucção
                </h3>
                <div className="mt-4 flex items-baseline gap-2">
                   <span className="text-4xl font-bold text-slate-800">{totalProdS1.toLocaleString()}</span>
                   <span className="text-sm font-medium text-slate-500">peças/hora</span>
                </div>
                
                <div className="mt-6 space-y-3">
                   {/* Forno Meter (Aggregated Visual) */}
                   <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2 text-slate-600"><Flame size={14}/> Carga Forno (Global)</span>
                      <span className="font-bold text-slate-600">
                         {aggregatedS1FornoLoad} / {aggregatedS1FornoLimit}
                      </span>
                   </div>
                   <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div 
                         className={`h-full rounded-full ${aggregatedS1FornoLoad > aggregatedS1FornoLimit ? 'bg-rose-500' : 'bg-orange-500'}`} 
                         style={{width: `${getWidth(aggregatedS1FornoLoad, aggregatedS1FornoLimit)}%`}}
                      ></div>
                   </div>

                   {/* Secagem Meter (Aggregated Visual) */}
                   <div className="flex justify-between items-center text-sm pt-2">
                      <span className="flex items-center gap-2 text-slate-600"><Wind size={14}/> Carga Secagem (Global)</span>
                      <span className="font-bold text-slate-600">
                         {aggregatedS1SecagemLoad} / {aggregatedS1SecagemLimit}
                      </span>
                   </div>
                   <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div 
                         className={`h-full rounded-full ${aggregatedS1SecagemLoad > aggregatedS1SecagemLimit ? 'bg-rose-500' : 'bg-sky-500'}`} 
                         style={{width: `${getWidth(aggregatedS1SecagemLoad, aggregatedS1SecagemLimit)}%`}}
                      ></div>
                   </div>
                   {s1Alert && <p className="text-xs text-rose-500 font-bold mt-2 text-center">⚠ Verifique as linhas individualmente</p>}
                </div>
             </div>
          </div>

          {/* Stage 2 Summary */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Settings size={100} className="text-emerald-500" />
             </div>
             <div className="relative z-10">
                <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                   <div className="w-2 h-6 bg-emerald-500 rounded-sm"></div>
                   Etapa 2: Conformação
                </h3>
                <div className="mt-4 flex items-baseline gap-2">
                   <span className="text-4xl font-bold text-slate-800">{totalProdS2.toLocaleString()}</span>
                   <span className="text-sm font-medium text-slate-500">peças/hora</span>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">
                   {operatorGroups.map(group => {
                      // Defensive access
                      const load = stage2Calculations.groupLoads[group.id] || { 
                          cartLoad: 0, cartCapacity: 0, cartOverload: false 
                      };
                      
                      return (
                         <div key={group.id} className={`p-3 rounded-lg border flex flex-col items-center text-center ${load.cartOverload ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'}`}>
                            <span className="text-[10px] font-bold uppercase text-slate-500">Grupo {group.id}</span>
                            {load.cartOverload ? (
                               <AlertOctagon size={24} className="text-rose-500 my-2" />
                            ) : (
                               <CheckCircle size={24} className="text-emerald-500 my-2" />
                            )}
                            <div className="text-xs text-slate-600 flex items-center gap-1">
                               <Truck size={10} /> {load.cartLoad}/{load.cartCapacity}
                            </div>
                         </div>
                      );
                   })}
                </div>
             </div>
          </div>
       </div>

       {/* NEW: Production By Model Section */}
       <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
             <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <PieChart size={18} className="text-indigo-500"/>
                Produção por Modelo (Etapa 2)
             </h3>
             <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                Mix de Produção Ativo
             </span>
          </div>
          
          <div className="p-6">
             {productionByModel.length === 0 ? (
                <div className="text-center py-8 text-slate-400 flex flex-col items-center gap-2">
                   <Package size={32} className="opacity-20" />
                   <p>Nenhuma produção ativa na Etapa 2.</p>
                </div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {productionByModel.map((item, index) => {
                      const percent = totalProdS2 > 0 ? (item.count / totalProdS2) * 100 : 0;
                      return (
                         <div key={index} className="flex flex-col p-4 rounded-lg border border-slate-100 bg-slate-50 relative overflow-hidden">
                            <div className="flex justify-between items-start mb-2 relative z-10">
                               <span className="font-bold text-slate-700">{item.name}</span>
                               <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                                  {percent.toFixed(1)}%
                               </span>
                            </div>
                            <div className="flex items-baseline gap-1 relative z-10">
                               <span className="text-2xl font-bold text-slate-800">{item.count.toLocaleString()}</span>
                               <span className="text-xs text-slate-500">pçs/h</span>
                            </div>
                            
                            {/* Visual Bar at bottom */}
                            <div className="absolute bottom-0 left-0 h-1 bg-indigo-200 w-full">
                               <div className="h-full bg-indigo-500" style={{ width: `${percent}%` }}></div>
                            </div>
                         </div>
                      );
                   })}
                </div>
             )}
          </div>
       </div>
       
       {/* Comparison / Balance */}
       <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-center gap-6 text-sm text-slate-500">
          <span>Sucção Total: <strong className="text-slate-800">{totalProdS1}</strong></span>
          <ArrowRight size={16} />
          <span>Conformação Total: <strong className="text-slate-800">{totalProdS2}</strong></span>
          <span className="px-3 py-1 bg-white rounded border border-slate-200 text-xs">
             Delta: <strong className={totalProdS1 > totalProdS2 ? "text-orange-500" : "text-emerald-500"}>{totalProdS1 - totalProdS2}</strong> pçs
          </span>
       </div>

    </div>
  );
};