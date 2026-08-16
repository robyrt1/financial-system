import {
    RouteRequestParams,
    RouteResponseResult,
} from '@domain/types/routing.types';

export interface RouteRequestPort {
    execute(params: RouteRequestParams): Promise<RouteResponseResult>;
}

