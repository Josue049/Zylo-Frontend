import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { seedBusinessUsers } from "./data/seedBusinessUsers";

// Sembrar cuentas de negocio predefinidas al arrancar la app
seedBusinessUsers();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
