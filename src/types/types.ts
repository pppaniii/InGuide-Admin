export interface Building {
  id: string;
  name: string;
  NE_bound?: [number, number]
  SW_bound?: [number, number]
}

export interface BuildingInfo {
  id: string;
  name: string;
  NE_bound: [number, number];
  SW_bound: [number, number];
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
