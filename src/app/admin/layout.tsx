export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="">
      <header></header>
      <main>{children}</main>
    </div>
  );
}
