export type TransportMode =
  | "Metro"
  | "Bus"
  | "RapidTransit"
  | "regionalRail"
  | "LocalTrain"
  | "Tramway";

export interface Stop {
  id: string;
  route_long_name: string;
  stop_id: string;
  stop_name: string;
  stop_lon: string;
  stop_lat: string;
  operatorname: string;
  shortname: string;
  mode: TransportMode;
  pointgeo: {
    lon: number;
    lat: number;
  };
  nom_commune: string;
  code_insee: string;
}

export interface FavoriteStop extends Stop {
  stop_id: string;
  direction: "aller" | "retour";
}

export interface Line {
  id: string;
  route_long_name: string;
  shortname: string;
  mode: TransportMode;
  operatorname: string;
  terminals: { start: string; end: string } | null;
  picto: string | null;
}
