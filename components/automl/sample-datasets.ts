import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { Dataset, ColumnProfile, ColumnType } from './types'

// Generator for Customer Churn Dataset
function generateChurnDataset(): Dataset {
  const contracts = ['Month-to-month', 'One year', 'Two year']
  const internet = ['Fiber optic', 'DSL', 'No']
  const techSupport = ['No', 'Yes', 'No internet service']

  const rows: Record<string, any>[] = []
  const seedRandom = (seed: number) => {
    let s = seed
    return () => {
      s = (s * 9301 + 49297) % 233280
      return s / 233280
    }
  }

  const rand = seedRandom(42)

  for (let i = 1; i <= 200; i++) {
    const age = Math.floor(19 + rand() * 58)
    const tenure = Math.floor(1 + rand() * 71)
    const contract = tenure < 12 ? (rand() > 0.3 ? 'Month-to-month' : 'One year') : (rand() > 0.4 ? 'Two year' : 'One year')
    const net = rand() > 0.2 ? (rand() > 0.4 ? 'Fiber optic' : 'DSL') : 'No'
    const support = net === 'No' ? 'No internet service' : (rand() > 0.6 ? 'Yes' : 'No')
    const tickets = Math.floor(rand() * 5)
    const monthly = Number((20 + (net === 'Fiber optic' ? 45 : net === 'DSL' ? 25 : 0) + (support === 'Yes' ? 12 : 0) + rand() * 20).toFixed(2))
    const total = Number((monthly * tenure + rand() * 50).toFixed(2))

    // Higher churn probability if month-to-month, high monthly charges, high tickets
    const churnScore = (contract === 'Month-to-month' ? 0.4 : 0.05) +
      (tickets > 2 ? 0.3 : 0) +
      (monthly > 80 ? 0.15 : 0) +
      (tenure < 6 ? 0.2 : -0.1)

    const churned = rand() < Math.max(0.05, Math.min(0.9, churnScore)) ? 'Yes' : 'No'

    rows.push({
      CustomerID: `CUST-${1000 + i}`,
      Age: age,
      TenureMonths: tenure,
      ContractType: contract,
      InternetService: net,
      TechSupport: support,
      MonthlyCharges: monthly,
      TotalCharges: total,
      SupportTickets: tickets,
      Churned: churned,
    })
  }

  return {
    id: 'customer-churn',
    name: 'Telecom Customer Churn',
    description: 'Predict customer attrition based on tenure, billing, contract type, and service usage.',
    filename: 'telecom_customer_churn.csv',
    rowCount: rows.length,
    columnCount: Object.keys(rows[0]).length,
    columns: profileColumns(rows),
    rows,
    source: 'sample',
  }
}

// Generator for California Housing Dataset
function generateHousingDataset(): Dataset {
  const rows: Record<string, any>[] = []
  const seedRandom = (seed: number) => {
    let s = seed
    return () => {
      s = (s * 9301 + 49297) % 233280
      return s / 233280
    }
  }

  const rand = seedRandom(101)

  for (let i = 1; i <= 200; i++) {
    const medInc = Number((1.5 + rand() * 11.5).toFixed(2))
    const houseAge = Math.floor(2 + rand() * 50)
    const aveRooms = Number((3.2 + rand() * 5.0).toFixed(2))
    const aveBedrooms = Number((0.9 + rand() * 1.5).toFixed(2))
    const population = Math.floor(200 + rand() * 3500)
    const aveOccupancy = Number((2.0 + rand() * 3.5).toFixed(2))
    const latitude = Number((32.5 + rand() * 9.5).toFixed(2))
    const longitude = Number((-124.3 + rand() * 10.0).toFixed(2))

    // Median house value driven primarily by Median Income and location
    const value = Math.max(50000, Math.min(500000, Math.floor(medInc * 45000 + aveRooms * 8000 - houseAge * 500 + 40000 + (rand() - 0.5) * 35000)))

    rows.push({
      MedInc: medInc,
      HouseAge: houseAge,
      AveRooms: aveRooms,
      AveBedrms: aveBedrooms,
      Population: population,
      AveOccup: aveOccupancy,
      Latitude: latitude,
      Longitude: longitude,
      MedianHouseValue: value,
    })
  }

  return {
    id: 'california-housing',
    name: 'California Housing Prices',
    description: 'Predict median home values in California districts using income, room counts, and demographic metrics.',
    filename: 'california_housing_census.csv',
    rowCount: rows.length,
    columnCount: Object.keys(rows[0]).length,
    columns: profileColumns(rows),
    rows,
    source: 'sample',
  }
}

