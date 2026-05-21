

export interface ResponsePlan {
    itineraries: Array<{
        duration: number;
        legs: Array<{
            mode: string;
            distance: number;
            startTime: number;
            endTime: number;
            from: {
                name: string;
            };
            to: {
                name: string;
            };
            legGeometry: {
                points: string
            };
            route: any; 
        }>;
    }>;
}


export interface ResponseTrip {
    data : {
        plan: ResponsePlan;
    }
}