"use client";
import { useState, useEffect } from "react";
import { X, ArrowRight, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface TutorialStep {
  title: string;
  description: string;
  target?: string;
  action?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: "Welcome to FirstClick! 🎉",
    description: "Let's take a quick tour to help you get started. This will only take 2 minutes.",
  },
  {
    title: "Create Your First Project",
    description: "Click the '+' button to start a project. You'll choose your platform and check out tailored setup instructions.",
    target: "create-project-btn",
    action: "Go to Create Project"
  },
  {
    title: "Get Your Tracking Snippet",
    description: "After creating a project, you'll receive a tracking snippet. Install it on your website to start collecting click data instantly.",
  },
  {
    title: "View Your Dashboard",
    description: "Once your snippet is installed, give your dashboard a moment to populate with data. Here, you'll see your total clicks and growth trends.",
    target: "dashboard-link",
  },
  {
    title: "Create Flex Cards",
    description: "Show off your growth! , You'll find a flex button once clicks start appearing on your project. Download and share your very own Flex Card on social media to showcase your success!. You might get a chance to be featured on a Firstclick's Twitter posts if you share it and @FirstClick_co ",
    target: "flex-card",
  },
  {
    title: "Climb the Leaderboard",
    description: "Get more clicks than yesterday to increase your growth percentage and climb the trending page. Compete globally!",
    target: "trending-link",
  },
];

export function OnboardingTutorial() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  async function checkOnboardingStatus() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setIsLoading(false);
      return;
    }

    // Check localStorage first as a quick check
    const localStorageKey = `onboarding_completed_${user.id}`;
    const localCompleted = localStorage.getItem(localStorageKey);
    
    if (localCompleted === 'true') {
      setHasCompletedOnboarding(true);
      setIsLoading(false);
      return;
    }

    // Try to check database (optional)
    try {
      const { data: settings } = await supabase
        .from('user_settings')
        .select('has_completed_onboarding')
        .eq('user_id', user.id)
        .maybeSingle();

      // If settings exist and onboarding is completed, don't show tutorial
      if (settings?.has_completed_onboarding === true) {
        setHasCompletedOnboarding(true);
        localStorage.setItem(localStorageKey, 'true');
      } else {
        // Show tutorial for new users or users who haven't completed it
        setHasCompletedOnboarding(false);
        setIsOpen(true);
      }
    } catch (err) {
      // If database check fails, just show tutorial to new users
      setHasCompletedOnboarding(false);
      setIsOpen(true);
    }
    
    setIsLoading(false);
  }

  async function completeOnboarding() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    // Save to localStorage first (always works)
    const localStorageKey = `onboarding_completed_${user.id}`;
    localStorage.setItem(localStorageKey, 'true');

    // Try to save to database (optional, gracefully handle errors)
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({ 
          user_id: user.id, 
          has_completed_onboarding: true,
          equipped_design_id: 'classic'
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.warn('Could not save onboarding status to database:', error.message);
        // Continue anyway - localStorage is enough
      }
    } catch (err) {
      console.warn('Database save failed, using localStorage only');
    }

    setHasCompletedOnboarding(true);
    setIsOpen(false);
  }

  function handleNext() {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  }

  function handleSkip() {
    completeOnboarding();
  }

  function handlePrevious() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }

  // Don't render anything while loading or if completed
  if (isLoading || !isOpen || hasCompletedOnboarding) return null;

  const step = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />

      {/* Tutorial Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg mx-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 p-6 relative">
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-white font-bold">{currentStep + 1}</span>
              </div>
              <div className="text-white/80 text-sm">
                Step {currentStep + 1} of {tutorialSteps.length}
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white">{step.title}</h2>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-lg text-neutral-300 mb-6">{step.description}</p>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex gap-1">
                {tutorialSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`flex-1 h-1.5 rounded-full transition-colors ${
                      index <= currentStep
                        ? 'bg-indigo-500'
                        : 'bg-neutral-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {currentStep > 0 && (
                <button
                  onClick={handlePrevious}
                  className="px-6 py-3 rounded-xl bg-neutral-800 text-white font-semibold hover:bg-neutral-700 transition-colors"
                >
                  Previous
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/50 transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isLastStep ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Get Started</span>
                  </>
                ) : (
                  <>
                    <span>Next</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            {/* Skip Button */}
            <button
              onClick={handleSkip}
              className="w-full mt-3 text-neutral-400 hover:text-white transition text-sm"
            >
              Skip Tutorial
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
