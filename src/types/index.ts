export type TransportMode = "Metro" | "RER" | "Bus" | "Tram";

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
  direction: "aller" | "retour";
}

export interface Line {
  id_line: string;
  name_line: string;
  shortname_line: string;
  transportmode: TransportMode;
  operatorname: string;
  colourweb_hexa: string;
  textcolourweb_hexa: string;
  picto?: {
    url: string;
  };
}
