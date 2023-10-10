export namespace ErAuth {
  export interface AccessTokenSignPayload {
    hospital_id: string;
    emergency_center_id: string;
    employee_id: string;
    id_card: string;
    role: string;
    type: 'er';
  }
}