// Generator for Cardiovascular Disease Risk Dataset
function generateHeartDiseaseDataset(): Dataset {
  const genders = ['Male', 'Female']
  const rows: Record<string, any>[] = []
  const seedRandom = (seed: number) => {
    let s = seed
    return () => {
      s = (s * 9301 + 49297) % 233280
      return s / 233280
    }
  }

  const rand = seedRandom(77)

  for (let i = 1; i <= 200; i++) {
    const age = Math.floor(32 + rand() * 45)
    const gender = rand() > 0.45 ? 'Male' : 'Female'
    const restingBP = Math.floor(95 + rand() * 85)
    const cholesterol = Math.floor(130 + rand() * 210)
    const fastingBS = rand() > 0.8 ? 'True' : 'False'
    const maxHR = Math.floor(85 + rand() * 115)
    const exerciseAngina = rand() > 0.65 ? 'Yes' : 'No'
    const stDepression = Number((rand() * 4.2).toFixed(1))

    const riskScore = (age > 55 ? 0.25 : 0.05) +
      (restingBP > 140 ? 0.2 : 0) +
      (cholesterol > 240 ? 0.2 : 0) +
      (exerciseAngina === 'Yes' ? 0.25 : 0) +
      (stDepression > 1.5 ? 0.3 : 0) -
      (maxHR > 160 ? 0.2 : 0)

    const heartRisk = rand() < Math.max(0.08, Math.min(0.92, riskScore)) ? 'High Risk' : 'Low Risk'

    rows.push({
      Age: age,
      Gender: gender,
      RestingBP: restingBP,
      Cholesterol: cholesterol,
      FastingBS: fastingBS,
      MaxHR: maxHR,
      ExerciseAngina: exerciseAngina,
      STDepression: stDepression,
      HeartRisk: heartRisk,
    })
  }

  return {
    id: 'heart-disease',
    name: 'Cardiovascular Risk Profile',
    description: 'Classify patient clinical risk factors for heart disease utilizing physiological and stress test metrics.',
    filename: 'cardiac_clinical_metrics.csv',
    rowCount: rows.length,
    columnCount: Object.keys(rows[0]).length,
    columns: profileColumns(rows),
    rows,
    source: 'sample',
  }
}

