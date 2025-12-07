"use client";

import { useRef, useState } from "react";

export function SnippetBox({ projectId }: { projectId: string }) {
  const fullSnippet = `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js"></script>
<script>
  window.addEventListener('DOMContentLoaded', function () {
    const SUPABASE_URL = 'https://ckhoremindgjrtmjoanw.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNraG9yZW1pbmRnanJ0bWpvYW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5MzY1NDksImV4cCI6MjA2NjUxMjU0OX0.aDJaxW_C3CfyU9nBu0JG5NaHIymO0c0GVsDywXNOqfE';
    const PROJECT_ID = '${projectId}';
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    const payload = {
      url: window.location.pathname,
      project_id: PROJECT_ID,
      user_agent: navigator.userAgent,
      referrer: document.referrer
    };

    supabaseClient.from('page_visits').insert([payload])
      .then(response => {
        // Success
      })
      .catch(error => {
        // Error
      });
  });
</script>`;


  const preview = fullSnippet
    .split('\n')
    .slice(0, 4)
    .join('\n') + "\n...";

  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      // Fallback for HTTP or unsupported browsers
      if (textareaRef.current) {
        textareaRef.current.value = fullSnippet;
        textareaRef.current.select();
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      } else {
        setCopied(false);
        alert("Copy failed. Please make sure you're running on HTTPS or localhost.");
        console.error("Clipboard copy failed:", err);
      }
    }
  };

  return (
    <div className="mt-2 relative">
      <div className="text-xs text-neutral-400 mb-1 flex items-center justify-between">
        <span>Tracking Snippet:</span>
        <button
          type="button"
          className="ml-2 px-2 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-500 transition-colors"
          onClick={handleCopy}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <div className="rounded bg-neutral-800 p-2 overflow-x-auto mb-2" style={{ maxWidth: "100%" }}>
        <pre className="text-white text-xs break-all whitespace-pre-wrap min-w-0">{preview}</pre>
      </div>
      {/* Hidden textarea for fallback */}
      <textarea
        ref={textareaRef}
        style={{ position: "absolute", left: "-9999px", top: 0 }}
        readOnly
        aria-hidden="true"
      />
      {/* Heatmap snippet removed */}
    </div>
  );
}

