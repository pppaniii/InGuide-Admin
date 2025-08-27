export interface Building {
  id: string;
  name: string;
}

export interface BuildingInfo {
  id: string;
  name: string;
  floors: Floor[];
}

export interface Floor {
  id:string;
  floor: number;
  floor_plan_url: string;
}

// conn
import { Polyline } from "leaflet";

export interface Connection {
  nodeId: string;
  polyline: Polyline;
}
