import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyIcon, X, Plus, Trash2 } from "lucide-react";

interface LessonFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    initialData?: any;
    moduleId: string;
}

export default function LessonFormModal({ isOpen, onClose, onSubmit, initialData, moduleId }: LessonFormModalProps) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [videoUrl, setVideoUrl] = useState("");
    const [duration, setDuration] = useState("");
    const [resources, setResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title || "");
            setContent(initialData.content || "");
            setVideoUrl(initialData.videoUrl || "");
            setDuration(initialData.duration?.toString() || "");

            // Parse resources if it's a string, or use as is if it's already an array
            if (initialData.resources) {
                try {
                    setResources(typeof initialData.resources === 'string' ? JSON.parse(initialData.resources) : initialData.resources);
                } catch (e) {
                    setResources([]);
                }
            } else {
                setResources([]);
            }
        } else {
            setTitle("");
            setContent("");
            setVideoUrl("");
            setDuration("");
            setResources([]);
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit({
                title,
                content,
                videoUrl,
                duration: parseInt(duration) || 0,
                resources,
                moduleId
            });
            onClose();
        } catch (error) {
            console.error("Failed to submit lesson", error);
            alert("Failed to save lesson.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        {initialData ? "Edit Lesson" : "Add New Lesson"}
                    </h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lesson Title</label>
                        <Input
                            required
                            placeholder="e.g. Introduction to Next.js"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Video URL (Embed)
                        </label>
                        <p className="text-xs text-gray-500 mb-2">Provide a YouTube or Vimeo embed URL if available.</p>
                        <Input
                            placeholder="https://www.youtube.com/embed/..."
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                            className="bg-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Duration (minutes)
                        </label>
                        <Input
                            type="number"
                            min="0"
                            placeholder="e.g. 15"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="bg-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Content (Markdown)
                        </label>
                        <textarea
                            rows={8}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-y"
                            placeholder="Write your lesson content here using Markdown formatting..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>

                    {/* Premium Resources Section */}
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900">Premium Resources</h3>
                                <p className="text-xs text-gray-500">File download atau link yang hanya bisa diakses oleh Subscriber.</p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setResources([...resources, { title: "", url: "" }])}
                                className="h-8 text-xs bg-white"
                            >
                                <Plus className="w-3 h-3 mr-1" /> Add Link
                            </Button>
                        </div>

                        {resources.length === 0 ? (
                            <div className="text-center py-4 bg-white border border-dashed border-gray-300 rounded-lg text-xs text-gray-400">
                                Belum ada resource premium untuk materi ini.
                            </div>
                        ) : (
                            <div className="space-y-3 mt-2">
                                {resources.map((res, index) => (
                                    <div key={index} className="flex items-start gap-2 bg-white p-2 border rounded-md">
                                        <div className="flex-1 space-y-2">
                                            <Input
                                                placeholder="Nama File/Link (e.g. Source Code Starter)"
                                                value={res.title}
                                                onChange={(e) => {
                                                    const newRes = [...resources];
                                                    newRes[index].title = e.target.value;
                                                    setResources(newRes);
                                                }}
                                                className="h-8 text-xs"
                                            />
                                            <Input
                                                placeholder="URL (e.g. https://drive.google.com/...)"
                                                value={res.url}
                                                onChange={(e) => {
                                                    const newRes = [...resources];
                                                    newRes[index].url = e.target.value;
                                                    setResources(newRes);
                                                }}
                                                className="h-8 text-xs"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                                            onClick={() => {
                                                const newRes = [...resources];
                                                newRes.splice(index, 1);
                                                setResources(newRes);
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                            {loading ? "Saving..." : "Save Lesson"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
