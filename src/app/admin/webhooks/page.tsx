"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function WebhooksPage() {
    const [webhooks, setWebhooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPayload, setSelectedPayload] = useState<any>(null);

    useEffect(() => {
        fetchWebhooks();
    }, []);

    const fetchWebhooks = async () => {
        try {
            const res = await fetch("/api/admin/webhooks");
            if (res.ok) {
                const data = await res.json();
                setWebhooks(data);
            } else {
                console.error("Failed to fetch webhooks");
            }
        } catch (error) {
            console.error("Failed to fetch webhooks", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Webhook Logs</h1>
                    <p className="text-gray-500 mt-1">Review system integration events from Mayar API (Latest 100).</p>
                </div>
            </div>

            <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 border-b">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Event Type</th>
                                <th className="px-6 py-4 font-semibold">HTTP Status</th>
                                <th className="px-6 py-4 font-semibold">Transaction Ref</th>
                                <th className="px-6 py-4 font-semibold">Time Received</th>
                                <th className="px-6 py-4 font-semibold text-right">Payload</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        Loading logs...
                                    </td>
                                </tr>
                            ) : webhooks.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No webhook logs recorded yet.
                                    </td>
                                </tr>
                            ) : (
                                webhooks.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {log.event}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${log.httpStatus >= 200 && log.httpStatus < 300
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                                }`}>
                                                {log.httpStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-gray-500 truncate max-w-[200px]">
                                            {log.transactionId || "N/A"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {format(new Date(log.receivedAt), "dd MMM yyyy HH:mm:ss", { locale: id })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedPayload(log.payload)}
                                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                View JSON
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payload Viewer Dialog */}
            <Dialog open={!!selectedPayload} onOpenChange={(open) => !open && setSelectedPayload(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Webhook Payload Details</DialogTitle>
                    </DialogHeader>
                    <div className="bg-gray-900 p-4 rounded-lg overflow-auto max-h-[60vh]">
                        <pre className="text-sm font-mono text-green-400">
                            {selectedPayload ? JSON.stringify(selectedPayload, null, 2) : ""}
                        </pre>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
