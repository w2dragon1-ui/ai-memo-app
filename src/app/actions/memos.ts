'use server'

import { revalidatePath } from 'next/cache'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '@/lib/supabase/server'
import { Memo, MemoFormData } from '@/types/memo'

type DbMemo = {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  created_at: string
  updated_at: string
}

function mapToMemo(row: DbMemo): Memo {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    category: row.category,
    tags: row.tags ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getMemosAction(): Promise<Memo[]> {
  const { data, error } = await supabase
    .from('memos')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('메모 조회 오류:', error)
    return []
  }

  return (data as DbMemo[]).map(mapToMemo)
}

export async function createMemoAction(formData: MemoFormData): Promise<Memo> {
  const now = new Date().toISOString()
  const newMemo = {
    id: uuidv4(),
    title: formData.title,
    content: formData.content,
    category: formData.category,
    tags: formData.tags,
    created_at: now,
    updated_at: now,
  }

  const { data, error } = await supabase
    .from('memos')
    .insert(newMemo)
    .select()
    .single()

  if (error || !data) {
    console.error('메모 생성 오류:', error)
    throw new Error('메모를 생성하지 못했습니다.')
  }

  revalidatePath('/')
  return mapToMemo(data as DbMemo)
}

export async function updateMemoAction(
  id: string,
  formData: MemoFormData
): Promise<Memo> {
  const { data, error } = await supabase
    .from('memos')
    .update({
      title: formData.title,
      content: formData.content,
      category: formData.category,
      tags: formData.tags,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error || !data) {
    console.error('메모 수정 오류:', error)
    throw new Error('메모를 수정하지 못했습니다.')
  }

  revalidatePath('/')
  return mapToMemo(data as DbMemo)
}

export async function deleteMemoAction(id: string): Promise<void> {
  const { error } = await supabase.from('memos').delete().eq('id', id)

  if (error) {
    console.error('메모 삭제 오류:', error)
    throw new Error('메모를 삭제하지 못했습니다.')
  }

  revalidatePath('/')
}

export async function clearMemosAction(): Promise<void> {
  const { error } = await supabase.from('memos').delete().neq('id', '')

  if (error) {
    console.error('메모 전체 삭제 오류:', error)
    throw new Error('메모를 삭제하지 못했습니다.')
  }

  revalidatePath('/')
}
