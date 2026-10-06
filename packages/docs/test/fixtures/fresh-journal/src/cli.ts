import { appendEvent, readEvents, summarize } from './index'
const args = Bun.argv.slice(2).filter(value => value !== '--')
const path = process.env.RELAYLOG_PATH || '.data/events.jsonl'
try {
  if (args[0] === 'add' && args[1]) {
    console.log(JSON.stringify(await appendEvent(path, args[1], args[2] ? JSON.parse(args[2]) : {})))
  } else if (args[0] === 'list') {
    const events = await readEvents(path)
    for (const event of events.filter(event => !args[1] || event.type === args[1])) console.log(JSON.stringify(event))
  } else if (args[0] === 'summary') {
    console.log(JSON.stringify(summarize(await readEvents(path)), null, 2))
  } else {
    console.error('Usage: journal add <type> [json] | list [type] | summary')
    process.exitCode = 1
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
}
