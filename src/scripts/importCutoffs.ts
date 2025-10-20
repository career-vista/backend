import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import College from '../models/College'

dotenv.config()

// Expected CSV columns: name,state,exam,metric,value
// exam in {JEE, NEET, EAMCET}; metric example: percentile(or marks/rank)

async function run() {
  const fileArgIdx = process.argv.indexOf('--file')
  const file = fileArgIdx > -1 ? process.argv[fileArgIdx + 1] : ''
  if (!file) {
    console.error('Usage: ts-node src/scripts/importCutoffs.ts --file data/cutoffs.csv')
    process.exit(1)
  }

  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/careervista'
  await mongoose.connect(MONGODB_URI)

  const rows: any[] = []
  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(path.resolve(file))
      .pipe(parse({ columns: true, skip_empty_lines: true }))
      .on('data', (row) => rows.push(row))
      .on('end', () => resolve())
      .on('error', reject)
  })

  for (const r of rows) {
    const key = `${r.exam}_${r.metric}` // e.g., JEE_percentile, NEET_marks, EAMCET_rank
    const college = await College.findOne({ name: r.name, state: r.state })
    if (!college) continue
    const cutoffs = new Map(college.cutoffs as any)
    cutoffs.set(key, Number(r.value))
    await College.updateOne({ _id: college._id }, { $set: { cutoffs } })
  }

  await mongoose.disconnect()
  console.log(`Imported/updated ${rows.length} cutoffs`)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})