// Automated Column Profiling Engine
export function profileColumns(rows: Record<string, any>[]): ColumnProfile[] {
  if (!rows || rows.length === 0) return []

  const columnNames = Object.keys(rows[0])
  const rowCount = rows.length

  return columnNames.map((colName) => {
    let missingCount = 0
    const values: any[] = []
    const frequencies: Record<string, number> = {}

    rows.forEach((r) => {
      const v = r[colName]
      if (v === null || v === undefined || v === '') {
        missingCount++
      } else {
        values.push(v)
        const strVal = String(v)
        frequencies[strVal] = (frequencies[strVal] || 0) + 1
      }
    })

    const missingPercentage = Number(((missingCount / rowCount) * 100).toFixed(1))
    const uniqueCount = Object.keys(frequencies).length

    // Detect Column Type
    let detectedType: ColumnType = 'categorical'

    const nonNullValues = values.slice(0, 50)
    const isAllNumeric = nonNullValues.length > 0 && nonNullValues.every((v) => !isNaN(Number(v)) && typeof v !== 'boolean')
    const isAllBoolean = nonNullValues.length > 0 && nonNullValues.every((v) => v === true || v === false || v === 'true' || v === 'false' || v === 'True' || v === 'False')

    if (isAllBoolean || (uniqueCount === 2 && (Object.keys(frequencies).includes('Yes') || Object.keys(frequencies).includes('No')))) {
      detectedType = 'boolean'
    } else if (isAllNumeric) {
      detectedType = 'numeric'
    } else if (colName.toLowerCase().includes('date') || colName.toLowerCase().includes('time')) {
      detectedType = 'datetime'
    } else if (uniqueCount > rowCount * 0.8 && rowCount > 50) {
      detectedType = 'text'
    }

    // Top Category
    let topCategory: string | undefined
    let topCategoryFrequency: number | undefined
    let maxFreq = 0
    for (const [k, count] of Object.entries(frequencies)) {
      if (count > maxFreq) {
        maxFreq = count
        topCategory = k
        topCategoryFrequency = count
      }
    }

    // Compute Numeric Statistics if Numeric
    let min: number | undefined
    let max: number | undefined
    let mean: number | undefined
    let median: number | undefined
    let stdDev: number | undefined

    if (detectedType === 'numeric') {
      const numericVals = values.map((v) => Number(v)).filter((v) => !isNaN(v)).sort((a, b) => a - b)
      if (numericVals.length > 0) {
        min = numericVals[0]
        max = numericVals[numericVals.length - 1]
        const sum = numericVals.reduce((acc, curr) => acc + curr, 0)
        mean = Number((sum / numericVals.length).toFixed(2))

        const mid = Math.floor(numericVals.length / 2)
        median = numericVals.length % 2 !== 0 ? numericVals[mid] : Number(((numericVals[mid - 1] + numericVals[mid]) / 2).toFixed(2))

        const variance = numericVals.reduce((acc, curr) => acc + Math.pow(curr - mean, 2), 0) / numericVals.length
        stdDev = Number(Math.sqrt(variance).toFixed(2))
      }
    }

    return {
      name: colName,
      type: detectedType,
      missingCount,
      missingPercentage,
      uniqueCount,
      min,
      max,
      mean,
      median,
      stdDev,
      topCategory,
      topCategoryFrequency,
      sampleValues: values.slice(0, 5),
    }
  })
}

// Built-in Sample Datasets Map
export const SAMPLE_DATASETS: Dataset[] = [
  generateChurnDataset(),
  generateHousingDataset(),
  generateHeartDiseaseDataset(),
]

// Parser for User-Uploaded CSV / XLSX Files
export async function parseUploadedFile(file: File): Promise<Dataset> {
  const extension = file.name.split('.').pop()?.toLowerCase()

  if (extension === 'csv' || extension === 'txt' || extension === 'tsv') {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          const rows = results.data as Record<string, any>[]
          if (!rows || rows.length === 0) {
            reject(new Error('CSV file appears to be empty or has invalid formatting.'))
            return
          }
          const columns = profileColumns(rows)
          resolve({
            id: `upload-${Date.now()}`,
            name: file.name.replace(/\.[^/.]+$/, ''),
            description: `Custom dataset uploaded by user containing ${rows.length} rows and ${columns.length} columns.`,
            filename: file.name,
            rowCount: rows.length,
            columnCount: columns.length,
            columns,
            rows,
            source: 'uploaded',
          })
        },
        error: (err) => reject(err),
      })
    })
  } else if (extension === 'xlsx' || extension === 'xls') {
    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json(worksheet) as Record<string, any>[]

    if (!rows || rows.length === 0) {
      throw new Error('Spreadsheet appears to be empty or has invalid formatting.')
    }

    const columns = profileColumns(rows)
    return {
      id: `upload-${Date.now()}`,
      name: file.name.replace(/\.[^/.]+$/, ''),
      description: `Excel spreadsheet (${sheetName}) uploaded with ${rows.length} rows and ${columns.length} columns.`,
      filename: file.name,
      rowCount: rows.length,
      columnCount: columns.length,
      columns,
      rows,
      source: 'uploaded',
    }
  } else {
    throw new Error(`Unsupported file format .${extension}. Please upload .csv, .xlsx, or .xls files.`)
  }
}
