const API_BASE_URL = "https://prim.iledefrance-mobilites.fr/marketplace";

export async function getNextPassages(stopId: string, lineId?: string) {
  const url = new URL(`${API_BASE_URL}/stop-monitoring`);

  // Format the stop ID correctly
  const formattedStopId = formatStopId(stopId);
  url.searchParams.append("MonitoringRef", formattedStopId);

  if (lineId) {
    // Format the line ID correctly
    const formattedLineId = formatLineId(lineId);
    url.searchParams.append("LineRef", formattedLineId);
  }

  try {
    const response = await fetch(url.toString(), {
      headers: {
        apikey: import.meta.env.VITE_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching next passages:", error);
    throw error;
  }
}

function formatStopId(stopId: string): string {
  // Extract the numeric part after the colon
  const numericId = stopId.split(":").pop();

  // Format as STIF:StopPoint:Q:XXXXX:
  return `STIF:StopPoint:Q:${numericId}:`;
}

function formatLineId(lineId: string): string {
  // Extract the part after the colon (should start with 'C')
  const id = lineId.split(":").pop();

  // Format as STIF:Line::CXXXXX:
  return `STIF:Line::${id}:`;
}
