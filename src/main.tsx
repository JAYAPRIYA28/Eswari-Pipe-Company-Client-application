
  import React from "react";
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";
  import {
  CartProvider,
} from "../src/app/components/CardContext.tsx";

  createRoot(document.getElementById("root")!).render(
     <React.StrictMode>
    <CartProvider>
    <App />
    </CartProvider>
    </React.StrictMode>
  );
  