export interface TestBody {
  /**
   * @type int
   */
  test_id: number;

  /**
   * @type string
   */
  test_name?: string;
}

export interface TestBody2 {
  test: TestBody;
}

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
