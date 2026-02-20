
import React, { useState } from 'react';
import { X, Delete, Search, Hash } from 'lucide-react';

interface RecallNumberPadProps {
  onClose: () => void;
  onSearch: (id: string) => void;
}

const RecallNumberPad: React.FC<RecallNumberPadProps> = ({ onClose, onSearch }) => {
  const [input, setInput] = useState('');

  const handlePress = (val: string) => {
    if (input.length < 6) {
      setInput(prev => prev + val);
    }
  };

  const handleBackspace = () => {
    setInput(prev => prev.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-[3rem] border border-gray-200 p-10 shadow-2xl relative my-auto">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
        >
          <X size={32} />
        </button>

        <div className="text-center mb-8 mt-4">
          <div className="flex items-center justify-center space-x-2 text-black mb-2">
            <Hash size={20} />
            <p className="text-[10px] font-black tracking-[0.2em] uppercase">Order Inquiry</p>
          </div>
          <div className="h-24 flex items-center justify-center">
            {input ? (
              <span className="text-6xl font-black text-black tracking-tighter">
                {input}
              </span>
            ) : (
              <span className="text-xl font-bold text-gray-200 uppercase tracking-widest">
                Identifier...
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handlePress(num)}
              className="h-20 flex items-center justify-center text-3xl font-black rounded-2xl bg-gray-50 hover:bg-black hover:text-white active:scale-95 transition-all text-black border border-transparent"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => setInput('')}
            className="h-20 flex items-center justify-center text-xs font-black rounded-2xl bg-gray-50 text-red-500 hover:bg-red-500 hover:text-white active:scale-95 transition-all uppercase tracking-widest"
          >
            Clear
          </button>
          <button
            onClick={() => handlePress('0')}
            className="h-20 flex items-center justify-center text-3xl font-black rounded-2xl bg-gray-50 hover:bg-black hover:text-white active:scale-95 transition-all text-black"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="h-20 flex items-center justify-center rounded-2xl bg-gray-50 hover:bg-black hover:text-white active:scale-95 transition-all text-black"
          >
            <Delete size={24} />
          </button>
        </div>

        <button 
          onClick={() => input && onSearch(input)}
          disabled={!input}
          className={`w-full py-6 rounded-2xl font-black text-lg tracking-widest uppercase transition-all active:scale-[0.98] shadow-lg flex items-center justify-center space-x-3 
            ${input 
              ? 'bg-black text-white hover:bg-gray-800' 
              : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}
        >
          <Search size={20} strokeWidth={3} />
          <span>Recall ID</span>
        </button>
      </div>
    </div>
  );
};

export default RecallNumberPad;