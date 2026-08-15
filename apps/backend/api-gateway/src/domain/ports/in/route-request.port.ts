import {
    RouteRequestParams,
    RouteResponseResult,
} from '@domain/types/routing.types.js';

export interface RouteRequestPort {
    execute(params: RouteRequestParams): Promise<RouteResponseResult>;
}

