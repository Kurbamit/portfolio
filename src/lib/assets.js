// Files in public/assets/, resolved against the deploy base path.
export const assetUrl = (file) => `${import.meta.env.BASE_URL}assets/${file}`;
