import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Scholarship from '../models/Scholarship'

dotenv.config()

async function run() {
  const fileArgIdx = process.argv.indexOf('--file')
  const file = fileArgIdx > -1 ? process.argv[fileArgIdx + 1] : ''
  if (!file) {
    console.error('Usage: ts-node src/scripts/importScholarships.ts --file data/scholarships.csv')
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
    const doc: any = {
      name: r.name,
      provider: r.provider,
      type: r.type,
      amount: { value: Number(r.amount || 0), period: r.period || 'year' },
      eligibility: {
        stream: r.stream || 'Any',
        category: r.category || 'Any',
        state: r.state || 'Any',
        maxFamilyIncome: r.max_income ? Number(r.max_income) : undefined,
      },
      applicationProcess: r.process || undefined,
      deadline: r.deadline || undefined,
      website: r.website,
    }
    await Scholarship.updateOne({ name: doc.name, provider: doc.provider }, { $set: doc }, { upsert: true })
  }

  await mongoose.disconnect()
  console.log(`Imported/updated ${rows.length} scholarships`)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})


