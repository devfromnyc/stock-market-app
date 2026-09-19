import Header from "@/components/Header";
import { getServerSession } from "@/lib/better-auth/auth";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getServerSession();

  const user = session?.user
    ? {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      }
    : null;

  return (
    <main className="min-h-screen text-gray-400">
      <Header user={user} />

      <div className="container py-10">{children}</div>
    </main>
  );
};
export default Layout;
