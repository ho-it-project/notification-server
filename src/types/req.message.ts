import { tags } from 'typia';
import { Gender, RequestStatus, Severity, Status } from '.';

export namespace EmsToErRequestMessage {
  export interface EmsToErReq {
    patient_id: string;
    emergency_center_id: string;
    request_status: RequestStatus;
    request_date: string & tags.Format<'date-time'>;
    reject_reason: string | null;
    /**
     * 유닉스 타임스탬프 "1970-01-01T00:00:00Z" = 아직 응답 안함
     */
    response_date: string & tags.Format<'date-time'>;
    emergency_center_name: string;
    emergency_center_latitude: number;
    emergency_center_longitude: number;
    /**
     * 응급차와 응급실 사이의 거리
     */
    distance: number;
    /**
     * default
     */
    created_at: string & tags.Format<'date-time'>;
    updated_at: string & tags.Format<'date-time'>;
    status: Status;
    patient: {
      patient_id: string;
      /**
       * 익명으로 기본값
       */
      patient_name: string;
      /**
       * 생년월일 0000-00-00 형식 0000-00-00은 미상
       */
      patient_birth: string;
      patient_gender: Gender;
      /**
       * 중증, 경증, 정상, 미상
       */
      patient_severity: Severity;
      patient_symptom_summary: string;
      /**
       * 위도 - 사고지점
       */
      patient_latitude: number;
      /**
       * 경도 - 사고지점
       */
      patient_longitude: number;
      /**
       * 요청한 곳
       */
      ambulance_company_id: string;
      ambulance_company_name: string;
      ems_employee_id: string;
      ems_employee_name: string;
      /**
       * default
       */
      created_at: string & tags.Format<'date-time'>;
      updated_at: string & tags.Format<'date-time'>;
      status: Status;
    };
  }

  export interface EmsToErRes {
    patient_id: string;
    emergency_center_id: string;
    request_status: RequestStatus;
    request_date: string & tags.Format<'date-time'>;
    reject_reason: string | null;
    ambulance_company_id: string;
    ems_employee_id: string;
  }

  export interface EmsToErUpdate {
    ambulance_company_id: string;
    ambulance_company_name: string;
    ems_employee_id: string;
    patient_id: string;
    emergency_center_id: string;
    request_status: RequestStatus;
  }
}
