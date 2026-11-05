import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource/pt-sans/400.css";
import "@fontsource/pt-sans/400-italic.css";
import "@fontsource/pt-sans/700.css";
import { App } from "./app/App";
import "./app/styles.css";
import { I18nProvider } from "./i18n";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </React.StrictMode>
);

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => navigator.serviceWorker.register(
    `${import.meta.env.BASE_URL}sw.js`,
    { scope: import.meta.env.BASE_URL }
  ).catch(() => undefined));
}
