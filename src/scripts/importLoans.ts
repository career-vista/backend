import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Loan from '../models/Loan'

dotenv.config()

async function run() {
  const fileArgIdx = process.argv.indexOf('--file')
  const file = fileArgIdx > -1 ? process.argv[fileArgIdx + 1] : ''
  if (!file) {
    console.error('Usage: ts-node src/scripts/importLoans.ts --file data/loans.csv')
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
      type: r.type || 'Education',
      interestRate: Number(r.interest_rate || 0),
      maxAmount: Number(r.max_amount || 0),
      tenure: r.tenure ? Number(r.tenure) : undefined,
      processingFee: r.processing_fee ? Number(r.processing_fee) : undefined,
      collateralRequired: (r.collateral || '').toLowerCase() === 'yes',
      eligibility: { stream: r.stream || 'Any' },
      repaymentTerms: r.terms || undefined,
      website: r.website,
    }
    await Loan.updateOne({ name: doc.name, provider: doc.provider }, { $set: doc }, { upsert: true })
  }

  await mongoose.disconnect()
  console.log(`Imported/updated ${rows.length} loans`)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})


