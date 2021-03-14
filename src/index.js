import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { 
  interpolateOrRd,
  scaleSequential,
  max,
} from 'd3';
import { round } from './utils';
import { useAirports } from './useAirports';
import { useWorldAtlas } from './useWorldAtlas';
import { useCountryCodes } from './useCountryCodes';
import { useData } from './useData';
import { FlightMap } from './FlightMap';
import { FlightRoutesInputForm } from './FlightRoutesInputForm';

const width = 1024;
const height = 512;

const selectedYear = '2019';

const App = () => {
  const airports = useAirports();
  const worldAtlas = useWorldAtlas();
  const countryCodes = useCountryCodes();
  const data = useData();

  const inputRef = useRef();
  const [coordinates, setCoordinates] = useState([]);
  const [emissions, setEmissions] = useState(0);

  if (!airports || !worldAtlas || !countryCodes || !data) {
    return <pre>Loading...</pre>;
  }

  const numericCodeByAlpha3Code = new Map();
  countryCodes.forEach((code) => {
    numericCodeByAlpha3Code.set(
      code['alpha-3'],
      code['country-code']
    );
  });

  const filteredData = data.filter(
    (d) => d.Year === selectedYear
  );

  const rowByNumericCode = new Map();
  filteredData.forEach((d) => {
    const alpha3Code = d.Code;
    const numericCode = numericCodeByAlpha3Code.get(
      alpha3Code
    );
    rowByNumericCode.set(numericCode, d);
  });

  const colorValue = (d) => d.emissions;

  const colorScale = scaleSequential(
    interpolateOrRd
  ).domain([0, max(filteredData, colorValue)]);

  return (
    <>
      <svg width={width} height={height}>
        <FlightMap 
          worldAtlas={worldAtlas}
          rowByNumericCode={rowByNumericCode}
          colorValue={colorValue}
          colorScale={colorScale}
          emissions={emissions}
          coordinates={coordinates}
        />
        <text x="10" y={height - 10} font-size="small">* Colored countries represent that your flight emissions exceeded their per-capita yearly emissions in {selectedYear}.</text>
      </svg>
      <div>
        <FlightRoutesInputForm 
          airports={airports}
          inputRef={inputRef} 
          setEmissions={setEmissions}
          setCoordinates={setCoordinates}
        />
        <ul>
          <li>Total CO2 emissions from your flights: <b>{round(emissions, 3)} tonnes</b></li>
          <li>Global average of yearly emissions per capita in {selectedYear}: <b>{round(rowByNumericCode.get(undefined).emissions, 3)} tonnes</b> [<a href="https://ourworldindata.org/per-capita-co2" target="_blank">source</a>]</li>
        </ul>
      </div>
    </>
  );
};

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);