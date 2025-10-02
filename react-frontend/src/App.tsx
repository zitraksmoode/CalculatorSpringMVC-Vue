import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Switch } from '@headlessui/react';

const i18n = {
    ru: { title: 'Калькулятор', dark: 'Тёмный', calculate: 'Рассчитай как профи!', history: 'История', refresh: 'Обновить', copied: 'Скопировано!' },
    en: { title: 'Calculator', dark: 'Dark', calculate: 'Calculate like a pro!', history: 'History', refresh: 'Refresh', copied: 'Copied!' }
};

const THEMES = [
    { name: 'light', bg: 'bg-white', text: 'text-gray-900', accent: 'bg-blue-500', secondary: 'bg-gray-200', gradient: 'radial-gradient(circle, #f0f9ff, #e0f2fe)' },
    { name: 'dark', bg: 'bg-gray-900', text: 'text-white', accent: 'bg-purple-500', secondary: 'bg-gray-700', gradient: 'radial-gradient(circle, #1e293b, #0f172a)' },
    { name: 'neon', bg: 'bg-black', text: 'text-orange-400', accent: 'bg-orange-500', secondary: 'bg-gray-800', gradient: 'radial-gradient(circle, #000000, #1a1a1a, #ff6b35)' },
    { name: 'earth', bg: 'bg-green-50', text: 'text-green-900', accent: 'bg-green-600', secondary: 'bg-green-100', gradient: 'radial-gradient(circle, #f0fdf4, #dcfce7)' },
    { name: 'cyber', bg: 'bg-indigo-900', text: 'text-cyan-400', accent: 'bg-cyan-500', secondary: 'bg-indigo-800', gradient: 'radial-gradient(circle, #1e3a8a, #0c1a3f)' },
    { name: 'minimal', bg: 'bg-slate-50', text: 'text-slate-900', accent: 'bg-slate-600', secondary: 'bg-slate-100', gradient: 'radial-gradient(circle, #f8fafc, #f1f5f9)' }
];

