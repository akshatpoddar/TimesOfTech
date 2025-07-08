export type ItemType = 'story' | 'comment' ;

export interface Item {
  id: number;
  deleted?: boolean;
  type: ItemType;
  by?: string;
  time: number;
  text?: string;
  dead?: boolean;
  parent?: number;
  poll?: number;
  kids?: number[];
  url?: string;
  score?: number;
  title?: string;
  parts?: number[];
  descendants?: number;
}

export interface Story extends Item {
  type: 'story';
  title: string;
  by: string;
  score: number;
  time: number;
  descendants?: number;
  url?: string;
  text?: string;
  kids?: number[];
}

export interface Comment extends Item {
  type: 'comment';
  parent: number;
  text?: string;
  by?: string;
  kids?: number[];
  time: number;
} 