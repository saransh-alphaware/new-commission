import React, { useEffect, useRef, useState, useCallback } from 'react';

const TURNSTILE_SCRIPT_ID = 'turnstile-script';
const TURNSTILE_SCRIPT_URL =
  'https://challenges.cloudflare.com/turnstile/v0/api.js';

export const useTurnstile = (siteKey, options = {}) => {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);

  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  // Load script
  useEffect(() => {
    if (isReady || error) return;

    const loadScript = () => {
      if (window.turnstile) {
        setIsReady(true);
        return;
      }

      if (document.getElementById(TURNSTILE_SCRIPT_ID)) {
        return;
      }

      const script = document.createElement('script');
      script.id = TURNSTILE_SCRIPT_ID;
      script.src = TURNSTILE_SCRIPT_URL;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        setIsReady(true);
        setError(null);
      };

      script.onerror = () => {
        setError('Failed to load Turnstile script');
        console.error('Failed to load Cloudflare Turnstile');
      };

      document.body.appendChild(script);
    };

    loadScript();
  }, [isReady, error]);

  // Render widget
  useEffect(() => {
    if (!isReady || !containerRef.current || !window.turnstile) return;

    const renderWidget = async () => {
      try {
        const widgetId = await window.turnstile.render(
          containerRef.current,
          {
            sitekey: siteKey,
            theme: 'light',
            size: 'normal',
            ...options,
          }
        );

        widgetIdRef.current = widgetId;
      } catch (err) {
        console.error('Turnstile render error:', err);

        const errorMessage =
          err?.response?.data?.message ||
          'Failed to render Turnstile widget';

        setError(errorMessage);
      }
    };

    renderWidget();
  }, [isReady, siteKey, options]);

  // Get token
  const getToken = useCallback(() => {
    if (!window.turnstile) {
      console.warn('Turnstile not ready');
      return undefined;
    }

    return window.turnstile.getResponse(widgetIdRef.current);
  }, []);

  // Reset widget
  const reset = useCallback(() => {
    if (window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
  }, []);

  return {
    containerRef,
    isReady,
    error,
    getToken,
    reset,
  };
};