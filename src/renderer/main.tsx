import "@/renderer/assets/index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/renderer/App";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    const splash = document.getElementById("splash-screen");
    if (splash) {
      splash.classList.add("fade-out");
      setTimeout(() => {
        splash.remove();
      }, 400);
    }
  });
});
