import React, { useEffect, useState } from "react";
import { FaTemperatureHigh, FaCloud, FaWind, FaTint } from "react-icons/fa";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function Weather() {
  const [data, setData] = useState<any>(null);
  const [color, setColor] = useState<number>(0);
  const [textColor, setTextColor] = useState<string>("text-white");

  useEffect(() => {
    fetch("https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=60.88&lon=11.56")
      .then((response) => response.json())
      .then((data) => setData(data))
      .catch((error) => console.error("Error fetching weather data:", error));
  }, []);

  useEffect(() => {
    if (data) {
      const weather = data.properties?.timeseries[0]?.data?.instant?.details;
      if (weather) {
        setColor(weather.cloud_area_fraction);
        // setColor(20);
        console.log("Color: " + color);
      }
    }
  }, [data]);

  if (!data) {
    return <div className="text-center">Loading...</div>;
  }

  const weather = data.properties?.timeseries[0]?.data?.instant?.details;

  if (!weather) {
    return <div>No weather data available.</div>;
  }
  
  const getColorClass = (color: number) => {
    switch (true) {
        case color < 20:
          return "from-blue-500 to-blue-100";
          case color < 40:
              return "from-blue-400 to-grey-200";
          case color < 60:
              return "from-blue-300 to-grey-300";
          case color < 80:
              return "from-blue-200 to-grey-400";
          case color < 100:
              return "from-blue-100 to-grey-500";
          default:
              return "from-blue-700 to-grey-100";
    }
  };
  const TextColor = (color: number) => {
    switch (true) {
        // gradually change text color from white to black
        case color < 20:
            return "text-white";
        case color < 40:
            return "text-gray-400";
        case color < 60:
            return "text-gray-600";
        case color < 80:
            return "text-gray-800";
        case color < 100:
            return "text-black";
        default:
            return "text-black";
    }
  };

  return (
    <Card className={`w-full max-w-md mx-auto bg-gradient-to-r ${getColorClass(color)} ${TextColor(color)} p-4 rounded-2xl shadow-xl outline outline-blue-950`}>
      <CardHeader>
        <CardTitle className="text-center text-2xl font-semibold">
          Været i Elverum
        </CardTitle>
        <p className="text-center text-sm">{data.properties?.timeseries[0]?.time}</p>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <FaTemperatureHigh className="text-2xl" />
          <p>{weather.air_temperature}°C</p>
        </div>
        <div className="flex items-center space-x-2">
          <FaCloud className="text-2xl" />
          <p>{weather.cloud_area_fraction}% skyer</p>
        </div>
        <div className="flex items-center space-x-2">
          <FaTint className="text-2xl" />
          <p>{weather.relative_humidity}% fuktighet</p>
        </div>
        <div className="flex items-center space-x-2">
          <FaWind className="text-2xl" />
          <p>{weather.wind_speed} m/s ({Math.round(weather.wind_from_direction)}°)</p>
        </div>
      </CardContent>
    </Card>
  );
}