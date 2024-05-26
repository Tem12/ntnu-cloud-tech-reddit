/* -------------------------------------------------------------
 * Project: IDG2001 Cloud Technologies - assignment 2
 * File: App.js
 * Brief: Web application implementation
 * Author: Tomas Hladky <tomashl@stud.ntnu.no>
 * Date: May 24th, 2024
 * -------------------------------------------------------------
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
