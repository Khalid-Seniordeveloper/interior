"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const searchParams = useSearchParams();
  const name = searchParams.get("name") || "";
  const tagline = searchParams.get("tagline") || "";
  const id = searchParams.get("id") || "";
  const size = searchParams.get("size") || "";
  const movableParam = searchParams.get("movable") || "";
  const movable = movableParam.toLowerCase() === "true";

  console.log("Bot name =>", name);
  console.log("Bot tagline =>", tagline);
  console.log("Bot id =>", id);
  console.log("Bot size =>", size);
  console.log("Bot movable =>", movable);

  useEffect(() => {
    const existingScript = document.querySelector(`script[data-id="${id}"]`);
    if (existingScript) {
      existingScript.remove();
    }

    const existingWidget = document.querySelector(".widget-container");
    if (existingWidget) {
      existingWidget.remove();
    }

    const script = document.createElement("script");
    script.setAttribute("data-name", name);
    script.setAttribute("data-tagline", tagline);
    script.setAttribute("data-id", id);
    script.setAttribute("data-size", size);
    script.setAttribute("data-movable", movable ? "true" : "false");
    script.setAttribute("data-preview", "true");
    script.setAttribute("type", "module");
    script.defer = true;

    //* Add a cache-busting query parameter to force reloading
    script.setAttribute("src", `/main.js?ts=${Date.now()}`);
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      const widgetContainers =
        document.body.querySelectorAll(".widget-container");
      if (widgetContainers) {
        widgetContainers.forEach((container) =>
          document.body.removeChild(container)
        );
      }
    };
  }, [name, tagline, id, size, movable]);

  return null;
}
