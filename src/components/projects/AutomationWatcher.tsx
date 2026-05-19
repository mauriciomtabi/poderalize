import { useEffect, useRef } from "react";
import { useAutomationProcessor } from "@/hooks/useAutomationProcessor";

const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
const INITIAL_DELAY_MIN = 0;
const INITIAL_DELAY_MAX = 30 * 1000; // 0-30 seconds random delay

export const AutomationWatcher = () => {
  const { processAutomations, isProcessing } = useAutomationProcessor();
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    // Add random initial delay to prevent simultaneous calls from multiple users
    const randomDelay = Math.floor(Math.random() * (INITIAL_DELAY_MAX - INITIAL_DELAY_MIN)) + INITIAL_DELAY_MIN;
    
    const initialTimeout = setTimeout(() => {
      if (!isProcessing) {
        processAutomations();
      }
    }, randomDelay);

    // Set up interval for automatic processing
    intervalRef.current = setInterval(() => {
      if (!isProcessing) {
        processAutomations();
      }
    }, CHECK_INTERVAL);

    return () => {
      clearTimeout(initialTimeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isProcessing, processAutomations]);

  return null;
};