function App() {
    const [display, setDisplay] = useState('0');
    const [currentInput, setCurrentInput] = useState('');
    const [history, setHistory] = useState<string[]>([]);
    const [themeIndex, setThemeIndex] = useState(0);
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [lang, setLang] = useState('ru');
    const [resultAnimation, setResultAnimation] = useState(false);
    const currentTheme = THEMES[themeIndex];
    const texts = i18n[lang as 'ru' | 'en'];

    useEffect(() => {
        fetchHistory();
        document.body.className = darkMode ? 'dark' : '';
        document.body.style.background = currentTheme.gradient;
        document.body.style.backgroundAttachment = 'fixed';
        const interval = setInterval(fetchHistory, 3000);
        return () => clearInterval(interval);
    }, [darkMode, themeIndex]);

    // Keyboard
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === '=') {
                e.preventDefault();
                calculate();
            } else if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '+', '-', '*', '/'].includes(e.key)) {
                e.preventDefault();
                handleButtonClick(e.key);
            } else if (e.key === 'Escape') {
                handleButtonClick('C');
            } else if (e.key === 'Backspace') {
                handleButtonClick('⌫');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentInput]);

    const handleButtonClick = (value: string) => {
        setError(false);
        setSuccess(false);
        if (['+', '-', '*', '/'].includes(value)) {
            setCurrentInput(currentInput + value);
            setDisplay(currentInput + value);
        } else if (value === '=') {
            calculate();
        } else if (value === 'C') {
            setCurrentInput(''); setDisplay('0');
        } else if (value === '⌫') {
            setCurrentInput(currentInput.slice(0, -1));
            setDisplay(currentInput.slice(0, -1) || '0');
        } else {
            setCurrentInput(currentInput + value);
            setDisplay(currentInput + value);
        }
    };

    const calculate = async () => {
        if (!currentInput) return;
        console.log('Sending to API:', currentInput);
        try {
            const response = await axios.post('http://localhost:8081/calculate', { expression: currentInput });
            console.log('API response:', response.data);
            const result = response.data.result;
            setResultAnimation(true);
            setTimeout(() => setResultAnimation(false), 1000);
            setDisplay(result.toFixed(2));
            setCurrentInput(result.toFixed(2));
            fetchHistory();
            setSuccess(true);
            setTimeout(() => setSuccess(false), 500);
            if ('vibrate' in navigator) navigator.vibrate(50);
        } catch (error) {
            console.error('Calc error:', error);
            setError(true); setTimeout(() => setError(false), 500);
        }
    };

    const fetchHistory = async () => {
        try {
            const response = await axios.get('http://localhost:8081/history');
            console.log('History API:', response.data);
            setHistory(response.data.map((item: any) => `${item.expression} = ${item.result.toFixed(2)}`));
        } catch (error) {
            console.error('History error:', error);
        }
    };

    const copyToClipboard = (item: string) => {
        navigator.clipboard.writeText(item);
        alert(texts.copied);
    };

    const Button = ({ value, type = 'number', className = '' }: { value: string; type?: 'number' | 'op' | 'action'; className?: string }) => (
        <motion.button
            whileHover={{ scale: 1.05, rotate: 1, boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
            whileTap={{ scale: 0.95 }}
            className={`
        ${currentTheme.secondary} ${currentTheme.text} p-4 rounded-2xl font-bold text-lg backdrop-blur-md bg-opacity-80 border border-opacity-20
        ${type === 'op' ? currentTheme.accent : ''} 
        ${type === 'action' ? 'bg-red-500 text-white' : ''}
        ${value === '=' ? 'bg-green-500 text-white' : ''}
        ${success && value === '=' ? 'ring-4 ring-rainbow shadow-lg' : ''}
        hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 shadow-lg
        ${className}
      `}
            onClick={() => handleButtonClick(value)} aria-label={value}
        >
            {value}
        </motion.button>
    );

    return (
        <div className={`${currentTheme.bg} ${currentTheme.text} min-h-screen flex items-center justify-center p-4 font-sans relative overflow-hidden`}>
            {/* Particles */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-20 left-10 w-4 h-4 bg-blue-400 rounded-full opacity-60 animate-float"></div>
                <div className="absolute top-40 right-20 w-6 h-6 bg-purple-400 rounded-full opacity-50 animate-float delay-1000"></div>
                <div className="absolute bottom-20 left-1/2 w-4 h-4 bg-green-400 rounded-full opacity-70 animate-float delay-2000"></div>
                <div className="absolute bottom-40 right-10 w-5 h-5 bg-orange-400 rounded-full opacity-60 animate-float delay-3000"></div>
            </div>

            {/* Switches */}
            <div className="absolute top-4 left-4 flex space-x-2 z-10">
                <select value={lang} onChange={(e) => setLang(e.target.value as 'ru' | 'en')} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 rounded">
                    <option value="ru">RU</option>
                    <option value="en">EN</option>
                </select>
            </div>
            <div className="absolute top-4 right-4 flex space-x-2 z-10">
                <div className="flex items-center space-x-2">
                    <Switch checked={darkMode} onChange={setDarkMode} className={`${darkMode ? 'bg-blue-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}>
                        <span className={`${darkMode ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                    </Switch>
                    <span>{texts.dark}</span>
                </div>
                <select value={themeIndex} onChange={(e) => setThemeIndex(Number(e.target.value))} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 rounded">
                    {THEMES.map((t, i) => <option key={i} value={i}>{t.name}</option>)}
                </select>
            </div>

            {/* Calculator */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md space-y-4 relative z-10">
                <h1 className="text-3xl font-bold text-center mb-4 opacity-80">{texts.title}</h1>
                <motion.div animate={error ? { x: [-10, 10, -10] } : success ? { scale: [1, 1.02, 1] } : {}} transition={{ duration: 0.3 }} className={`
          ${currentTheme.bg} ${currentTheme.text} p-6 rounded-3xl shadow-2xl backdrop-blur-xl bg-opacity-80 border border-opacity-30 ${error ? 'border-red-500' : 'border-blue-500'} text-right text-4xl font-mono tracking-wide ${resultAnimation ? 'fade-in-result' : ''}
        `} role="textbox" aria-live="polite">
                    {display || '0'}
                </motion.div>

                <div className="grid grid-cols-4 gap-3">
                    <Button value="C" type="action" />
                    <Button value="⌫" type="action" />
                    <Button value="/" type="op" />
                    <Button value="*" type="op" />
                    <Button value="7" />
                    <Button value="8" />
                    <Button value="9" />
                    <Button value="-" type="op" />
                    <Button value="4" />
                    <Button value="5" />
                    <Button value="6" />
                    <Button value="+" type="op" />
                    <Button value="1" />
                    <Button value="2" />
                    <Button value="3" />
                    <Button value="=" type="op" />
                    <Button value="0" className="col-span-3" />
                    <Button value="." />
                </div>

                <p className="text-center text-sm opacity-70 mt-2">{texts.calculate}</p>
            </motion.div>

            {/* History */}
            <AnimatePresence>
                {history.length > 0 && (
                    <motion.aside initial={{ opacity: 0, x: 300 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 300 }}
                                  className="absolute right-4 top-1/2 -translate-y-1/2 w-80 backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-3xl p-4 shadow-2xl border border-opacity-20 max-h-96 overflow-y-auto relative z-10"
                    >
                        <h2 className="text-xl font-bold mb-4">{texts.history}</h2>
                        <ul className="space-y-2">
                            {history.slice(-10).map((item, idx) => (
                                <motion.li key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                                           className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-700/50 rounded-2xl cursor-pointer hover:bg-white/70 dark:hover:bg-gray-700/70 transition-all duration-200"
                                           onClick={() => copyToClipboard(item)} onContextMenu={(e) => { e.preventDefault(); copyToClipboard(item); }}
                                >
                                    <span className="text-sm break-all">{item}</span>
                                    <button onClick={(e) => { e.stopPropagation(); }} className="text-red-500 hover:text-red-700">×</button>
                                </motion.li>
                            ))}
                        </ul>
                        <button onClick={fetchHistory} className="w-full mt-4 p-2 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition-all duration-200">{texts.refresh}</button>
                    </motion.aside>
                )}
            </AnimatePresence>
        </div>
    );
}

export default App;