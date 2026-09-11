export type EngineCommandType = 
  | "create_order" 
  | "get_depth"
  | "get_user_balance"
  | "get_order"
  | "cancel_order";


  export interface EngineRequest {
    correlationId: string,
    responsQueue: string,
    type: EngineCommandType,
    payload: Record<string, unknown> 
  }

export interface EngineResponse {
    correlationId: string,
    ok: boolean,
    data: unknown,
    error: string,
  }
