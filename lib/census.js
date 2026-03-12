// Pulls real demographic + income data from US Census Bureau API
// by ZIP code to enrich Noema's underwriting context

export async function getCensusData(zip) {
  if (!zip || zip.length !== 5) return null

  try {
    const apiKey = process.env.CENSUS_API_KEY
    
    // American Community Survey 5-Year Estimates
    // Variables: median household income, poverty rate, unemployment rate
    const variables = [
      'B19013_001E', // Median household income
      'B17001_002E', // People below poverty level
      'B17001_001E', // Total population for poverty calc
      'B23025_005E', // Unemployed civilians
      'B23025_002E', // Total labor force
      'B15003_022E', // Bachelor's degree holders
      'B15003_001E', // Total population 25+ for education calc
    ].join(',')

    const url = `https://api.census.gov/data/2022/acs/acs5?get=${variables}&for=zip%20code%20tabulation%20area:${zip}&key=${apiKey}`

    const res = await fetch(url)
    if (!res.ok) return null

    const data = await res.json()
    if (!data || data.length < 2) return null

    const [headers, values] = data

    const medianIncome = parseInt(values[0]) || null
    const povertyCount = parseInt(values[1]) || 0
    const povertyTotal = parseInt(values[2]) || 1
    const unemployedCount = parseInt(values[3]) || 0
    const laborForce = parseInt(values[4]) || 1
    const bachelorsCount = parseInt(values[5]) || 0
    const educationTotal = parseInt(values[6]) || 1

    return {
      zip,
      medianHouseholdIncome: medianIncome,
      povertyRate: ((povertyCount / povertyTotal) * 100).toFixed(1),
      unemploymentRate: ((unemployedCount / laborForce) * 100).toFixed(1),
      bachelorsDegreeRate: ((bachelorsCount / educationTotal) * 100).toFixed(1),
      // Context string passed to AI model
      context: `ZIP ${zip} Census Data: Median household income $${medianIncome?.toLocaleString() || 'N/A'}, ` +
        `Poverty rate ${((povertyCount / povertyTotal) * 100).toFixed(1)}%, ` +
        `Unemployment rate ${((unemployedCount / laborForce) * 100).toFixed(1)}%, ` +
        `Bachelor's degree rate ${((bachelorsCount / educationTotal) * 100).toFixed(1)}%`
    }
  } catch (err) {
    console.error('Census API error:', err)
    return null
  }
}
