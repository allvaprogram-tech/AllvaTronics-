export type ComponentType = 'resistor' | 'capacitor' | 'capacitor_elec' | 'ic' | 'ground' | 'transistor' | 'transistor_pnp' | 'inductor' | 'diode' | 'battery' | 'switch' | 'led' | 'lamp' | 'powersupply' | 'arduino_uno' | 'esp32' | 'esp32_cam' | 'raspberry_pi' | 'buzzer' | 'relay' | 'potentiometer' | 'oled' | 'motor' | 'mosfet' | 'mosfet_p' | 'timer555' | 'opamp' | 'logic_gate' | 'logic_and' | 'logic_or' | 'logic_nand' | 'logic_nor' | 'logic_xor' | 'ac_source' | 'voltmeter' | 'ammeter' | 'oscilloscope' | 'seven_segment' | 'protoboard' | 'usb_c' | 'micro_usb';
export type ToolType = 'select' | 'wire' | ComponentType | 'eraser' | 'probe';

export type PcbComponentType = 'pad' | 'via' | 'dip8' | 'smd' | 'sot23' | 'to220' | 'sop' | 'qfp' | 'pinheader' | 'bga' | 'usb_c' | 'micro_usb' | 'cr2032' | 'ldr_smd' | 'ntc_smd' | 'crystal' | 'copper_pour' | 'fiducial' | 'mounting_hole' | 'test_point';
export type PcbToolType = 'select' | 'trace' | PcbComponentType | 'board' | 'eraser';

export type EditorMode = 'schematic' | 'pcb';


export interface Point {
  x: number;
  y: number;
}

export interface WireEntity {
  id: string;
  type: 'wire';
  points: Point[];
  width?: number;
  selected?: boolean;
  color?: string;
}

export interface ComponentEntity {
  id: string;
  type: 'component';
  componentType: ComponentType;
  x: number;
  y: number;
  rotation: number;
  name: string;
  value?: string;
  customProps?: Record<string, any>;
  selected?: boolean;
}

export interface TraceEntity {
  id: string;
  type: 'trace';
  points: Point[];
  layer: 'top' | 'bottom';
  width?: number;
  selected?: boolean;
}

export interface PcbComponentEntity {
  id: string;
  type: 'pcb_component';
  componentType: PcbComponentType;
  x: number;
  y: number;
  rotation: number;
  name: string;
  layer?: 'top' | 'bottom';
  selected?: boolean;
  customProps?: any;
}

export interface PcbBoardEntity {
  id: string;
  type: 'board';
  x: number;
  y: number;
  width: number;
  height: number;
  selected?: boolean;
}

export type SchemaElement = WireEntity | ComponentEntity;
export type PcbElement = TraceEntity | PcbComponentEntity | PcbBoardEntity;
export type AnyElement = SchemaElement | PcbElement;

export interface DesignState {
  elements: SchemaElement[];
  pcbElements: PcbElement[];
  zoom: number;
  pan: Point;
  selectedIds: string[];
}
