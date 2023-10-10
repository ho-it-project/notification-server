export namespace EmsAuth {
  export interface AccessTokenSignPayload {
    ambulance_company_id: string;
    employee_id: string;
    id_card: string;
    role: string;
    type: 'ems';
  }
}
