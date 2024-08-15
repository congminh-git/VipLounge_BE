import { Repository } from 'typeorm';
import { Agency, Service } from './agency.entity';
export declare class AgencyService {
    private agencyRepository;
    constructor(agencyRepository: Repository<Agency>);
    getListAgency(): Promise<Agency[]>;
    getAgencyByKey(agencyKey: string): Promise<Agency>;
    addAgency(name: string, code: string, service: Service, airportCode: string): Promise<Agency>;
    updateAgency(name: string, service: Service, agencyKey: any): Promise<Agency>;
    putActiveAgency(agencyKey: string): Promise<Agency>;
    deleteAgency(agencyKey: string): Promise<void>;
}
