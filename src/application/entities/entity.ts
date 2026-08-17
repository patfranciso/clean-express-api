export interface ID {
  readonly id: string;
}
export interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
}

export interface Entity extends ID, Timestamps {}
