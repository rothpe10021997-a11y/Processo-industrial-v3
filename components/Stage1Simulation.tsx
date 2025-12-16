import React from 'react';
import { useFactory } from '../services/factoryContext';
import { MachineCard } from './MachineCard';
import { ProductionStage } from '../types';
import { AlertTriangle, CheckCircle, Layers, Grid } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

export const Stage1Simulation: React.FC = () => {
  const { machines, stage1Calculations } = useFactory();

  const renderLineDashboard = (lineId: string, title: string) => {
    // Defensive Check: Ensure calculations exist before rendering
    if (!stage1Calculations || !stage1Calculations.lines || !stage1Calculations.lines[lineId]) {
       return (
         <div className="bg-white rounded-xl border border-slate-200 p-8 flex items-center justify-center text-slate-400">
           Carregando dados da {title}...
         </div>
       );
    }

    const lineData = stage1Calculations.lines[lineId];
    const lineMachines = machines.filter(m => m.lineId === lineId);

    const chartData = [
      { name: 'Forno', value: lineData.forno.load, limit: lineData.forno.limit },
      { name: 'Secagem', value: lineData.secagem.load, limit: lineData.secagem.limit },
    ];

    const hasAlert = lineData.forno.isOver || lineData.secagem.isOver;

    return (
      <div className={`bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col ${hasAlert ? 'border-rose-300 ring-1 ring-rose-100' : 'border-slate-200'}`}>
         {/* Line Header */}
         <div className={`px-5 py-4 border-b flex justify-between items-center ${hasAlert ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'}`}>
            <div>
               <h3 className="font-bold text-lg text-slate-800">{title}</h3>
               <p className="text-xs text-slate-500">Esteira Independente</p>
            </div>
            {hasAlert ? (
               <span className="flex items-center gap-1 px-2 py-1 bg-rose-500 text-white text-xs font-bold rounded animate-pulse">
                  <AlertTriangle size={12}/> GARGALO
               </span>
            ) : (
               <span className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded border border-emerald-200">
                  <CheckCircle size={12}/> OK
               </span>
            )}
         </div>

         <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stats Column */}
            <div className="space-y-4">
                {/* Stats Grid */}
               <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase mb-1"><Layers size={10}/> Produção</span>
                      <span className="text-lg font-bold text-slate-800 leading-none">{lineData.lineTotalPieces.toLocaleString()} <small className="text-slate-400 font-normal text-xs">pçs/h</small></span>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <span className="flex items-center gap-1 text-[10px] font-bold text-blue-500 uppercase mb-1"><Grid size={10}/> Total Telas</span>
                      <span className="text-lg font-bold text-blue-800 leading-none">{lineData.lineTotalTrays.toLocaleString()} <small className="text-blue-400 font-normal text-xs">telas/h</small></span>
                  </div>
               </div>

               {/* Chart */}
               <div className="h-32 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 30 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={60} tick={{fontSize: 11}} />
                      <Tooltip cursor={{fill: 'transparent'}} contentStyle={{fontSize: '12px'}} />
                      <Bar dataKey="value" barSize={20} radius={[0, 4, 4, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.value > entry.limit ? '#f43f5e' : (entry.name === 'Forno' ? '#f97316' : '#0ea5e9')} />
                        ))}
                      </Bar>
                      <ReferenceLine x={400} stroke="#cbd5e1" strokeDasharray="3 3" />
                    </BarChart>
                  </ResponsiveContainer>
               </div>

               {/* Detailed Loads */}
               <div className="grid grid-cols-2 gap-2 text-sm">
                   <div className={`p-2 rounded border ${lineData.forno.isOver ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-200'}`}>
                      <span className="block text-[10px] text-slate-400 uppercase mb-1">Carga Forno</span>
                      <div className="font-mono font-bold text-slate-700">{lineData.forno.load} <span className="text-[10px] text-slate-400">/ {lineData.forno.limit}</span></div>
                   </div>
                   <div className={`p-2 rounded border ${lineData.secagem.isOver ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-200'}`}>
                      <span className="block text-[10px] text-slate-400 uppercase mb-1">Carga Secagem</span>
                      <div className="font-mono font-bold text-slate-700">{lineData.secagem.load} <span className="text-[10px] text-slate-400">/ {lineData.secagem.limit}</span></div>
                   </div>
               </div>
            </div>

            {/* Machines Grid */}
            <div className="grid grid-cols-2 gap-3 content-start">
               {lineMachines.map(m => (
                 <MachineCard key={m.id} machine={m} stage={ProductionStage.SUCCAO} />
               ))}
            </div>
         </div>
      </div>
    );
  };

  const total = stage1Calculations?.totalPiecesPerHour || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Etapa 1: Sucção</h2>
          <p className="text-sm text-slate-500">Controle por Esteira Independente</p>
        </div>
        <div className="text-right">
           <span className="block text-xs font-bold text-slate-400 uppercase">Total Fábrica</span>
           <span className="text-2xl font-bold text-slate-800">{total.toLocaleString()} <span className="text-sm font-medium text-slate-400">pçs/h</span></span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
         {renderLineDashboard('S1-A', 'Linha A (Esteira)')}
         {renderLineDashboard('S1-B', 'Linha B (Esteira)')}
      </div>
    </div>
  );
};