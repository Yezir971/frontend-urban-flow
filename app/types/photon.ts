export interface LocationDataPhoton {
    name: string;
    lat: number | null;
    lon: number | null;
    otpValue: [number | null, number | null];
}

export interface ResponseFeaturePhoton {
    properties: {
        name: string;
        street?: string;
        postcode?: string;
        city?: string;
        country?: string;
        osm_id: number;
    };
    geometry: {
        coordinates: [number, number];
    };
}



interface ResponsePhotonFeatures {
    type: string, 
    properties: ResponsePhotonProperties,
    geometry: ResponsePhotonGeometry
}
interface ResponsePhotonProperties{
    osm_type: string,
    osm_id: number, 
    osm_key: string, 
    osm_value: string, 
    type: string,
    name: string,
    district: string,
    city: string,
    county: string,
    state: string,
    country: string,
    postcode: string,
    countrycode: string
}
interface ResponsePhotonGeometry {
    type: string,
    coordinates: number[]
}
export interface ResponsePhoton {
    type: string,
    features: ResponsePhotonFeatures[]
}
