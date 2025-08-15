import { Users } from "lucide-react";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="text-primaryColor" size={32} />
        <div>
          <h1 className="text-3xl font-bold text-textDark">User Management</h1>
          <p className="text-textLight">Manage user accounts and permissions</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <p className="text-textLight">User management content goes here...</p>
      </div>
    </div>
  );
}
