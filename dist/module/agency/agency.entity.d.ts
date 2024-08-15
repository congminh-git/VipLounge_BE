export type Service = 'lounge' | 'connecting_flight';
export declare class Agency {
    key: string;
    name: string;
    code: string;
    service: Service;
    airportCode: string;
    status: number;
}
