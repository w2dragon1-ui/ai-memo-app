'use server'

import crypto from 'crypto'
import { GoogleGenAI } from '@google/genai'
import { supabase } from '@/lib/supabase/server'

const SYSTEM_PROMPT = `당신은 메모 요약 전문가입니다. 사용자의 메모를 읽고 핵심 내용을 간결하게 요약합니다.`

const buildUserPrompt = (title: string, content: string) =>
  `다음 메모를 한국어로 3줄 이내로 요약해줘.
중요한 할 일, 날짜, 결정 사항이 있으면 우선 포함해줘.
마크다운 불릿 형식을 사용해도 좋지만 과하게 꾸미지 마.

제목: ${title}

내용:
${content}`

function buildContentHash(title: string, content: string): string {
  return crypto.createHash('sha256').update(`${title}\n${content}`).digest('hex')
}

export async function summarizeMemoAction(memoId: string): Promise<string> {
  const { data: memo, error: memoError } = await supabase
    .from('memos')
    .select('title, content')
    .eq('id', memoId)
    .single()

  if (memoError || !memo) {
    throw new Error('메모를 찾을 수 없습니다.')
  }

  const { title, content } = memo as { title: string; content: string }

  if (!content.trim()) {
    throw new Error('요약할 내용이 없습니다.')
  }

  const contentHash = buildContentHash(title, content)

  const { data: cached } = await supabase
    .from('memo_summaries')
    .select('summary, content_hash')
    .eq('memo_id', memoId)
    .single()

  if (cached && cached.content_hash === contentHash) {
    return cached.summary as string
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('Gemini API 키가 설정되지 않았습니다.')
  }

  const ai = new GoogleGenAI({ apiKey })
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite',
    contents: buildUserPrompt(title, content),
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.4,
      maxOutputTokens: 512,
    },
  })

  const summary = response.text
  if (!summary) {
    throw new Error('요약 결과를 받지 못했습니다.')
  }

  const now = new Date().toISOString()

  await supabase.from('memo_summaries').upsert(
    {
      memo_id: memoId,
      summary,
      content_hash: contentHash,
      updated_at: now,
    },
    { onConflict: 'memo_id' }
  )

  return summary
}
