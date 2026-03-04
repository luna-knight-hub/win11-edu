import React, { useState } from 'react';

export const Calculator: React.FC<{ windowId: string }> = () => {
  const [display, setDisplay] = useState('0');
  const [memory, setMemory] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const calculate = (left: number, right: number, op: string) => {
    switch (op) {
      case '+': return left + right;
      case '-': return left - right;
      case '*': return left * right;
      case '/': return left / right;
      default: return right;
    }
  };

  const performOperation = (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (memory === null) {
      setMemory(inputValue);
    } else if (operator) {
      const currentValue = memory || 0;
      const newValue = calculate(currentValue, inputValue, operator);
      setMemory(newValue);
      setDisplay(String(newValue));
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  };

  const clear = () => {
    setDisplay('0');
    setMemory(null);
    setOperator(null);
    setWaitingForOperand(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#f3f3f3]">
      <div className="h-24 bg-[#f3f3f3] flex items-end justify-end px-4 pb-2 text-4xl font-semibold text-gray-800 break-all">
        {display}
      </div>
      <div className="flex-1 grid grid-cols-4 gap-1 p-1">
        {['CE', 'C', 'DEL', '/'].map((btn) => (
          <button key={btn} onClick={btn === 'C' ? clear : () => performOperation(btn)} className="bg-white hover:bg-gray-100 rounded text-sm font-medium">
            {btn}
          </button>
        ))}
        {['7', '8', '9', '*'].map((btn) => (
          <button key={btn} onClick={() => ['*'].includes(btn) ? performOperation(btn) : inputDigit(btn)} className={['*'].includes(btn) ? "bg-white hover:bg-gray-100 rounded" : "bg-white hover:bg-gray-100 rounded font-bold"}>
            {btn}
          </button>
        ))}
        {['4', '5', '6', '-'].map((btn) => (
          <button key={btn} onClick={() => ['-'].includes(btn) ? performOperation(btn) : inputDigit(btn)} className={['-'].includes(btn) ? "bg-white hover:bg-gray-100 rounded" : "bg-white hover:bg-gray-100 rounded font-bold"}>
            {btn}
          </button>
        ))}
        {['1', '2', '3', '+'].map((btn) => (
          <button key={btn} onClick={() => ['+'].includes(btn) ? performOperation(btn) : inputDigit(btn)} className={['+'].includes(btn) ? "bg-white hover:bg-gray-100 rounded" : "bg-white hover:bg-gray-100 rounded font-bold"}>
            {btn}
          </button>
        ))}
        {['+/-', '0', '.', '='].map((btn) => (
          <button key={btn} onClick={() => btn === '=' ? performOperation('=') : inputDigit(btn)} className={btn === '=' ? "bg-blue-500 hover:bg-blue-600 text-white rounded" : "bg-white hover:bg-gray-100 rounded font-bold"}>
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
};
