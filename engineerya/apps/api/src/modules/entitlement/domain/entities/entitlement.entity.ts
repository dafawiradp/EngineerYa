import { EntitlementSource, EntitlementType } from "@engineerya/shared-types";

export class EntitlementEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly bookId: string,
    public readonly type: EntitlementType,
    public readonly source: EntitlementSource,
    public readonly grantedAt: Date
  ) {}
}
