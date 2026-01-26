export class User {
  constructor(
    public readonly id: number,
    public readonly email: string,
    public password: string,
    public name: string,
    public readonly createdAt: Date,
  ) {}

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      createdAt: this.createdAt,
    };
  }

  toPublicJSON() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      createdAt: this.createdAt,
    };
  }
}
