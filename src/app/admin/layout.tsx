export default function AdminLayout({
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
