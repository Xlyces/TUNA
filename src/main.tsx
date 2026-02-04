import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './globals.css';

// #region agent log - Check CSS loading
(() => {
  const checkCSSVars = () => {
    const root = document.documentElement;
    const computed = getComputedStyle(root);
    const primary = computed.getPropertyValue('--primary').trim();
    const coral = computed.getPropertyValue('--coral').trim();
    const aqua = computed.getPropertyValue('--aqua').trim();
    const web3 = computed.getPropertyValue('--web3').trim();
    const stylesheets = Array.from(document.styleSheets).map(s => s.href || 'inline').filter(Boolean);
    
    fetch('http://127.0.0.1:7243/ingest/d0f9d9f1-6e4f-4156-b431-e47d122c4d10',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.tsx:checkCSSVars',message:'CSS variables check',data:{primary,coral,aqua,web3,stylesheetsCount:stylesheets.length,hasGlobalsCSS:stylesheets.some(s => s.includes('globals'))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  };
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkCSSVars);
  } else {
    setTimeout(checkCSSVars, 100);
  }
})();
// #endregion

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* #region agent log */}
    {(() => { fetch('http://127.0.0.1:7243/ingest/d0f9d9f1-6e4f-4156-b431-e47d122c4d10',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.tsx:12',message:'Rendering App',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{}); return null; })()}
    {/* #endregion */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

