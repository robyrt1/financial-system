export class Subcategory {
  public readonly id: string;
  public readonly categoryId: string;
  public readonly userId: string | null;
  public readonly name: string;
  public readonly createdAt: Date;

  constructor(props: {
    id: string;
    categoryId: string;
    userId: string | null;
    name: string;
    createdAt?: Date;
  }) {
    this.id = props.id;
    this.categoryId = props.categoryId;
    this.userId = props.userId;
    this.name = props.name;
    this.createdAt = props.createdAt || new Date();
  }
}
