import { IngestHeader } from "@/components/ingest/ingest-header"
import { IngestUpload } from "@/components/ingest/ingest-upload"
import { IngestHistory } from "@/components/ingest/ingest-history"

export default function IngestPage() {
  return (
    <div className="space-y-6">
      <IngestHeader />
      <div className="grid gap-6 md:grid-cols-2">
        <IngestUpload />
        <IngestHistory />
      </div>
    </div>
  )
}
