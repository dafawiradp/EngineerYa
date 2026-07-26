export class CategoryEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly parentId: string | null
  ) {}
}
