import { DataSources } from "@/components/data-sources";

export default function DataSourcesPage() {
    return (
        <div className="max-w-2xl mx-auto">
             <div className="space-y-4 mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Data Sources</h1>
                <p className="text-muted-foreground">Connect your data to build your score. You are always in control of what you share.</p>
            </div>
            <DataSources />
        </div>
    )
}
