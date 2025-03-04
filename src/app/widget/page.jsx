"use client"; // Ensure this is a Client Component

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Suspense } from "react";

function WidgetComponent() {
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
    // Remove existing script and widget if they exist
    const existingScript = document.querySelector(`script[data-id="${id}"]`);
    if (existingScript) {
      existingScript.remove();
    }

    const existingWidget = document.querySelector(".widget-container");
    if (existingWidget) {
      existingWidget.remove();
    }

    // Create and append the new script
    const script = document.createElement("script");
    script.setAttribute("data-name", name);
    script.setAttribute("data-tagline", tagline);
    script.setAttribute("data-id", id);
    script.setAttribute("data-size", size);
    script.setAttribute("data-movable", movable ? "true" : "false");
    script.setAttribute("data-preview", "true");
    script.setAttribute("type", "module");
    script.defer = true;

    // Add a cache-busting query parameter to force reloading
    script.setAttribute("src", `/main.js?ts=${Date.now()}`);
    document.body.appendChild(script);

    // Cleanup function to remove script and widget on unmount
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      const widgetContainers = document.body.querySelectorAll(".widget-container");
      if (widgetContainers) {
        widgetContainers.forEach((container) =>
          document.body.removeChild(container)
        );
      }
    };
  }, [name, tagline, id, size, movable]);

  return null; // No need to render anything in the DOM
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WidgetComponent />
    </Suspense>
  );
}