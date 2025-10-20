import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import College from '../models/College'

dotenv.config()

async function run() {
  const fileArgIdx = process.argv.indexOf('--file')
  const file = fileArgIdx > -1 ? process.argv[fileArgIdx + 1] : ''
  if (!file) {
    console.error('Usage: ts-node src/scripts/importColleges.ts --file data/colleges.csv')
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
      location: `${r.city}, ${r.state}`,
      city: r.city,
      state: r.state,
      type: (r.type || '').toLowerCase(),
      accreditation: r.accreditation || undefined,
      ranking: r.ranking ? Number(r.ranking) : undefined,
      courses: (r.courses || '').split('|').filter(Boolean),
      streams: (r.streams || '').split('|').filter(Boolean),
      cutoffs: {},
      fees: {
        tuition: Number(r.tuition || 0),
        hostel: r.hostel ? Number(r.hostel) : undefined,
        other: r.other ? Number(r.other) : undefined,
      },
      facilities: (r.facilities || '').split('|').filter(Boolean),
      website: r.website,
      contactInfo: { address: r.address || `${r.city}, ${r.state}` },
      admissionProcess: r.admissionProcess || undefined,
      scholarships: (r.scholarships || '').split('|').filter(Boolean),
      placements: {
        averageCTC: r.avg_ctc ? Number(r.avg_ctc) : undefined,
        topCTC: r.top_ctc ? Number(r.top_ctc) : undefined,
        recruiters: (r.recruiters || '').split('|').filter(Boolean),
        placementPercentage: r.placement_pct ? Number(r.placement_pct) : undefined,
      },
    }
    await College.updateOne({ name: doc.name, state: doc.state }, { $set: doc }, { upsert: true })
  }

  await mongoose.disconnect()
  console.log(`Imported/updated ${rows.length} colleges`)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})


