export const getApiKey = (): string => {
  // Per platform requirements, the API key is injected into process.env.
  // This is a special environment, not a standard browser or Node.js setup.
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    // This error is critical and indicates a problem with the execution environment's setup.
    console.error("CRITICAL: API_KEY not found in process.env. This is a platform configuration issue.");
    throw new Error("API_KEY environment variable not set.");
  }
  return apiKey;
};
