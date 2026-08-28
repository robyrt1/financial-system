export type GoalStatus = "IN_PROGRESS" | "COMPLETED" | "REDEEMED";

export interface GoalProps {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category?: string;
  icon?: string;
  color?: string;
  status?: GoalStatus;
  encryptedDetails?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Goal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string | null;
  icon: string | null;
  color: string | null;
  status: GoalStatus;
  encryptedDetails: any | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: GoalProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.name = props.name;
    this.targetAmount = Number(props.targetAmount);
    this.currentAmount = Number(props.currentAmount) || 0;
    this.deadline = props.deadline;
    this.category = props.category || null;
    this.icon = props.icon || null;
    this.color = props.color || null;
    this.status = props.status || "IN_PROGRESS";
    this.encryptedDetails = props.encryptedDetails || null;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  deposit(amount: number) {
    if (this.status === "REDEEMED") {
      throw new Error("Não é possível depositar em uma meta já resgatada.");
    }

    this.currentAmount += amount;

    if (
      this.currentAmount >= this.targetAmount &&
      (this.status as string) !== "REDEEMED"
    ) {
      this.status = "COMPLETED";
    }
    this.updatedAt = new Date();
  }

  redeem() {
    if (this.status === "REDEEMED") {
      throw new Error("Esta meta já foi resgatada.");
    }
    this.status = "REDEEMED";
    this.updatedAt = new Date();
  }

  updateDetails(props: {
    name?: string;
    targetAmount?: number;
    deadline?: string;
    icon?: string;
    color?: string;
    category?: string;
  }) {
    if (props.name) this.name = props.name;
    if (props.targetAmount !== undefined) {
      this.targetAmount = props.targetAmount;
      if (
        this.currentAmount >= this.targetAmount &&
        this.status === "IN_PROGRESS"
      ) {
        this.status = "COMPLETED";
      } else if (
        this.currentAmount < this.targetAmount &&
        this.status === "COMPLETED"
      ) {
        this.status = "IN_PROGRESS";
      }
    }
    if (props.deadline) this.deadline = props.deadline;
    if (props.icon) this.icon = props.icon;
    if (props.color) this.color = props.color;
    if (props.category) this.category = props.category;

    this.updatedAt = new Date();
  }
}
