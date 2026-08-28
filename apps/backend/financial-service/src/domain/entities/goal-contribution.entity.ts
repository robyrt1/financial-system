export interface GoalContributionProps {
  id: string;
  goalId: string;
  userId: string;
  sourceAccountId: string;
  amount: number;
  date: string;
  createdAt?: Date;
}

export class GoalContribution {
  id: string;
  goalId: string;
  userId: string;
  sourceAccountId: string;
  amount: number;
  date: string;
  createdAt: Date;

  constructor(props: GoalContributionProps) {
    this.id = props.id;
    this.goalId = props.goalId;
    this.userId = props.userId;
    this.sourceAccountId = props.sourceAccountId;
    this.amount = Number(props.amount);
    this.date = props.date;
    this.createdAt = props.createdAt || new Date();
  }
}
