export default function AdminSettingsPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-serif text-3xl font-semibold">Settings</h1>
      <p className="text-sm text-gray-600">Business, email targets, defaults — maps to system_settings.</p>
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
        Admin-only settings forms.
      </div>
    </div>
  );
}
