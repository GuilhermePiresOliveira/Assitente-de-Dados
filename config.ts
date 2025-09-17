export const getApiKey = (): string | undefined => {
  // Per platform requirements, the API key is injected into process.env.
  // This is a special environment, not a standard browser or Node.js setup.
  const apiKey = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : undefined;

  if (!apiKey) {
    // This error is critical and indicates a problem with the execution environment's setup.
    console.error("CRITICAL: API_KEY not found in process.env. This is a platform configuration issue.");
    // We return undefined instead of throwing an error to prevent a crash on load
    return undefined;
  }
  return apiKey;
};
