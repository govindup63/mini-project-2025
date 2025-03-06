import { NextResponse } from 'next/server';
import { LocationData, ApiResponse } from '@/app/types';

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location');

  if (!location) {
    return NextResponse.json({
      success: false,
      error: 'Location is required'
    } as ApiResponse);
  }

  try {
    // 1. Geocode the location -> coordinates
    const geoResponse = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`
    );
    const geoData = await geoResponse.json();

    if (!geoData || geoData.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Location not found'
      } as ApiResponse);
    }

    const locationData = geoData[0] as LocationData;

    // 2. Fetch daily solar radiation data from NASA POWER (kWh/m²/day by default)
    const solarResponse = await fetch(
      `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude=${locationData.lon}&latitude=${locationData.lat}&start=20230101&end=20230131&format=JSON`
    );
    const solarData = await solarResponse.json();

    const dailyValuesKwh: { [key: string]: number } = solarData.properties?.parameter?.ALLSKY_SFC_SW_DWN;
    if (!dailyValuesKwh) {
      throw new Error('Solar data not found or improperly formatted');
    }

    // 3. Convert each daily value from kWh/m²/day to W/m²
    //    1 kWh/m²/day ≈ 1000 Wh/m²/day; dividing by 24h => ~41.67 W/m² per 1 kWh/m²/day
    const dailyValues = Object.values(dailyValuesKwh).map((value: number) => {
      return value * (1000 / 24); // kWh/m²/day -> W/m²
    });

    // 4. Compute average in W/m²
    const average =
      dailyValues.reduce((sum, value) => sum + value, 0) / dailyValues.length;

    // 5. Fluid selection based on W/m² thresholds
    let fluid = 'Isobutane';
    if (average > 600) {
      fluid = 'R245fa';
    } else if (average > 400) {
      fluid = 'R134a';
    }

    // 6. Return the same JSON structure so the frontend still works
    return NextResponse.json({
      success: true,
      data: {
        solarData: dailyValues,        // array in W/m²
        average,                       // average in W/m²
        fluid,
        location: locationData.display_name,
      },
    } as ApiResponse);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process request',
    } as ApiResponse);
  }
}
