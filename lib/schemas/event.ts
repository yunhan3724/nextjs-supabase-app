import { z } from 'zod'

export const eventFormSchema = z.object({
  title: z.string().min(1, '제목은 필수입니다'),
  description: z.string().optional(),
  venueName: z.string().optional(),
  venueAddress: z.string().optional(),
  startAt: z.string().min(1, '시작 일시는 필수입니다'),
  endAt: z.string().optional(),
  maxAttendees: z.number().int().positive('최대 인원은 1 이상이어야 합니다').optional(),
  coverImageUrl: z.string().url('올바른 URL 형식이 아닙니다').optional().or(z.literal('')),
  status: z.enum(['draft', 'published', 'closed', 'cancelled']),
})

export type EventFormValues = z.infer<typeof eventFormSchema>
