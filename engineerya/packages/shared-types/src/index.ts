// Types shared between apps/web and apps/api so the frontend and backend
// can never silently drift apart on API contracts.

export enum UserRole {
  USER = "USER",
  EDITOR = "EDITOR",
  ADMIN = "ADMIN",
}

export enum EntitlementType {
  READ = "READ",
  DOWNLOAD = "DOWNLOAD",
}

export enum EntitlementSource {
  PURCHASE = "PURCHASE",
  MEMBERSHIP = "MEMBERSHIP",
  PROMO = "PROMO",
}

export enum PurchaseStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  EXPIRED = "EXPIRED",
}

export enum BookStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
}

export interface UserDto {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
}

export interface BookSummaryDto {
  id: string;
  title: string;
  slug: string;
  coverUrl: string;
  discipline: string;
  categoryId: string;
  priceCents: number;
  status: BookStatus;
}

export interface BookDetailDto extends BookSummaryDto {
  description: string;
  authorNames: string[];
  pageCount: number;
  publishedAt: string | null;
  // fileKey is intentionally NEVER part of this type — it must not
  // be representable on the wire, not just filtered out at runtime.
}

export interface ReaderManifestDto {
  bookId: string;
  pageCount: number;
  tableOfContents: { title: string; page: number }[];
}

export interface PaginatedDto<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface EntitlementDto {
  bookId: string;
  type: EntitlementType;
  source: EntitlementSource;
  grantedAt: string;
}

export interface PurchaseDto {
  id: string;
  bookId: string;
  priceCents: number;
  status: PurchaseStatus;
  createdAt: string;
}

export interface CreatePurchaseResponseDto {
  purchaseId: string;
  snapToken: string;
  redirectUrl: string;
}

export interface SubscribeMembershipResponseDto {
  membershipId: string;
  snapToken: string;
  redirectUrl: string;
}

export interface MembershipDto {
  id: string;
  plan: string;
  status: string;
  startsAt: string;
  expiresAt: string;
}
