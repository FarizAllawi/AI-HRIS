import { Info } from "lucide-react";

export function InfoBanner() {
  return (
    <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
      <div className="flex gap-3">
        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900">
          <p className="font-semibold mb-2">About Competency Mapping</p>
          <p>
            Each requirement, responsibility, and skill you add will be assigned
            a unique ID (e.g., <code className="bg-blue-100 px-1 rounded">requirement_1</code>).
            These can then be mapped to screening questions.
          </p>
        </div>
      </div>
    </div>
  );
}
