# Data Expansion Research Notes

## Retail Take-Back Programs Identified

### Best Buy (Electronics Recycling)
- **Coverage**: All 1,056+ US stores including Puerto Rico
- **Accepts**: Computers, cell phones, TVs, appliances, batteries, cables, ink cartridges
- **Data Source**: Best Buy Stores API (requires API key signup)
- **API Endpoint**: `https://api.bestbuy.com/v1/stores?format=json&apiKey=YOUR_KEY`
- **Attributes Available**: storeId, name, address, city, state, postalCode, lat, lng, phone, hours, services

### Staples (Electronics & Office Recycling)
- **Coverage**: All US stores
- **Accepts**: Tech, ink & toner, batteries, office electronics
- **Data Source**: Need to scrape store locator or find dataset
- **URL**: https://www.staples.com/stores/recycling

### Home Depot (Electronics Recycling Programs)
- **Coverage**: Varies by state
- **Accepts**: Batteries, CFLs, rechargeable batteries
- **Data Source**: State-specific programs
- **URL**: https://www.homedepot.com/c/electronics_recycling_programs

### Other Potential Retailers
- Micro Center (25 stores) - electronics recycling
- Lowe's - battery recycling
- Target - electronics trade-in
- Walmart - electronics recycling (limited)

## Municipal Recycling Data Sources

### EPA Excess Food Opportunities Map
- Composting facilities
- Anaerobic digesters
- Food banks accepting food waste

### State-Level Data
- NY State Electronic Waste Collection Sites (PDF available)
- California CalRecycle database
- State environmental agency databases

## Next Steps
1. Sign up for Best Buy API key and fetch all store locations
2. Create standardized format for retail take-back locations
3. Research Staples store locator for data extraction
4. Add municipal recycling centers from state databases
