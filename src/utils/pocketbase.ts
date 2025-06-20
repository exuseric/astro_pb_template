import PocketBase from 'pocketbase';
import type { CompanyType, CountryCode, ObjectType, PageType } from "@utils/types"
import { generateDomain } from './generatedomain';

const pb = new PocketBase("http://127.0.0.1:8090");
const pageId = "w5l38o7bp8m6pu7";

const parentUrls: Record<CountryCode, string> = {
    ke: 'https://www.yellowpageskenya.com/',
    cv: 'https://www.paginasamarelas.cv/',
    mz: 'https://www.paginasamarelas.co.mz/',
    tz: 'https://www.yellow.co.tz/',
    st: 'https://www.paginasamarelas.st/',
};

const parentDomains: ObjectType = {
    ke: 'yellowpageskenya.com',
    cv: 'paginasamarelas.cv',
    mz: 'paginasamarelas.co.mz',
    tz: 'yellow.co.tz',
    st: 'paginasamarelas.st',
}

const companyNames: ObjectType = {
    ke: 'Yellow Pages Kenya',
    cv: 'Páginas Amarelas de Cabo Verde',
    mz: 'Páginas Amarelas Moçambique',
    tz: 'Yellow Tanzania',
    st: 'Páginas Amarelas São Tomé',
};

const enLang = ["ke", "tz"] // Fixed: removed comma inside string


const getImageUrl = ({ collection, filename }: { collection: any, filename: string }) => pb.files.getUrl(collection, filename)

const getData = async () => {
    try {
        await pb.collection("_superusers").authWithPassword(
            "eric.gathoni@yellowpageskenya.com",
            "CDz5pFLmm3thaFZ"
        );

        const data = await pb.collection("landing_page").getOne<PageType>(pageId, {
            expand: 'logo,hero_image,hero_cover,hero_grid,sections,sections.image,sections.section_grid,sections.section_grid.image,contact_info,contact_location,social_links,operating_hours,location,social_details',
        });

        const company: CompanyType['company'] = {
            url: parentUrls[data.country],
            companyName: companyNames[data.country],
            rightsReserved: enLang.includes(data.country) ? 'All rights reserved' : 'Todos os direitos reservados',
        }
        
        // Generate smart subdomain
        const subdomain = generateDomain(data.title);
        const finalUrl = `https://${subdomain}.${parentDomains[data.country]}`;
        
        console.log({
            name: data.title,
            finalUrl
        })
        
        const record = { ...data, company, finalUrl } as PageType & CompanyType
        return record;
    } catch (error) {
        console.error('Failed to fetch data:', error);
        // Return a basic fallback structure that matches PageType
        return {} as PageType & CompanyType;
    }
}

export { getImageUrl, getData }