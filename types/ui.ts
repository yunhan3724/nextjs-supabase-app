export type EventStatus = 'draft' | 'published' | 'closed' | 'cancelled'

export type RsvpStatus = 'pending' | 'going' | 'not_going' | 'maybe'

export type EventRole = 'organizer' | 'participant'

export interface UiEvent {
  id: string
  title: string
  description?: string
  venueName?: string
  venueAddress?: string
  startAt: string
  endAt?: string
  maxAttendees?: number
  coverImageUrl?: string
  status: EventStatus
  createdAt: string
}

export interface UiEventParticipant {
  id: string
  eventId: string
  userId: string
  displayName: string
  avatarUrl?: string
  rsvpStatus: RsvpStatus
  guestCount: number
  role: EventRole
}

export interface UiCurrentUser {
  id: string
  displayName: string
  isOrganizer: boolean
}
