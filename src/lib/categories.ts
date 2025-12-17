import cats from '../data/categories.json' assert { type: 'json' };

export type CategoryNode = { slug: string; name: string; parent?: string };
export const categories: CategoryNode[] = cats;
export const topLevel = categories.filter(c => !c.parent);
export const childrenOf = (parentSlug: string) => categories.filter(c => c.parent === parentSlug);
