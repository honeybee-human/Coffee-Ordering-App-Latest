// Client-side type re-exports to avoid bundling mongoose in the frontend.
// These types are exported from server Mongoose schemas to keep consistency.
export type { GroupDoc as DBGroup, GroupMemberDoc as DBGroupMember } from '@server/models';