import React, { useState } from 'react';
import { FactoryProvider, useFactory } from './services/factoryContext';
import { MainDashboard } from './components/MainDashboard';
import { Stage1Simulation } from './components/Stage1Simulation';
import { Stage2Simulation } from './components/Stage2Simulation';
import { ProductManager } from './components/ProductManager';
import { DataManager } from './components/DataManager';
import { Activity, Layers, Settings, Database, LayoutDashboard, RefreshCcw, Save } from 'lucide-react';

// Wrapper component to access context in the App shell (for the reset button)
const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'stage1' | 'stage2' | 'products' | 'data'>('dashboard');
  const { resetFactory } = useFactory();

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900">
      
      {/* Navbar */}
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Activity size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">FactorySim Pro</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">Engenharia de Processos</p>
            </div>
          </div>
          
          <nav className="flex space-x-1 overflow-x-auto">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <LayoutDashboard size={16} /> Visão Geral
            </button>
            <button 
              onClick={() => setActiveTab('stage1')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'stage1' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <Layers size={16} /> Sucção
            </button>
            <button 
              onClick={() => setActiveTab('stage2')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'stage2' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <Settings size={16} /> Conformação
            </button>
            <button 
              onClick={() => setActiveTab('products')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'products' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <Database size={16} /> Produtos
            </button>
            <button 
              onClick={() => setActiveTab('data')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'data' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <Save size={16} /> Dados
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <MainDashboard />}
        {activeTab === 'stage1' && <Stage1Simulation />}
        {activeTab === 'stage2' && <Stage2Simulation />}
        {activeTab === 'products' && <ProductManager />}
        {activeTab === 'data' && <DataManager />}
      </main>
      
      <footer className="text-center py-6 text-slate-400 text-xs flex flex-col items-center gap-2">
        <span>&copy; {new Date().getFullYear()} FactorySim Engine v1.0 | Simulação Interna</span>
        <button 
          onClick={resetFactory}
          className="flex items-center gap-1 text-slate-500 hover:text-rose-500 transition-colors"
        >
          <RefreshCcw size={10} /> Restaurar Padrões de Fábrica
        </button>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <FactoryProvider>
      <AppContent />
    </FactoryProvider>
  );
};

export default App;