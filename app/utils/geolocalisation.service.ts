import type { ResponsePhoton } from "~/types/photon" 
export async function geoloc(position: string): Promise<number[]>{
    if (!position) return [0,0]
    console.log(position)
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