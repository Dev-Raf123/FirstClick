"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Check } from "lucide-react";

interface Platform {
  id: string;
  name: string;
  icon: string;
  category: string;
  docs: {
    title: string;
    steps: string[];
    codeSnippet?: string;
    notes?: string[];
  };
}

const platforms: Platform[] = [
  { 
    id: 'shopify', 
    name: 'Shopify', 
    icon: '🛍️', 
    category: 'E-commerce',
    docs: {
      title: 'Installing FirstClick on Shopify',
      steps: [
        'Log in to your Shopify admin dashboard',
        'Go to Online Store → Themes',
        'Click "Actions" → "Edit code" on your active theme',
        'Find and open theme.liquid file',
        'Paste the FirstClick snippet before the closing </head> tag',
        'Click "Save" to publish changes'
      ],
      notes: [
        'The snippet will automatically track all page visits across your store',
        'Works with all Shopify themes and doesn\'t affect page speed'
      ]
    }
  },
  { 
    id: 'woocommerce', 
    name: 'WooCommerce', 
    icon: '🛒', 
    category: 'E-commerce',
    docs: {
      title: 'Installing FirstClick on WooCommerce',
      steps: [
        'Log in to your WordPress admin panel',
        'Go to Appearance → Theme File Editor',
        'Select your active theme and open header.php',
        'Paste the FirstClick snippet before </head> tag',
        'Alternatively, use a plugin like "Insert Headers and Footers"',
        'Paste snippet in the "Scripts in Header" section'
      ],
      notes: [
        'Using a plugin is recommended to prevent losing changes during theme updates',
        'Compatible with all WooCommerce versions'
      ]
    }
  },
  { 
    id: 'bigcommerce', 
    name: 'BigCommerce', 
    icon: '🏪', 
    category: 'E-commerce',
    docs: {
      title: 'Installing FirstClick on BigCommerce',
      steps: [
        'Log in to your BigCommerce control panel',
        'Go to Storefront → Script Manager',
        'Click "Create a Script"',
        'Name: "FirstClick Tracking"',
        'Placement: "Head"',
        'Location: "All pages"',
        'Script type: "Script"',
        'Paste the FirstClick snippet and save'
      ],
      notes: [
        'Script Manager is available on Plus, Pro, and Enterprise plans',
        'For Starter plans, contact support to add custom scripts'
      ]
    }
  },
  { 
    id: 'vercel', 
    name: 'Vercel', 
    icon: '▲', 
    category: 'Hosting',
    docs: {
      title: 'Installing FirstClick on Vercel',
      steps: [
        'For Next.js: Add snippet to _document.js or _app.js in <Head> component',
        'For static sites: Add to your index.html in the <head> section',
        'Commit and push changes to your Git repository',
        'Vercel will automatically redeploy your site',
        'Verify tracking is working by visiting your site'
      ],
      codeSnippet: `// _document.js (Next.js)\nimport { Html, Head, Main, NextScript } from 'next/document'\n\nexport default function Document() {\n  return (\n    <Html>\n      <Head>\n        {/* FirstClick Snippet */}\n        <script dangerouslySetInnerHTML={{ __html: \`YOUR_SNIPPET_HERE\` }} />\n      </Head>\n      <body>\n        <Main />\n        <NextScript />\n      </body>\n    </Html>\n  )\n}`,
      notes: [
        'Changes deploy automatically on git push',
        'Test in preview deployments before merging to production'
      ]
    }
  },
  { 
    id: 'netlify', 
    name: 'Netlify', 
    icon: '🌐', 
    category: 'Hosting',
    docs: {
      title: 'Installing FirstClick on Netlify',
      steps: [
        'Add snippet to your index.html file in the <head> section',
        'Alternatively, use Netlify Snippet Injection:',
        'Go to Site settings → Build & deploy → Post processing',
        'Click "Snippet injection"',
        'Add a new snippet, choose "Insert before </head>"',
        'Paste your FirstClick snippet and save',
        'Trigger a new deploy to apply changes'
      ],
      notes: [
        'Snippet injection works without modifying your source code',
        'Perfect for sites built with static site generators'
      ]
    }
  },
  { 
    id: 'aws', 
    name: 'AWS', 
    icon: '☁️', 
    category: 'Cloud',
    docs: {
      title: 'Installing FirstClick on AWS',
      steps: [
        'For S3 static hosting: Add snippet to your index.html <head>',
        'For CloudFront: Use Lambda@Edge to inject the script',
        'For Amplify: Add to public/index.html before deploying',
        'For Elastic Beanstalk: Add to your application\'s HTML templates',
        'Deploy your updated application',
        'Clear CloudFront cache if using CDN'
      ],
      notes: [
        'Implementation varies based on AWS service used',
        'Consider using CloudFront for better performance'
      ]
    }
  },
  { 
    id: 'cloudflare', 
    name: 'Cloudflare Pages', 
    icon: '🔶', 
    category: 'Hosting',
    docs: {
      title: 'Installing FirstClick on Cloudflare Pages',
      steps: [
        'Add snippet to your index.html in the <head> section',
        'Commit changes to your connected Git repository',
        'Cloudflare Pages will auto-deploy your changes',
        'Alternatively, use Cloudflare Workers to inject the script',
        'Verify tracking in your Cloudflare Pages dashboard'
      ],
      notes: [
        'Supports automatic deployments from GitHub/GitLab',
        'Changes are live globally within seconds'
      ]
    }
  },
  { 
    id: 'github-pages', 
    name: 'GitHub Pages', 
    icon: '🐙', 
    category: 'Hosting',
    docs: {
      title: 'Installing FirstClick on GitHub Pages',
      steps: [
        'Clone your GitHub Pages repository locally',
        'Open index.html (or _layouts/default.html for Jekyll)',
        'Add FirstClick snippet before the </head> tag',
        'Commit and push to your repository',
        'GitHub will automatically rebuild and deploy',
        'Wait 1-2 minutes for changes to go live'
      ],
      notes: [
        'For Jekyll sites, add to _layouts/default.html',
        'Changes may take a few minutes to propagate'
      ]
    }
  },
  { 
    id: 'nextjs', 
    name: 'Next.js', 
    icon: '⚡', 
    category: 'Framework',
    docs: {
      title: 'Installing FirstClick in Next.js',
      steps: [
        'Open pages/_document.js (create if it doesn\'t exist)',
        'Import Head from next/document',
        'Add FirstClick snippet using dangerouslySetInnerHTML',
        'For App Router: Add to app/layout.tsx in <head>',
        'Restart your development server',
        'Deploy to production'
      ],
      codeSnippet: `// pages/_document.js (Pages Router)\nimport { Html, Head, Main, NextScript } from 'next/document'\n\nexport default function Document() {\n  return (\n    <Html>\n      <Head>\n        <script dangerouslySetInnerHTML={{\n          __html: \`YOUR_FIRSTCLICK_SNIPPET\`\n        }} />\n      </Head>\n      <body>\n        <Main />\n        <NextScript />\n      </body>\n    </Html>\n  )\n}\n\n// app/layout.tsx (App Router)\nexport default function RootLayout({ children }) {\n  return (\n    <html>\n      <head>\n        <script dangerouslySetInnerHTML={{\n          __html: \`YOUR_FIRSTCLICK_SNIPPET\`\n        }} />\n      </head>\n      <body>{children}</body>\n    </html>\n  )\n}`,
      notes: [
        'Works with both Pages Router and App Router',
        'Script loads on all pages automatically'
      ]
    }
  },
  { 
    id: 'react', 
    name: 'React', 
    icon: '⚛️', 
    category: 'Framework',
    docs: {
      title: 'Installing FirstClick in React',
      steps: [
        'For Create React App: Open public/index.html',
        'Add FirstClick snippet in the <head> section',
        'For Vite: Add to index.html in the root directory',
        'Alternatively, use react-helmet for dynamic injection',
        'Rebuild your application',
        'Deploy updated build to your hosting provider'
      ],
      codeSnippet: `<!-- public/index.html -->\n<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="utf-8" />\n    <!-- FirstClick Tracking -->\n    <script>\n      YOUR_FIRSTCLICK_SNIPPET\n    </script>\n  </head>\n  <body>\n    <div id="root"></div>\n  </body>\n</html>`,
      notes: [
        'No need to modify React components',
        'Works with Create React App, Vite, and other React setups'
      ]
    }
  },
  { 
    id: 'vue', 
    name: 'Vue.js', 
    icon: '💚', 
    category: 'Framework',
    docs: {
      title: 'Installing FirstClick in Vue.js',
      steps: [
        'For Vue CLI: Open public/index.html',
        'For Nuxt: Open app.html or use a plugin',
        'Add FirstClick snippet in the <head> section',
        'For Nuxt 3: Create a plugin in plugins/firstclick.client.js',
        'Rebuild and deploy your application'
      ],
      codeSnippet: `<!-- public/index.html (Vue CLI) -->\n<!DOCTYPE html>\n<html>\n  <head>\n    <script>\n      YOUR_FIRSTCLICK_SNIPPET\n    </script>\n  </head>\n  <body>\n    <div id="app"></div>\n  </body>\n</html>\n\n// plugins/firstclick.client.js (Nuxt 3)\nexport default defineNuxtPlugin(() => {\n  if (process.client) {\n    // FirstClick snippet here\n  }\n})`,
      notes: [
        'For Nuxt, use .client suffix to ensure client-side only execution',
        'Compatible with Vue 2 and Vue 3'
      ]
    }
  },
  { 
    id: 'angular', 
    name: 'Angular', 
    icon: '🅰️', 
    category: 'Framework',
    docs: {
      title: 'Installing FirstClick in Angular',
      steps: [
        'Open src/index.html',
        'Add FirstClick snippet in the <head> section before </head>',
        'Alternatively, add to angular.json scripts array',
        'Run ng build for production',
        'Deploy your dist folder'
      ],
      codeSnippet: `<!-- src/index.html -->\n<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="utf-8">\n    <title>Your App</title>\n    <base href="/">\n    \n    <!-- FirstClick Tracking -->\n    <script>\n      YOUR_FIRSTCLICK_SNIPPET\n    </script>\n  </head>\n  <body>\n    <app-root></app-root>\n  </body>\n</html>`,
      notes: [
        'Script loads before Angular bootstraps',
        'Works with all Angular versions (2+)'
      ]
    }
  },
  { 
    id: 'wordpress', 
    name: 'WordPress', 
    icon: '📝', 
    category: 'CMS',
    docs: {
      title: 'Installing FirstClick on WordPress',
      steps: [
        'Method 1 - Using Plugin (Recommended):',
        'Install "Insert Headers and Footers" plugin',
        'Go to Settings → Insert Headers and Footers',
        'Paste snippet in "Scripts in Header" box',
        'Method 2 - Manual:',
        'Go to Appearance → Theme File Editor',
        'Edit header.php and paste before </head>',
        'Click "Update File"'
      ],
      notes: [
        'Plugin method is safer and survives theme updates',
        'Works with all WordPress themes including block themes'
      ]
    }
  },
  { 
    id: 'webflow', 
    name: 'Webflow', 
    icon: '🌊', 
    category: 'No-Code',
    docs: {
      title: 'Installing FirstClick on Webflow',
      steps: [
        'Open your Webflow project',
        'Go to Project Settings (gear icon)',
        'Click on "Custom Code" tab',
        'Paste FirstClick snippet in "Head Code" section',
        'Click "Save Changes"',
        'Publish your site to make changes live'
      ],
      notes: [
        'Custom code is available on paid Webflow plans',
        'Script applies to all pages automatically'
      ]
    }
  },
  { 
    id: 'squarespace', 
    name: 'Squarespace', 
    icon: '⬛', 
    category: 'Website Builder',
    docs: {
      title: 'Installing FirstClick on Squarespace',
      steps: [
        'Log in to your Squarespace account',
        'Go to Settings → Advanced → Code Injection',
        'Paste FirstClick snippet in the "Header" section',
        'Click "Save"',
        'Changes are live immediately'
      ],
      notes: [
        'Code Injection is available on Business plans and higher',
        'For Personal plans, upgrade to access custom code'
      ]
    }
  },
  { 
    id: 'wix', 
    name: 'Wix', 
    icon: '✨', 
    category: 'Website Builder',
    docs: {
      title: 'Installing FirstClick on Wix',
      steps: [
        'Open your Wix site editor',
        'Click "Settings" in the left sidebar',
        'Go to "Custom Code" under Advanced',
        'Click "Add Custom Code"',
        'Paste FirstClick snippet',
        'Set "Place Code in: Head"',
        'Choose "Load code on: All pages"',
        'Click "Apply" and publish your site'
      ],
      notes: [
        'Custom code requires a Premium plan',
        'Changes apply after publishing your site'
      ]
    }
  },
  { 
    id: 'html', 
    name: 'HTML/CSS/JS', 
    icon: '🌐', 
    category: 'Custom',
    docs: {
      title: 'Installing FirstClick in Static HTML',
      steps: [
        'Open your HTML file in a text editor',
        'Locate the <head> section',
        'Paste FirstClick snippet before the closing </head> tag',
        'Save the file',
        'Upload to your web server',
        'Repeat for all HTML pages on your site'
      ],
      codeSnippet: `<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Your Website</title>\n    \n    <!-- FirstClick Tracking -->\n    <script>\n      YOUR_FIRSTCLICK_SNIPPET\n    </script>\n  </head>\n  <body>\n    <!-- Your content -->\n  </body>\n</html>`,
      notes: [
        'Add to every HTML page you want to track',
        'Consider creating a template to avoid repetition'
      ]
    }
  },
  { 
    id: 'other', 
    name: 'Other', 
    icon: '🔧', 
    category: 'Custom',
    docs: {
      title: 'Installing FirstClick on Other Platforms',
      steps: [
        'Identify where your platform allows custom HTML/JavaScript',
        'Common locations: Header injection, Custom code sections, Theme editor',
        'Paste FirstClick snippet in the <head> section',
        'Ensure it loads on all pages you want to track',
        'Save and publish your changes',
        'Test by visiting your site and checking FirstClick dashboard'
      ],
      notes: [
        'Most platforms support custom code injection',
        'Contact your platform\'s support if you need help finding the right place',
        'The snippet is lightweight and won\'t affect page speed'
      ]
    }
  },
];

