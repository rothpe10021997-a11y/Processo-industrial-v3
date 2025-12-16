import React, { useState } from 'react';
import { useFactory } from '../services/factoryContext';
import { Product } from '../types';
import { Trash2, Plus, Box, Package } from 'lucide-react';

export const ProductManager: React.FC = () => {
  const { products, addProduct, removeProduct } = useFactory();
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    piecesPerTray: 0,
    stage1Rate: 0,
    stage2Target: 0,
    packagingFactor: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProduct.name && newProduct.piecesPerTray && newProduct.stage1Rate && newProduct.stage2Target && newProduct.packagingFactor) {
      addProduct({
        ...newProduct as Product,
        id: `p-${Date.now()}`
      });
      setNewProduct({ name: '', piecesPerTray: 0, stage1Rate: 0, stage2Target: 0, packagingFactor: 0 });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-6">
          <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
            <Plus size={20} className="text-blue-500" /> Novo Produto
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome do Modelo</label>
              <input 
                type="text" 
                required
                className="w-full p-2 bg-white text-slate-900 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-400"
                placeholder="Ex: Modelo X-200"
                value={newProduct.name}
                onChange={e => setNewProduct({...newProduct, name: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Peças / Tela</label>
                <input 
                  type="number" 
                  required min="1"
                  className="w-full p-2 bg-white text-slate-900 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newProduct.piecesPerTray || ''}
                  onChange={e => setNewProduct({...newProduct, piecesPerTray: Number(e.target.value)})}
                />
              </div>
              <div>
                 {/* Spacer */}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded border border-slate-100 space-y-3">
              <h4 className="text-xs font-bold text-slate-400">Parâmetros de Produção</h4>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Prod. Hora (Sucção)</label>
                <input 
                  type="number" 
                  required min="1"
                  className="w-full p-2 bg-white text-slate-900 border border-slate-300 rounded text-sm outline-none placeholder:text-slate-400"
                  placeholder="Peças/h"
                  value={newProduct.stage1Rate || ''}
                  onChange={e => setNewProduct({...newProduct, stage1Rate: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Meta Hora (Conformação)</label>
                <input 
                  type="number" 
                  required min="1"
                  className="w-full p-2 bg-white text-slate-900 border border-slate-300 rounded text-sm outline-none placeholder:text-slate-400"
                  placeholder="Peças/h"
                  value={newProduct.stage2Target || ''}
                  onChange={e => setNewProduct({...newProduct, stage2Target: Number(e.target.value)})}
                />
              </div>
            </div>

            <div className="p-3 bg-indigo-50 rounded border border-indigo-100 space-y-3">
              <h4 className="text-xs font-bold text-indigo-400 flex items-center gap-1"><Package size={12}/> Embalagem</h4>
              <div>
                <label className="block text-xs text-indigo-700 mb-1">Fator de Carga (Decimal/Maq)</label>
                <input 
                  type="number" 
                  required min="0" step="0.01"
                  className="w-full p-2 bg-white text-slate-900 border border-indigo-200 rounded text-sm outline-none focus:border-indigo-500 placeholder:text-slate-400"
                  placeholder="Ex: 0.2 (20% de uma pessoa)"
                  value={newProduct.packagingFactor || ''}
                  onChange={e => setNewProduct({...newProduct, packagingFactor: Number(e.target.value)})}
                />
                <p className="text-[10px] text-indigo-400 mt-1">
                   Insira o decimal correspondente à carga que este modelo ocupa de uma pessoa por máquina (Ex: 1 maq = 0.2 pessoas).
                </p>
              </div>
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded transition-colors shadow-sm">
              Cadastrar Produto
            </button>
          </form>
        </div>
      </div>

      {/* List */}
      <div className="lg:col-span-2 space-y-4">
        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
          <Box size={20} className="text-slate-500" /> Catálogo de Produtos
        </h3>
        
        {products.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400">
            Nenhum produto cadastrado.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map(p => (
              <div key={p.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative group">
                <button 
                  onClick={() => removeProduct(p.id)}
                  className="absolute top-3 right-3 text-slate-300 hover:text-rose-500 transition-colors"
                  title="Remover"
                >
                  <Trash2 size={16} />
                </button>
                <h4 className="font-bold text-slate-700">{p.name}</h4>
                <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                  <div className="bg-slate-50 p-2 rounded col-span-2 flex justify-between items-center px-4">
                    <span className="text-[10px] text-slate-400 uppercase">Pçs/Tela</span>
                    <span className="font-mono font-bold text-slate-600">{p.piecesPerTray}</span>
                  </div>
                  <div className="bg-blue-50 p-2 rounded border border-blue-100">
                    <span className="block text-[10px] text-blue-400 uppercase">Sucção</span>
                    <span className="font-mono font-bold text-blue-700">{p.stage1Rate}</span>
                  </div>
                  <div className="bg-emerald-50 p-2 rounded border border-emerald-100">
                    <span className="block text-[10px] text-emerald-400 uppercase">Meta Conf.</span>
                    <span className="font-mono font-bold text-emerald-700">{p.stage2Target}</span>
                  </div>
                  <div className="bg-indigo-50 p-2 rounded border border-indigo-100 col-span-2 flex justify-between items-center px-4">
                     <span className="flex items-center gap-1 text-[10px] text-indigo-400 uppercase"><Package size={10}/> Carga Emb.</span>
                     <span className="font-mono font-bold text-indigo-700">{p.packagingFactor} <span className="text-[9px] font-normal text-indigo-400">pessoa/maq</span></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};