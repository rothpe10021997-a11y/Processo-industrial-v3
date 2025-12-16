import React, { useRef } from 'react';
import { useFactory } from '../services/factoryContext';
import { Download, Upload, FileJson, AlertTriangle, Save, FolderOpen, Database } from 'lucide-react';

export const DataManager: React.FC = () => {
  const { products, machines, operatorGroups, importProducts, loadScenario } = useFactory();
  
  const productsInputRef = useRef<HTMLInputElement>(null);
  const scenarioInputRef = useRef<HTMLInputElement>(null);

  // --- HANDLERS FOR PRODUCTS ONLY ---
  const handleExportProducts = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(products, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `catalogo_produtos_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportProducts = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (Array.isArray(json)) {
             if (window.confirm(`Tem certeza que deseja importar ${json.length} modelos? A lista de produtos será substituída e as máquinas reiniciadas.`)) {
                importProducts(json);
                alert('Catálogo de produtos importado com sucesso!');
             }
        } else {
            alert('Formato inválido. Esperado array de produtos.');
        }
      } catch (error) {
        alert('Erro ao ler arquivo.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // --- HANDLERS FOR FULL SCENARIO ---
  const handleExportScenario = () => {
    const scenarioData = {
      timestamp: new Date().toISOString(),
      products,
      machines,
      operatorGroups
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(scenarioData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `cenario_completo_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportScenario = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        // Basic validation check for scenario keys
        if (json.machines && json.products && json.operatorGroups) {
             if (window.confirm(`Deseja carregar este cenário completo?\nIsso substituirá produtos, configurações de máquina e operadores atuais.`)) {
                loadScenario(json);
                alert('Cenário carregado com sucesso!');
             }
        } else {
            alert('Arquivo inválido. O arquivo não parece ser um backup de cenário completo.');
        }
      } catch (error) {
        alert('Erro ao ler arquivo JSON.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
     <div className="max-w-5xl mx-auto space-y-8">
        
        {/* SECTION 1: FULL SCENARIO */}
        <div className="bg-white p-6 rounded-xl border border-indigo-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
               <Save size={120} />
            </div>
            
            <h2 className="text-xl font-bold text-indigo-900 mb-2 flex items-center gap-2 relative z-10">
                <Save className="text-indigo-600" />
                Snapshot do Cenário Completo
            </h2>
            <p className="text-slate-600 mb-6 max-w-2xl relative z-10">
               Salva o estado <strong>inteiro</strong> da simulação atual: produtos, quais máquinas estão ligadas, produções configuradas e operadores. Ideal para salvar configurações de dias específicos ou estudos de caso.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                <button 
                   onClick={handleExportScenario}
                   className="flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-indigo-100 bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-100 hover:border-indigo-200 transition-all"
                >
                   <Save size={20} /> Salvar Cenário Atual (.json)
                </button>

                <div className="relative">
                   <input 
                       type="file" 
                       accept=".json" 
                       onChange={handleImportScenario} 
                       className="hidden" 
                       ref={scenarioInputRef} 
                   />
                   <button 
                      onClick={() => scenarioInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all"
                   >
                      <FolderOpen size={20} /> Carregar Cenário
                   </button>
                </div>
            </div>
        </div>

        {/* SECTION 2: MODEL CATALOG ONLY */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Database className="text-slate-500" />
                Apenas Catálogo de Produtos
            </h2>
            <p className="text-sm text-slate-500 mb-6">
                Use esta opção se deseja apenas transferir a lista de produtos (modelos) entre computadores, sem afetar as configurações das máquinas (elas serão resetadas).
            </p>

            <div className="flex flex-wrap gap-4">
                <button 
                    onClick={handleExportProducts} 
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded shadow-sm text-sm text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-colors"
                >
                    <Download size={16} /> Exportar Lista
                </button>

                <div className="relative">
                     <input 
                        type="file" 
                        accept=".json" 
                        onChange={handleImportProducts} 
                        className="hidden" 
                        ref={productsInputRef} 
                    />
                    <button 
                        onClick={() => productsInputRef.current?.click()} 
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded shadow-sm text-sm text-slate-600 hover:text-emerald-600 hover:border-emerald-300 transition-colors"
                    >
                        <Upload size={16} /> Importar Lista
                    </button>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 flex items-start gap-2 text-xs text-slate-400">
               <AlertTriangle size={14} className="mt-0.5" />
               <p>Importar apenas produtos fará com que máquinas ativas percam sua referência de produto atual.</p>
            </div>
        </div>

     </div>
  );
};