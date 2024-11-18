import referentielLignes from "../data/referentiel-des-lignes.json";

const pictoCache = new Map<string, string | undefined>();

export const extractLineId = (fullId: string): string => {
  return fullId.split(":")[1];
};

export const getLinePicto = (lineId: string): string | undefined => {
  console.log("calling me !");
  // If already in cache, return cached value
  if (pictoCache.has(lineId)) {
    return pictoCache.get(lineId);
  }

  const id = extractLineId(lineId);
  const lineData = referentielLignes.find((line) => line.id_line === id);
  const pictoUrl = lineData?.picto?.url;

  // Store in cache
  pictoCache.set(lineId, pictoUrl);

  return pictoUrl;
};
