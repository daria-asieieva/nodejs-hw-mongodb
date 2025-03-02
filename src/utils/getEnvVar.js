export const getEnvVar = (key) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Змінна оточення ${key} не задана`);
  }
  return value;
};