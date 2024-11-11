import { FavoriteStop } from "../types";

export function getFavoriteStops(): FavoriteStop[] {
  const stops = localStorage.getItem("favoriteStops");
  return stops ? JSON.parse(stops) : [];
}

export function saveFavoriteStop(stop: FavoriteStop) {
  const stops = getFavoriteStops();
  stops.push(stop);
  localStorage.setItem("favoriteStops", JSON.stringify(stops));
}
