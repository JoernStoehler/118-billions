import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import { assert } from 'console';

interface Row {
  year: number;
  population: number;
  crudeBirthRate: number;
}

async function parseDataset(
  file: string, 
  columns: {year: string, population: string, crudeBirthRate: string}, 
  filter: {[column: string]: string},
  factors: {population: number, crudeBirthRate: number}
): Promise<Row[]> {
  return await new Promise<Row[]>((resolve, reject) => {
    const results: Row[] = [];
    fs.createReadStream(file)
      .pipe(
        parse({
          columns: true,
          skip_empty_lines: true,
        })
      )
      .on('data', (row) => {
        // Filter rows based on the filter criteria
        if (Object.keys(filter).some((key) => row[key] !== filter[key])) {
          return;
        }
        // Convert the values to numbers and apply the factors
        results.push({
          year: parseFloat(row[columns.year]),
          population: parseFloat(row[columns.population]) * factors.population,
          crudeBirthRate: parseFloat(row[columns.crudeBirthRate]) * factors.crudeBirthRate,
        });
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

async function WPP2024_Demographic_Indicators_Medium() {
  const file = path.resolve('./datasets/WPP2024_Demographic_Indicators_Medium.csv');
  return await parseDataset(file, {
    year: 'Time',
    population: 'TPopulation1July',
    crudeBirthRate: 'CBR'
  }, {
    Location: 'World',
  }, {
    population: 1e3,
    crudeBirthRate: 1e-3,
  });
}

async function custom_data_coarse() {
  const file = path.resolve('./datasets/custom_data_coarse.csv');
  return await parseDataset(file, {
    year: 'Year',
    population: 'Population',
    crudeBirthRate: 'CrudeBirthRate'
  }, {
    // No filter
  }, {
    population: 1e6,
    crudeBirthRate: 1e-3,
  });
}

export async function joinedData(): Promise<Row[]> {
  // const data = await WPP2024_Demographic_Indicators_Medium();
  const customData = await custom_data_coarse();
  return customData;
}

function cumsum0(arr: number[]): number[] { // 0, arr[0], arr[0]+arr[1], ..., ...+arr[arr.length-1]
  const result = [0];
  for (let i = 0; i < arr.length; i++) {
    result.push(result[i] + arr[i]);
  }
  return result; // length n+1
}

/**
 * Piecewise exponential fit with points
 *  f(x[:]) = y[:], f >= 0 with x[0]=x0, x[n-1]=x1
 * Normalized inverse of the integral
 *  F(x) = int_x0^x dx' f(x')
 * This function returns z => F^-1(z)
 */
export function integralOfExponentialFit(
  x: number[],
  y: number[],
): {
  F: (X: number) => number | undefined;
  Finv: (z: number) => number | undefined;
} {
  const n = x.length;
  assert(n > 0, "Data should not be empty");
  assert(x.length === y.length, "X and Y length mismatch");

  // exponential fit => per interval parameters
  // f(x[i] <= x <= x[i+1]) = y[i] * exp(b * (x - x[i]))
  // b = ln(y[i+1] / y[i]) / (x[i+1] - x[i])
  const b = Array.from({ length: n - 1 }, (_, i) => {
    return Math.log(y[i + 1] / y[i]) / (x[i + 1] - x[i]);
  });
  // integral:
  // int_x[i]^{x[i] <= x <= x[i+1]} f(x) dx =
  // = y[i] * exp(b[i] * (x-x[i])) / b[i] |_{x[i]}^{x}
  // = y[i]/b[i] * (exp(b[i] * (x-x[i])) - 1)
  
  // in particular
  // int_x[i]^x[i+1] f(x) dx = y[i]*exp(b[i] * (x[i+1]-x[i])) / b[i] - y[i]/b[i]
  // = y[i+1]/b[i] - y[i]/b[i]
  const Fi = cumsum0(Array.from({ length: n - 1 }, (_, i) => {
    return (y[i + 1] - y[i]) / b[i];
  })); // length n

  // once we find F[i] <= z <= F[i+1]
  // we can invert F using
  // z-F[i] = F(x)-F(x[i]) = y[i]/b[i] * (exp(b[i] * (x-x[i])) - 1)
  // <=> x = ln(b[i]/y[i]*(z-F[i])+1) / b[i] + x[i]
  const Finv = (z: number) => {
    // find i
    const i = Fi.findIndex((value) => value >= z) - 1;
    if (i < 0 || i >= n - 1) {
      return undefined;
    }
    return x[i] + Math.log(b[i] / y[i] * (z - Fi[i]) + 1) / b[i];
  }

  const F = (X: number) => {
    // find i
    const i = x.findIndex((value) => value >= X) - 1;
    if (i < 0 || i >= n - 1) {
      return undefined;
    }
    return Fi[i] + y[i] / b[i] * (Math.exp(b[i] * (X - x[i])) - 1);
  }

  return { Finv, F};
}

export function birthPercentileFunction(data: Row[], maxYear: number): ((p: number) => number | undefined) {
  // remove NaN
  const cleanData = data.filter(row => !isNaN(row.crudeBirthRate)).sort((a, b) => a.year - b.year);
  if (cleanData.length === 0) {
    throw new Error("No valid data");
  }
  const years = cleanData.map(row => row.year);
  const population = cleanData.map(row => row.population);
  const birthRates = cleanData.map(row => row.crudeBirthRate);

  const births = Array.from({ length: population.length }, (_, i) => {
    return population[i] * birthRates[i];
  });
  const {F, Finv} = integralOfExponentialFit(years, births);
  const Fmax = F(maxYear);
  if (Fmax === undefined) {
    throw new Error("Fmax is undefined");
  }

  return (p: number) => {
    if (p < 0 || p > 1) return undefined;
    return Finv(0 + p * Fmax);
  };
}