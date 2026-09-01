export interface ReelComment {
  id: string;
  reelId: string;
  uid: string;
  userName: string;
  userAvatar?: string;
  text: string;
  createdAt: number;
}

export interface ReelProductTag {
  productId: string;
  name: string;
  price: number;
  imageUrl?: string;
  actionUrl?: string;
}

export interface Reel {
  id: string;
  videoUrl: string;
  videoPath?: string;
  creator: string;
  creatorAvatar?: string;
  caption: string;
  likesCount: number;
  commentsCount: number;
  taggedProduct?: ReelProductTag;
  createdAt: number;
}
