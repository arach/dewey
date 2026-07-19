import { describe, expect, test } from 'bun:test'
import {
  docsDesignCritic,
  docsReviewAgent,
  installMdGenerator,
  promptSlideoutGenerator,
} from '../src/index'

describe('public skills dogfood contract', () => {
  test('exports self-contained prompts with actionable purpose and success instructions', () => {
    const skills = [
      docsDesignCritic,
      docsReviewAgent,
      installMdGenerator,
      promptSlideoutGenerator,
    ]

    for (const skill of skills) {
      expect(skill.purpose.length).toBeGreaterThan(40)
      const promptText = Object.values(skill)
        .filter(value => typeof value === 'string')
        .join('\n')
      expect(promptText.length).toBeGreaterThan(200)
      expect(promptText).toMatch(/Instructions|Generate|Review|Critique|DONE WHEN/i)
    }
  })
})
