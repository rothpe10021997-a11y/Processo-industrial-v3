import React from 'react';
import { useFactory } from '../services/factoryContext';
import { MachineCard } from './MachineCard';
import { ProductionStage, OvenSpeed } from '../types';
import { Users, AlertOctagon, Flame, Gauge, CheckCircle, Package, ArrowUpCircle, Truck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';

export const Stage2Simulation: React.FC = () => {
  const { lines, machines, operatorGroups, toggleOperator, setOvenSpeed, stage2Calculations } = useFactory();

  const getLineMachines = (lineId: string) => machines.filter(m => m.lineId === lineId);

  // Formatting packaging people
  const pkgPeopleExact = stage2Calculations.totalPackagingPeople;
  const pkgPeopleRounded = Math.ceil(pkgPeopleExact);

  // Formatting supply people
  const supplyPeopleExact = stage2Calculations.totalSupplyPeople;
  const supplyPeopleRounded = Math.ceil(supplyPeopleExact);

  return (
    <div className="space-y-8">
       {/* Header with Total Metrics */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
             <h2 className="text-xl font-bold text-slate-800">Etapa 2: Conformação & Embalagem</h2>
             <p className="text-sm text-slate-500">Gestão de abastecimento, balanceamento de linhas e quadro de embalagem</p>
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Produção Total</span>
             <div className="flex items-baseline gap-1">
                 <span className="text-2xl font-bold text-slate-700">{stage2Calculations.totalPiecesPerHour.toLocaleString()}</span>
                 <span className="text-xs text-slate-500">pçs/h</span>
              </div>
          </div>
       </div>

       {/* Dashboards: Packaging & Supply */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Packaging Sector Dashboard */}
          <div className="bg-indigo-900 rounded-xl p-6 text-white shadow-lg flex flex-col justify-between h-full">
             <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-indigo-800 rounded-lg">
                   <Package size={24} className="text-indigo-200"/>
                </div>
                <div>
                   <h3 className="text-lg font-bold">Embalagem</h3>
                   <p className="text-indigo-300 text-xs">Dimensionamento por mix de produto</p>
                </div>
             </div>
             
             <div className="flex items-center justify-between">
                <div className="text-left">
                   <span className="block text-[10px] font-bold text-indigo-300 uppercase">Carga Calculada</span>
                   <span className="text-xl font-mono font-bold">{pkgPeopleExact.toFixed(2)}</span>
                </div>
                <div className="h-8 w-[1px] bg-indigo-700"></div>
                <div className="text-right">
                   <span className="block text-[10px] font-bold text-indigo-300 uppercase">Necessário</span>
                   <div className="flex items-baseline justify-end gap-1">
                      <span className="text-3xl font-bold text-white">{pkgPeopleRounded}</span>
                      <span className="text-xs text-indigo-300">pessoas</span>
                   </div>
                </div>
             </div>
          </div>

          {/* Supply Sector Dashboard (Circuladores) */}
          <div className="bg-cyan-900 rounded-xl p-6 text-white shadow-lg flex flex-col justify-between h-full">
             <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-cyan-800 rounded-lg">
                   <Truck size={24} className="text-cyan-200"/>
                </div>
                <div>
                   <h3 className="text-lg font-bold">Abastecimento</h3>
                   <p className="text-cyan-300 text-xs">Circuladores (Somente Telas via Carrinho)</p>
                </div>
             </div>
             
             <div className="flex items-center justify-between">
                <div className="text-left">
                   <span className="block text-[10px] font-bold text-cyan-300 uppercase">Telas (Carrinho)</span>
                   <span className="text-xl font-mono font-bold">{stage2Calculations.totalSupplyTrays.toLocaleString()}</span>
                </div>
                <div className="h-8 w-[1px] bg-cyan-700"></div>
                <div className="text-right">
                   <span className="block text-[10px] font-bold text-cyan-300 uppercase">Necessário</span>
                   <div className="flex items-baseline justify-end gap-1">
                      <span className="text-3xl font-bold text-white">{supplyPeopleRounded}</span>
                      <span className="text-xs text-cyan-300">circuladores</span>
                   </div>
                </div>
             </div>
          </div>
       </div>

      {/* Operator Groups / Cells */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {operatorGroups.map(group => {
           const calc = stage2Calculations.groupLoads[group.id];
           const hasOven = group.lineIds.some(id => lines.find(l => l.id === id)?.associatedOven);

           // Alerts only for Cart now
           const hasAlert = calc.cartOverload;

           // Chart Data for this group
           const data = [
             { name: 'Carrinho', load: calc.cartLoad, limit: calc.cartCapacity },
             // Oven has no limit, we pass 0 or high number to avoid visual overload logic, handled in Cell color
             { name: 'Forno', load: calc.ovenLoad, limit: 0 } 
           ];

           return (
            <div key={group.id} className={`bg-white rounded-xl border-t-4 shadow-sm flex flex-col ${hasAlert ? 'border-rose-500 ring-1 ring-rose-200' : 'border-slate-300'}`}>
              
              {/* Group Header */}
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-lg text-slate-700">Grupo {group.id}</h3>
                {hasAlert && <span className="flex items-center gap-1 text-xs font-bold text-white bg-rose-500 px-2 py-1 rounded"><AlertOctagon size={12}/> GARGALO</span>}
              </div>

              {/* Oven Control (If applicable) */}
              {hasOven && (
                <div className="px-4 py-3 bg-orange-50/50 border-b border-orange-100 flex justify-between items-center">
                   <div className="flex items-center gap-2 text-xs font-bold text-orange-800 uppercase">
                      <Gauge size={14} /> Ritmo do Forno
                   </div>
                   <div className="flex rounded bg-white border border-orange-200 overflow-hidden shadow-sm">
                      <button 
                        onClick={() => setOvenSpeed(group.id, 'RAPIDO')}
                        className={`px-3 py-1 text-xs font-bold transition-colors ${group.ovenSpeed === 'RAPIDO' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-orange-500'}`}
                      >
                        RÁPIDO
                      </button>
                      <button 
                         onClick={() => setOvenSpeed(group.id, 'LENTO')}
                         className={`px-3 py-1 text-xs font-bold transition-colors ${group.ovenSpeed === 'LENTO' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-orange-500'}`}
                      >
                        LENTO
                      </button>
                   </div>
                </div>
              )}

              {/* Visualization */}
              <div className="p-4 h-48 w-full border-b border-slate-100 relative">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={data} layout="vertical" margin={{left: 0, right: 30}}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={60} tick={{fontSize: 10}} />
                      <Tooltip 
                        contentStyle={{fontSize: '12px'}} 
                        formatter={(value: number, name: string) => [`${value} telas/h`, `Carga`]}
                      />
                      <Bar dataKey="load" barSize={24} name="Carga" radius={[0, 4, 4, 0]}>
                        {data.map((entry, index) => {
                          if (entry.name === 'Carrinho') {
                             return <Cell key={`cell-${index}`} fill={entry.load > entry.limit ? '#f43f5e' : '#3b82f6'} />;
                          } else {
                             // Oven: Orange color, no red overload
                             return <Cell key={`cell-${index}`} fill="#f97316" />;
                          }
                        })}
                      </Bar>
                      {/* Only draw reference line for Cart */}
                      <ReferenceLine x={calc.cartCapacity} stroke="#94a3b8" strokeDasharray="3 3" ifOverflow="extendDomain" isFront />
                   </BarChart>
                 </ResponsiveContainer>
                 
                 <div className="flex justify-between items-center text-xs px-2 mt-[-20px]">
                    <span className="text-slate-400">0</span>
                    <span className={`px-1.5 py-0.5 rounded border flex items-center gap-1 ${calc.isBoosted ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white/80 text-slate-500 border-slate-200'}`}>
                       {calc.isBoosted && <ArrowUpCircle size={10} />}
                       Capacidade: {calc.cartCapacity}
                    </span>
                 </div>

                 {group.ovenSpeed === 'LENTO' && hasOven && (
                    <div className="absolute bottom-2 right-2 text-[10px] text-emerald-600 font-bold bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                       + Apoio Op. Forno
                    </div>
                 )}
              </div>

              {/* Operator Controls */}
              <div className="p-4 bg-slate-50 border-b border-slate-100 space-y-3">
                 <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Users size={12}/> Operadores Disponíveis</h4>
                 <div className="flex gap-2">
                    <button 
                      onClick={() => toggleOperator(group.id, 'cart')}
                      className={`flex-1 text-xs py-2 px-2 rounded border transition-colors ${group.hasCartOperator ? 'bg-blue-100 border-blue-300 text-blue-700 font-bold' : 'bg-white border-slate-300 text-slate-400'}`}
                    >
                      Carrinho
                    </button>
                    {hasOven && (
                      <button 
                        onClick={() => toggleOperator(group.id, 'oven')}
                        className={`flex-1 text-xs py-2 px-2 rounded border transition-colors ${group.hasOvenOperator ? 'bg-orange-100 border-orange-300 text-orange-700 font-bold' : 'bg-white border-slate-300 text-slate-400'}`}
                      >
                        Forno
                      </button>
                    )}
                 </div>
                 {calc.cartOverload && <p className="text-xs text-rose-600 font-medium animate-pulse">⚠ Excesso de carga no Carrinho!</p>}
                 {!group.hasOvenOperator && calc.ovenLoad > 0 && hasOven && <p className="text-xs text-rose-600 font-medium">⚠ Carga Forno sem Operador!</p>}
              </div>

              {/* Lines in Group */}
              <div className="flex-1 p-4 space-y-6">
                {group.lineIds.map(lineId => {
                  const line = lines.find(l => l.id === lineId);
                  if(!line) return null;
                  
                  return (
                    <div key={line.id} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-700 text-sm">{line.name || `Linha ${line.id.split('-')[1]}`}</span>
                        {line.associatedOven && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded border border-orange-200 flex items-center gap-1">
                            <Flame size={8}/> Forno {line.associatedOven}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {getLineMachines(line.id).map(m => (
                          <MachineCard key={m.id} machine={m} stage={ProductionStage.CONFORMACAO} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
           );
        })}
      </div>
    </div>
  );
};