import { Entity } from "./entity";

export interface ReviewDto {
  userId: string;
  userName: string;
  reviewMessage: string;
  reviewValue: number;
}

export interface Review extends Entity, ReviewDto {}
