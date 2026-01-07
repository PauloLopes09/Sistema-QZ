
import React, { useState } from 'react';
import { Sparkles, Send, BrainCircuit, ShieldAlert, Zap } from 'lucide-react';
// Fixed typo: analyzeTriskRisk -> analyzeTenderRisk
import { analyzeTenderRisk, getLegalAdvice } from '../services/geminiService';
import { Tender } from '../types';

interface AIInsightsPanelProps {
  currentTender?: Tender;
}

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ currentTender }) => {
  const [analysis, setAnalysis] = useState<{risks: string[], recommendation: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', text: string}[]>([]);

  const handleAnalyze = async () => {
    if (!currentTender) return;
    setLoading(true);
    const result = await analyzeTenderRisk(currentTender);
    setAnalysis(result);
    setLoading(false);
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    
    setLoading(true);
    const aiResp = await getLegalAdvice(userMsg);
    setChatHistory(prev => [...prev, { role: 'ai', text: aiResp }]);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {currentTender && (
        <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-200" />
              <h3 className="font-bold">Análise Inteligente (IA)</h3>
            </div>
            <button 
              onClick={handleAnalyze}
              disabled={loading}
              className="px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Analisando...' : 'Atualizar Análise'}
            </button>
          </div>
          
          {analysis ? (
            <div className="space-y-4">
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-100 mb-2 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> Riscos Identificados
                </p>
                <ul className="text-sm space-y-1">
                  {analysis.risks.map((r, i) => <li key={i}>• {r}</li>)}
                </ul>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-100 mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Estratégia Recomendada
                </p>
                <p className="text-sm italic">"{analysis.recommendation}"</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-indigo-100">
              Clique em atualizar para processar os dados deste edital com o motor de inteligência Gemini.
            </p>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[400px]">
        <div className="p-4 border-b border-slate-100 flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-slate-900">Consultoria Jurídica Express</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatHistory.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-slate-500">Tire suas dúvidas jurídicas sobre a Nova Lei de Licitações.</p>
            </div>
          )}
          {chatHistory.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-slate-100 text-slate-800 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 p-3 rounded-2xl text-sm animate-pulse">Digitando...</div>
            </div>
          )}
        </div>

        <form onSubmit={handleChat} className="p-4 border-t border-slate-100 flex gap-2">
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Dúvida jurídica..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            type="submit"
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
