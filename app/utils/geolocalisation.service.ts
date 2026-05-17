
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
interface ResponsePhoton {
    type: string,
    features: ResponsePhotonFeatures[]
}


export async function geoloc(position: string): Promise<number[]>{
    if (!position) return [0,0]
    const config = useRuntimeConfig()
    try {
        let response = await fetch(`${config.public.urlPhoton}&q=${encodeURIComponent(position)}`)
        let data: ResponsePhoton = await response.json()
        if (data.features && data.features.length > 0) {
            return data.features[0]!.geometry.coordinates; 
        }
        return [0,0]
    } catch (error) {
        console.error(`Error request photon : ${error}`);
        return [0,0]
    }
}