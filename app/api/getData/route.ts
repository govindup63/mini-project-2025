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
    // Geocoding: Convert location to coordinates using OpenStreetMap's Nominatim API
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

    // Fetch Solar Radiation Data using the NASA POWER API
    const solarResponse = await fetch(
      `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude=${locationData.lon}&latitude=${locationData.lat}&start=20230101&end=20230131&format=JSON`
    );
    const solarData = await solarResponse.json();

    // Process the solar data: Extract daily radiation values
    const dailyValues = solarData.properties?.parameter?.ALLSKY_SFC_SW_DWN;
    if (!dailyValues) {
      throw new Error('Solar data not found or improperly formatted');
    }

    const values = Object.values(dailyValues) as number[];
    const average = values.reduce((sum, value) => sum + value, 0) / values.length;

    // Determine fluid recommendation based on average radiation
    let fluid = 'Isobutane';
    if (average > 600) {
      fluid = 'R245fa';
    } else if (average > 400) {
      fluid = 'R134a';
    }

    return NextResponse.json({
      success: true,
      data: {
        solarData: values,
        average,
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