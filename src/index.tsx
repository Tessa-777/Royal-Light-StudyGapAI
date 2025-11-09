import './index.css';
import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import './utils/debug'; // Import debug utilities

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

