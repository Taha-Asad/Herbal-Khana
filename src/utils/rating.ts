export function getStars(rating: number) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return [
    ...Array(full).fill("full"),
    ...(half ? ["half"] : []),
    ...Array(empty).fill("empty"),
  ];
}
