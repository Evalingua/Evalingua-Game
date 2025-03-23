import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { BrowserRouter } from 'react-router-dom';
import '../public/style.css';
import { ToastContainer } from 'react-toastify';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <BrowserRouter>
            <ToastContainer />
            <App />
        </BrowserRouter>
    </React.StrictMode>,
)
