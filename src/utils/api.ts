import { FavoriteStop } from "../types";

export async function getNextPassages(
  stop: FavoriteStop
): Promise<{ destination: string; time: string }[]> {
  const apiUrl = `https://api-ratp-prim.sncf.com/v4/stop_schedules?stop_point=IDFM:${stop.stop_id}`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: "VOTRE_CLE_API_ICI",
      },
    });
    const data = await response.json();

    return data.result.schedules.map((schedule: any) => ({
      destination: schedule.destination.name,
      time: schedule.message,
    }));
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des prochains passages:",
      error
    );
    return [];
  }
}
