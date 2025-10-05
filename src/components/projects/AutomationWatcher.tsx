import { useEffect, useRef } from "react";
import { useAutomationProcessor } from "@/hooks/useAutomationProcessor";

const CHECK_INTERVAL = 2 * 60 * 1000; // 2 minutes

export const AutomationWatcher = () => {
  const { processAutomations } = useAutomationProcessor();
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Process immediately on mount
    processAutomations();

    // Set up interval for automatic processing
    intervalRef.current = setInterval(() => {
      processAutomations();
    }, CHECK_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return null;
};
