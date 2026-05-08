import posthog from 'posthog-js';

export const initAnalytics = () => {
  if (typeof window !== 'undefined') {
    posthog.init('__POSTHOG_API_KEY__', {
      api_host: '__POSTHOG_API_HOST__',
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') {
          posthog.debug();
        }
      },
      capture_pageview: true,
      capture_pageleave: true,
    });
  }
};

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture(eventName, properties);
  }
};

export const identifyUser = (userId: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.identify(userId, properties);
  }
};