export default function CreateProject() {
  const [step, setStep] = useState<'platform' | 'details' | 'docs' | 'success'>('platform');
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Not logged in");
      setLoading(false);
      return;
    }
    // Create project row with platform
    const { data: project, error } = await supabase
      .from("projects")
      .insert([{ name, url, description, user_id: user.id, platform: selectedPlatform }])
      .select()
      .single();
    if (error || !project) {
      console.error("Database error:", error);
      alert(`Failed to create project: ${error?.message || 'Unknown error'}`);
      setLoading(false);
      return;
    }
    setLoading(false);
    setProjectId(project.id);
    setStep('success');
  }

  // Group platforms by category
  const groupedPlatforms = platforms.reduce((acc, platform) => {
    if (!acc[platform.category]) acc[platform.category] = [];
    acc[platform.category].push(platform);
    return acc;
  }, {} as Record<string, Platform[]>);

  if (step === 'platform') {
    return (
      <main className="min-h-screen bg-neutral-950 p-6">
        <div className="max-w-5xl mx-auto pb-32">
          <div className="mb-8">
            <h2 className="text-3xl text-white font-bold mb-2">What platform do you use?</h2>
            <p className="text-neutral-400">Select the platform where you'll deploy FirstClick tracking</p>
          </div>

          <div className="space-y-8">
            {Object.entries(groupedPlatforms).map(([category, platformList]) => (
              <div key={category}>
                <h3 className="text-lg font-semibold text-indigo-400 mb-4">{category}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {platformList.map((platform) => (
                    <button
                      key={platform.id}
                      onClick={() => setSelectedPlatform(platform.id)}
                      className={`relative p-6 rounded-xl border-2 transition-all duration-200 ${
                        selectedPlatform === platform.id
                          ? 'border-indigo-500 bg-gradient-to-br from-indigo-600/20 to-indigo-700/20 shadow-lg shadow-indigo-500/30'
                          : 'border-neutral-700 bg-neutral-900 hover:border-neutral-600 hover:bg-neutral-800'
                      }`}
                    >
                      {selectedPlatform === platform.id && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className="text-4xl mb-3">{platform.icon}</div>
                      <div className="text-white font-semibold text-sm">{platform.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-neutral-950 via-neutral-950/95 to-transparent backdrop-blur-sm z-30">
            <div className="max-w-5xl mx-auto flex gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 rounded-xl bg-neutral-800 text-white font-semibold hover:bg-neutral-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep('docs')}
                disabled={!selectedPlatform}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  selectedPlatform
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white hover:shadow-lg hover:shadow-indigo-500/50'
                    : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                }`}
              >
                View Installation Guide
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Documentation step
  if (step === 'docs' && selectedPlatform) {
    const platform = platforms.find(p => p.id === selectedPlatform)!;
    
    return (
      <main className="min-h-screen bg-neutral-950 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setStep('platform')}
            className="text-indigo-400 hover:text-indigo-300 mb-6 flex items-center gap-2"
          >
            ← Back to Platform Selection
          </button>

          <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl border border-indigo-500/30 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-b border-indigo-500/30 p-6">
              <div className="flex items-center gap-4 mb-2">
                <span className="text-5xl">{platform.icon}</span>
                <div>
                  <h2 className="text-3xl font-bold text-white">{platform.docs.title}</h2>
                  <p className="text-indigo-300 mt-1">Step-by-step integration guide</p>
                </div>
              </div>
            </div>

            {/* Installation Steps */}
            <div className="p-8">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-2xl">📋</span> Installation Steps
              </h3>
              <ol className="space-y-4">
                {platform.docs.steps.map((step, index) => (
                  <li key={index} className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </span>
                    <p className="text-neutral-200 pt-1">{step}</p>
                  </li>
                ))}
              </ol>

              {/* Code Snippet */}
              {platform.docs.codeSnippet && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-2xl">💻</span> Code Example
                  </h3>
                  <pre className="bg-neutral-950 border border-neutral-700 rounded-xl p-6 overflow-x-auto">
                    <code className="text-sm text-emerald-400">{platform.docs.codeSnippet}</code>
                  </pre>
                </div>
              )}

              {/* Notes */}
              {platform.docs.notes && platform.docs.notes.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-2xl">💡</span> Important Notes
                  </h3>
                  <ul className="space-y-3">
                    {platform.docs.notes.map((note, index) => (
                      <li key={index} className="flex gap-3 text-neutral-300">
                        <span className="text-amber-400 flex-shrink-0">•</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={() => setStep('platform')}
              className="px-6 py-3 rounded-xl bg-neutral-800 text-white font-semibold hover:bg-neutral-700 transition-colors"
            >
              Choose Different Platform
            </button>
            <button
              onClick={() => setStep('details')}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/50 transition-all duration-200"
            >
              Continue to Project Details →
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Success step
  if (step === 'success' && projectId) {
    const snippet = `<script src="https://firstclick.com/track.js" data-project-id="${projectId}"></script>`;
    
    return (
      <main className="min-h-screen bg-neutral-950 p-6 flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl text-white font-bold mb-4">Project Created Successfully!</h2>
            <p className="text-xl text-neutral-400 mb-8">
              Paste your snippet and give your project a couple of hours to accumulate the clicks
            </p>
          </div>

          <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-lg">Your Tracking Snippet</h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(snippet);
                  alert('Snippet copied to clipboard!');
                }}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
              >
                Copy Code
              </button>
            </div>
            <pre className="bg-neutral-950 p-4 rounded-xl text-left overflow-x-auto">
              <code className="text-emerald-400 text-sm">{snippet}</code>
            </pre>
          </div>

          <div className="space-y-4 mb-8 text-left bg-neutral-900 p-6 rounded-2xl border border-neutral-800">
            <h3 className="text-white font-semibold text-lg mb-4">Next Steps:</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <p className="text-neutral-300">Paste the snippet in your {platforms.find(p => p.id === selectedPlatform)?.name} site following the installation guide</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <p className="text-neutral-300">Wait 2-3 hours for data to start flowing in</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                <p className="text-neutral-300">Check your dashboard to see real-time analytics and user flows</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setStep('docs')}
              className="px-6 py-3 rounded-xl bg-neutral-800 text-white font-semibold hover:bg-neutral-700 transition-colors"
            >
              View Installation Guide
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/50 transition-all duration-200"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Details step
  return (
    <main className="min-h-screen bg-neutral-950 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => setStep('platform')}
            className="text-indigo-400 hover:text-indigo-300 mb-4 flex items-center gap-2"
          >
            ← Back to Platform Selection
          </button>
          <h2 className="text-3xl text-white font-bold mb-2">Project Details</h2>
          <p className="text-neutral-400">
            Platform: <span className="text-indigo-400 font-semibold">
              {platforms.find(p => p.id === selectedPlatform)?.name}
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-neutral-900 p-8 rounded-2xl border border-neutral-800">
          <div>
            <label className="block text-white font-semibold mb-2">Project Name</label>
            <input
              type="text"
              placeholder="My Awesome Project"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full p-3 rounded-xl bg-neutral-800 text-white border border-neutral-700 focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">Landing Page URL</label>
            <input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={e => setUrl(e.target.value)}
              required
              className="w-full p-3 rounded-xl bg-neutral-800 text-white border border-neutral-700 focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">Description (Optional)</label>
            <textarea
              placeholder="Tell us about your project..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              className="w-full p-3 rounded-xl bg-neutral-800 text-white border border-neutral-700 focus:border-indigo-500 focus:outline-none transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-bold text-lg transition-all duration-200 ${
              loading
                ? 'bg-neutral-700 text-neutral-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white hover:shadow-lg hover:shadow-indigo-500/50 hover:scale-[1.02]'
            }`}
          >
            {loading ? "Creating Your Project..." : "Create Project"}
          </button>
        </form>
      </div>
    </main>
  );
}