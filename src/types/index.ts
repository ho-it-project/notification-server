// 연습용 타입
export interface ChangeErStatusDTO {
  /**
   * @type string
   */
  er_id: string;

  /**
   * @type int
   * @minimum 0
   */
  bed_count: number;
}

export interface ChatGatewayClinetQuery {
  /**
   * @type string
   */
  er_id: string;

  /**
   * @type string
   * @pattern ^[a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣]*$
   */
  hospital_name: string;
}

export interface ChatGatewayClinetPayload {
  /**
   * @type string
   */
  to_er_id: string;

  /**
   * @type string
   */
  text: string;
}

export type Status = 'ACTIVE' | 'INACTIVE' | 'DELETED';
export type Severity = 'SEVERE' | 'MILD' | 'NONE' | 'UNKNOW';
export type Gender = 'FEMALE' | 'MALE';
export type RequestStatus = 'REQUESTED' | 'VIEWED' | 'ACCEPTED' | 'REJECTED' | 'CANCELED' | 'COMPLETED';

export type KafkaPayload<T> = {
  body: T;
};
