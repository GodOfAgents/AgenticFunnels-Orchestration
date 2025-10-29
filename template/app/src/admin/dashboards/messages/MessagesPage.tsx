// TODO: Add messages page
import type { AuthUser } from '@src/lib/auth';
import DefaultLayout from "../../layout/DefaultLayout";

function AdminMessages({ user }: { user: AuthUser }) {
  return (
    <DefaultLayout user={user}>
      <div>This page is under construction 🚧</div>
    </DefaultLayout>
  );
}

export default AdminMessages;
