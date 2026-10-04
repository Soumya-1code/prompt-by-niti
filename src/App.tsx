import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Star,
  Copy,
  Check,
  BookOpen,
  Code2,
  PenLine,
  Sparkles,
  Briefcase,
  ArrowUpRight,
  X,
  WandSparkles,
  Grid2X2,
  Heart,
  Sun,
  Moon,
} from "lucide-react";
import "./App.css";

type Category = "Study" | "Coding" | "Writing" | "AI" | "Career";

type Prompt = {
  id: number;
  title: string;
  description: string;
  prompt: string;
  category: Category;
  tags: string[];
  favorite: boolean;
};

const initialPrompts: Prompt[] = [
  {
    id: 1,
    title: "Explain a complex topic simply",
    description:
      "Understand difficult concepts in simple language with useful examples.",
    prompt:
      "Explain [TOPIC] as if I am a complete beginner. Use simple language, real-world analogies, and practical examples. Break the explanation into small sections and finish with a short summary and 5 key points to remember.",
    category: "Study",
    tags: ["Beginner", "Learning"],
    favorite: true,
  },
  {
    id: 2,
    title: "Debug my code",
    description:
      "Find bugs, explain why they happen, and provide a corrected solution.",
    prompt:
      "Analyze the following code carefully. Identify the bug, explain why it happens, provide the corrected version, and suggest best practices to prevent similar issues.",
    category: "Coding",
    tags: ["Debugging", "Programming"],
    favorite: true,
  },
  {
    id: 3,
    title: "Improve my writing",
    description:
      "Make your writing clearer, more professional, and engaging.",
    prompt:
      "Rewrite the following text to make it clearer, more professional, concise, and engaging while preserving my original meaning and tone.",
    category: "Writing",
    tags: ["Editing", "Professional"],
    favorite: false,
  },
  {
    id: 4,
    title: "Create a learning roadmap",
    description:
      "Build a structured learning path from beginner to advanced level.",
    prompt:
      "Create a structured learning roadmap for [SKILL]. Assume I am a beginner. Divide it into stages, explain what to learn at each stage, recommend practical projects, and provide a realistic weekly plan.",
    category: "AI",
    tags: ["Roadmap", "Learning"],
    favorite: true,
  },
  {
    id: 5,
    title: "Prepare for an interview",
    description:
      "Generate realistic interview questions with strong answer guidance.",
    prompt:
      "Act as an experienced interviewer for [ROLE]. Ask me realistic interview questions one at a time. After each answer, evaluate it, explain how I can improve, and provide an example of a strong answer.",
    category: "Career",
    tags: ["Interview", "Career"],
    favorite: false,
  },
  {
    id: 6,
    title: "Summarize study material",
    description:
      "Turn long notes into concise revision-friendly material.",
    prompt:
      "Summarize the following study material into clear revision notes. Highlight important concepts, definitions, formulas, examples, and likely exam points. Finish with 10 quick revision questions.",
    category: "Study",
    tags: ["Notes", "Revision"],
    favorite: false,
  },
];

const categoryIcons = {
  Study: BookOpen,
  Coding: Code2,
  Writing: PenLine,
  AI: Sparkles,
  Career: Briefcase,
};

function cleanTopic(text: string) {
  let topic = text.trim();

  topic = topic
    .replace(
      /^(please\s+)?(can you\s+)?(could you\s+)?/i,
      ""
    )
    .replace(
      /^(explain|tell me about|teach me|describe)\s+/i,
      ""
    )
    .replace(/[?.!]+$/, "")
    .trim();

  if (!topic) {
    return "the requested topic";
  }

  return topic.charAt(0).toUpperCase() + topic.slice(1);
}

/*
  Local Prompt Intelligence

  This creates a genuinely improved, structured prompt
  without requiring an API key or internet connection.
*/
function generateImprovedPrompt(input: string) {
  const original = input.trim();
  const topic = cleanTopic(original);
  const lower = original.toLowerCase();

  if (
    lower.includes("explain") ||
    lower.includes("learn") ||
    lower.includes("what is") ||
    lower.includes("teach")
  ) {
    return `You are an expert educator who specializes in explaining complex concepts to beginners.

TASK
Explain "${topic}" in a way that is easy to understand, memorable, and practically useful.

AUDIENCE
Assume the reader has little or no prior knowledge of the topic.

INSTRUCTIONS
1. Start with a simple one-paragraph definition.
2. Explain the core idea using plain, beginner-friendly language.
3. Use 2–3 intuitive real-world analogies.
4. Break the concept into its most important components.
5. Give practical, real-world examples.
6. Explain how the concept works step by step.
7. Mention common misconceptions or mistakes beginners make.
8. Gradually introduce important technical terminology and define each term.
9. Avoid unnecessary jargon and advanced mathematics unless it is essential.
10. Clearly distinguish closely related concepts when relevant.

OUTPUT FORMAT
Use clear headings, short paragraphs, bullet points, and examples.

Finish with:
• A simple 5-point recap
• 5 questions to test my understanding
• One practical example or mini-exercise

QUALITY REQUIREMENT
The explanation should feel like a patient expert teaching a curious beginner. Prioritize clarity, accuracy, intuition, and practical understanding over unnecessary complexity.`;
  }

  if (
    lower.includes("code") ||
    lower.includes("program") ||
    lower.includes("debug") ||
    lower.includes("function")
  ) {
    return `Act as an experienced software engineer and patient programming mentor.

TASK
Help me with the following programming request:

"${original}"

GOAL
Provide a correct, understandable, and practical solution rather than only giving code.

INSTRUCTIONS
1. First identify what the problem is asking.
2. Explain the approach before writing the solution.
3. Break the solution into logical steps.
4. Provide clean and readable code.
5. Explain the important parts of the code.
6. Mention edge cases that should be considered.
7. Analyze time and space complexity when applicable.
8. If there is a common mistake, point it out.
9. If multiple approaches exist, briefly compare them and recommend the most suitable one.

OUTPUT FORMAT
Use these sections:

1. Understanding the Problem
2. Approach
3. Code
4. Explanation
5. Edge Cases
6. Complexity
7. Common Mistakes

QUALITY REQUIREMENT
Prioritize correctness, readability, maintainability, and beginner-friendly explanations.`;
  }

  if (
    lower.includes("write") ||
    lower.includes("rewrite") ||
    lower.includes("email") ||
    lower.includes("article") ||
    lower.includes("content")
  ) {
    return `Act as an expert professional writer and editor.

TASK
Create or improve the following content request:

"${original}"

GOAL
Produce polished content that is clear, natural, engaging, and appropriate for the intended audience.

INSTRUCTIONS
1. Preserve the original meaning and objective.
2. Improve clarity and structure.
3. Remove unnecessary repetition.
4. Use natural and professional language.
5. Maintain an appropriate tone.
6. Make the opening engaging.
7. Keep the writing concise without removing important information.
8. Use headings or bullet points when they improve readability.

OUTPUT
Provide the final polished version first.

Then provide:
• Key improvements made
• Suggested alternative wording where useful

QUALITY REQUIREMENT
The result should sound human, confident, clear, and purposeful rather than robotic or overly formal.`;
  }

  if (
    lower.includes("roadmap") ||
    lower.includes("learn") ||
    lower.includes("study")
  ) {
    return `Act as an experienced mentor and curriculum designer.

TASK
Create a practical learning plan based on this request:

"${original}"

GOAL
Help a beginner progress from their current level to a strong practical understanding.

INSTRUCTIONS
1. Identify the prerequisites.
2. Divide the journey into logical stages.
3. Explain what to learn in each stage.
4. Prioritize the most important concepts.
5. Include practical exercises.
6. Include beginner-friendly projects.
7. Explain how to measure progress.
8. Mention common mistakes and what to avoid.
9. Recommend a realistic weekly schedule.
10. Clearly distinguish essential topics from optional topics.

OUTPUT FORMAT
Provide:

1. Starting Point
2. Learning Stages
3. Weekly Plan
4. Practice Tasks
5. Projects
6. Progress Checklist
7. Common Mistakes
8. Next Steps

QUALITY REQUIREMENT
Make the roadmap realistic, structured, practical, and achievable rather than overwhelming.`;
  }

  return `Act as an expert assistant specializing in clear, accurate, and useful responses.

USER REQUEST
"${original}"

OBJECTIVE
Transform this request into a high-quality task that produces a specific, useful, and actionable result.

INSTRUCTIONS
1. Understand the user's actual goal.
2. Clarify the required context.
3. Define the expected outcome.
4. Break complex requirements into logical steps.
5. Specify useful constraints.
6. Use precise and unambiguous language.
7. Include relevant examples where they improve understanding.
8. Avoid unnecessary complexity.

OUTPUT FORMAT
Structure the response with clear headings and concise explanations.

QUALITY REQUIREMENT
Prioritize accuracy, relevance, clarity, practical usefulness, and a result that directly addresses the user's goal.`;
}

function App() {
  const [prompts, setPrompts] = useState<Prompt[]>(initialPrompts);

  const [activeFilter, setActiveFilter] = useState<
    "All" | "Favorites" | Category
  >("All");

  const [search, setSearch] = useState("");
  const [selectedPrompt, setSelectedPrompt] =
    useState<Prompt | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [showImprover, setShowImprover] = useState(false);

  const [copiedId, setCopiedId] = useState<number | null>(
    null
  );

  const [copiedImproved, setCopiedImproved] =
    useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    return (
      localStorage.getItem("prompt-by-niti-theme") ===
      "dark"
    );
  });

  const [newPrompt, setNewPrompt] = useState({
    title: "",
    category: "Study" as Category,
    description: "",
    prompt: "",
    tags: "",
  });

  const [improveText, setImproveText] = useState("");
  const [improvedText, setImprovedText] = useState("");

  const categories: Category[] = [
    "Study",
    "Coding",
    "Writing",
    "AI",
    "Career",
  ];

  const toggleTheme = () => {
    setDarkMode((previous) => {
      const next = !previous;

      localStorage.setItem(
        "prompt-by-niti-theme",
        next ? "dark" : "light"
      );

      return next;
    });
  };

  const filteredPrompts = useMemo(() => {
    return prompts.filter((item) => {
      const matchesFilter =
        activeFilter === "All"
          ? true
          : activeFilter === "Favorites"
          ? item.favorite
          : item.category === activeFilter;

      const query = search.toLowerCase().trim();

      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.prompt.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.tags.some((tag) =>
          tag.toLowerCase().includes(query)
        );

      return matchesFilter && matchesSearch;
    });
  }, [prompts, activeFilter, search]);

  const favoriteCount = prompts.filter(
    (item) => item.favorite
  ).length;

  const toggleFavorite = (id: number) => {
    setPrompts((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, favorite: !item.favorite }
          : item
      )
    );

    setSelectedPrompt((current) =>
      current && current.id === id
        ? { ...current, favorite: !current.favorite }
        : current
    );
  };

  const copyPrompt = async (prompt: Prompt) => {
    try {
      await navigator.clipboard.writeText(prompt.prompt);

      setCopiedId(prompt.id);

      setTimeout(() => {
        setCopiedId(null);
      }, 1600);
    } catch {
      // Clipboard unavailable.
    }
  };

  const createPrompt = () => {
    if (
      !newPrompt.title.trim() ||
      !newPrompt.prompt.trim()
    ) {
      return;
    }

    const created: Prompt = {
      id: Date.now(),
      title: newPrompt.title.trim(),
      category: newPrompt.category,
      description:
        newPrompt.description.trim() ||
        "A useful prompt for your AI workflow.",
      prompt: newPrompt.prompt.trim(),
      tags: newPrompt.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 4),
      favorite: false,
    };

    setPrompts((current) => [created, ...current]);

    setNewPrompt({
      title: "",
      category: "Study",
      description: "",
      prompt: "",
      tags: "",
    });

    setShowCreate(false);
  };

  const improvePrompt = () => {
    if (!improveText.trim()) {
      return;
    }

    const result = generateImprovedPrompt(
      improveText
    );

    setImprovedText(result);
    setCopiedImproved(false);
  };

  const copyImprovedPrompt = async () => {
    try {
      await navigator.clipboard.writeText(
        improvedText
      );

      setCopiedImproved(true);

      setTimeout(() => {
        setCopiedImproved(false);
      }, 1600);
    } catch {
      // Clipboard unavailable.
    }
  };

  return (
    <div
      className={`app ${
        darkMode ? "dark-mode" : ""
      }`}
    >
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">
            <div className="logo-orbit" />
            <div className="logo-p">P</div>
            <div className="logo-n">N</div>
            <div className="logo-sparkle">✦</div>
            <div className="logo-dot" />
          </div>

          <div className="brand-text">
            <div className="brand-name">
              Prompt <span>by Niti</span>
            </div>

            <div className="brand-subtitle">
              PROMPT STUDIO · 01
            </div>
          </div>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-label">
            WORKSPACE
          </div>

          <button
            className={`nav-item ${
              activeFilter === "All" ? "active" : ""
            }`}
            onClick={() => setActiveFilter("All")}
          >
            <span className="nav-number">01</span>
            <Grid2X2 size={17} />
            <span>All Prompts</span>
            <small>{prompts.length}</small>
          </button>

          <button
            className={`nav-item ${
              activeFilter === "Favorites"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveFilter("Favorites")
            }
          >
            <span className="nav-number">02</span>
            <Heart size={17} />
            <span>Favorites</span>
            <small>{favoriteCount}</small>
          </button>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-label">
            COLLECTIONS
          </div>

          {categories.map((category, index) => {
            const Icon = categoryIcons[category];

            const count = prompts.filter(
              (item) => item.category === category
            ).length;

            return (
              <button
                key={category}
                className={`nav-item ${
                  activeFilter === category
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setActiveFilter(category)
                }
              >
                <span className="nav-number">
                  {String(index + 3).padStart(2, "0")}
                </span>

                <Icon size={17} />

                <span>{category}</span>

                <small>{count}</small>
              </button>
            );
          })}
        </div>

        <button
          className="theme-toggle"
          onClick={toggleTheme}
        >
          <span className="theme-icon">
            {darkMode ? (
              <Sun size={16} />
            ) : (
              <Moon size={16} />
            )}
          </span>

          <span>
            {darkMode
              ? "Light mode"
              : "Dark mode"}
          </span>

          <span className="theme-switch">
            <span className="theme-switch-knob" />
          </span>
        </button>

        <div className="sidebar-promo">
          <Sparkles size={14} />

          <div>
            <strong>Better prompts.</strong>
            <span>Better conversations.</span>
          </div>
        </div>

        <div className="sidebar-footer">
          PROMPT BY NITI / 01.0
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="top-search">
            <Search size={17} />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search prompts, tags, or collections..."
            />

            {search && (
              <button
                onClick={() => setSearch("")}
              >
                <X size={15} />
              </button>
            )}
          </div>

          <button
            className="create-top-button"
            onClick={() => setShowCreate(true)}
          >
            <Plus size={17} />
            New Prompt
          </button>
        </header>

        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              01 / PROMPT WORKSPACE
            </div>

            <h1 className="hero-title">
              Your prompts,
              <br />
              <em>organized.</em>
            </h1>

            <p className="hero-description">
              Save the prompts that work. Improve the
              ones that don’t. Reuse them whenever you
              need.
            </p>

            <div className="hero-actions">
              <button
                className="primary-button"
                onClick={() =>
                  setShowCreate(true)
                }
              >
                <Plus size={18} />
                Create Prompt
              </button>

              <button
                className="secondary-button"
                onClick={() =>
                  setShowImprover(true)
                }
              >
                <WandSparkles size={17} />
                Improve a Prompt
              </button>
            </div>
          </div>

          <div className="hero-art">
            <div className="magic-shape shape-one" />
            <div className="magic-shape shape-two" />
            <div className="magic-shape shape-three" />
            <div className="magic-shape shape-four" />

            <div className="idea-note">
              <div className="idea-text">
                Ideas today,
                <br />
                better results
                <br />
                <span>tomorrow.</span>
              </div>

              <div className="idea-line">
                <span />
                <span />
                <span />
              </div>
            </div>

            <div className="sparkle sparkle-one">
              ✦
            </div>

            <div className="sparkle sparkle-two">
              ✦
            </div>

            <div className="sparkle sparkle-three">
              ✧
            </div>

            <div className="saved-card">
              <strong>
                {String(prompts.length).padStart(
                  2,
                  "0"
                )}
              </strong>

              <span>SAVED PROMPTS</span>

              <div />

              <p>
                A small library of useful
                instructions.
              </p>
            </div>
          </div>
        </section>

        <section className="collections-section">
          <div className="section-heading">
            <div>
              <div className="eyebrow">
                02 / COLLECTIONS
              </div>

              <h2>
                Explore your library.
              </h2>
            </div>

            <button
              onClick={() =>
                setActiveFilter("All")
              }
            >
              View all
              <ArrowUpRight size={15} />
            </button>
          </div>

          <div className="collections-grid">
            {categories.map((category) => {
              const Icon =
                categoryIcons[category];

              const count = prompts.filter(
                (item) =>
                  item.category === category
              ).length;

              return (
                <button
                  key={category}
                  className={`collection-card collection-${category.toLowerCase()}`}
                  onClick={() =>
                    setActiveFilter(category)
                  }
                >
                  <div className="collection-icon">
                    <Icon size={20} />
                  </div>

                  <div className="collection-bottom">
                    <div>
                      <h3>{category}</h3>
                      <span>
                        {count} prompts
                      </span>
                    </div>

                    <ArrowUpRight size={18} />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="library-section">
          <div className="section-heading library-heading">
            <div>
              <div className="eyebrow">
                03 / PROMPT LIBRARY
              </div>

              <h2>
                {activeFilter === "All"
                  ? "Your prompt library."
                  : activeFilter ===
                    "Favorites"
                  ? "Your favorites."
                  : `${activeFilter} prompts.`}
              </h2>
            </div>

            <span className="result-count">
              {filteredPrompts.length} prompts
            </span>
          </div>

          {filteredPrompts.length > 0 ? (
            <div className="prompt-grid">
              {filteredPrompts.map(
                (prompt, index) => {
                  const Icon =
                    categoryIcons[
                      prompt.category
                    ];

                  return (
                    <article
                      className="prompt-card"
                      key={prompt.id}
                      onClick={() =>
                        setSelectedPrompt(
                          prompt
                        )
                      }
                      style={{
                        animationDelay: `${
                          index * 70
                        }ms`,
                      }}
                    >
                      <div className="prompt-card-top">
                        <div className="category-badge">
                          <Icon size={13} />
                          {prompt.category}
                        </div>

                        <button
                          className={`favorite-button ${
                            prompt.favorite
                              ? "favorite-active"
                              : ""
                          }`}
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleFavorite(
                              prompt.id
                            );
                          }}
                        >
                          <Star
                            size={19}
                            fill={
                              prompt.favorite
                                ? "currentColor"
                                : "none"
                            }
                          />
                        </button>
                      </div>

                      <h3>{prompt.title}</h3>

                      <p>
                        {prompt.description}
                      </p>

                      <div className="tag-row">
                        {prompt.tags.map(
                          (tag) => (
                            <span key={tag}>
                              {tag}
                            </span>
                          )
                        )}
                      </div>

                      <div className="prompt-card-bottom">
                        <span>
                          READY TO USE
                        </span>

                        <button
                          className="copy-button"
                          onClick={(event) => {
                            event.stopPropagation();
                            copyPrompt(
                              prompt
                            );
                          }}
                        >
                          {copiedId ===
                          prompt.id ? (
                            <>
                              <Check size={16} />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy size={16} />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          ) : (
            <div className="empty-state">
              <Search size={28} />
              <h3>
                No prompts found
              </h3>
              <p>
                Try another search or create a
                new prompt.
              </p>
            </div>
          )}
        </section>

        <section className="improver-banner">
          <div className="improver-icon">
            <WandSparkles size={24} />
          </div>

          <div className="improver-copy">
            <div className="eyebrow">
              04 / PROMPT IMPROVER
            </div>

            <h2>
              Make your prompts{" "}
              <em>better.</em>
            </h2>

            <p>
              Clearer instructions. Better context.
              More useful AI responses.
            </p>
          </div>

          <button
            className="improve-button"
            onClick={() =>
              setShowImprover(true)
            }
          >
            Improve a prompt
            <ArrowUpRight size={17} />
          </button>
        </section>

        <footer className="page-footer">
          <span>PROMPT BY NITI</span>
          <span>SAVE / IMPROVE / REUSE</span>
          <span>2026</span>
        </footer>
      </main>

      {selectedPrompt && (
        <div
          className="modal-backdrop"
          onClick={() =>
            setSelectedPrompt(null)
          }
        >
          <div
            className="detail-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              className="modal-close"
              onClick={() =>
                setSelectedPrompt(null)
              }
            >
              <X size={20} />
            </button>

            <div className="detail-category">
              {selectedPrompt.category}
            </div>

            <h2>
              {selectedPrompt.title}
            </h2>

            <p className="detail-description">
              {selectedPrompt.description}
            </p>

            <div className="detail-label">
              PROMPT
            </div>

            <div className="prompt-preview">
              {selectedPrompt.prompt}
            </div>

            <div className="detail-actions">
              <button
                className="secondary-button"
                onClick={() =>
                  toggleFavorite(
                    selectedPrompt.id
                  )
                }
              >
                <Star
                  size={17}
                  fill={
                    selectedPrompt.favorite
                      ? "currentColor"
                      : "none"
                  }
                />

                {selectedPrompt.favorite
                  ? "Favorited"
                  : "Favorite"}
              </button>

              <button
                className="primary-button"
                onClick={() =>
                  copyPrompt(
                    selectedPrompt
                  )
                }
              >
                {copiedId ===
                selectedPrompt.id ? (
                  <>
                    <Check size={17} />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={17} />
                    Copy Prompt
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreate && (
        <div
          className="modal-backdrop"
          onClick={() =>
            setShowCreate(false)
          }
        >
          <div
            className="create-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              className="modal-close"
              onClick={() =>
                setShowCreate(false)
              }
            >
              <X size={20} />
            </button>

            <div className="modal-eyebrow">
              CREATE
            </div>

            <h2>
              Create a new prompt
            </h2>

            <p>
              Save your idea, organize it, and
              use it anytime.
            </p>

            <div className="form-grid">
              <label>
                Title

                <input
                  value={newPrompt.title}
                  onChange={(event) =>
                    setNewPrompt({
                      ...newPrompt,
                      title:
                        event.target.value,
                    })
                  }
                  placeholder="e.g. Explain a complex topic"
                />
              </label>

              <label>
                Category

                <select
                  value={
                    newPrompt.category
                  }
                  onChange={(event) =>
                    setNewPrompt({
                      ...newPrompt,
                      category:
                        event.target
                          .value as Category,
                    })
                  }
                >
                  {categories.map(
                    (category) => (
                      <option key={category}>
                        {category}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label>
                Description

                <input
                  value={
                    newPrompt.description
                  }
                  onChange={(event) =>
                    setNewPrompt({
                      ...newPrompt,
                      description:
                        event.target.value,
                    })
                  }
                  placeholder="What is this prompt useful for?"
                />
              </label>

              <label>
                Tags

                <input
                  value={newPrompt.tags}
                  onChange={(event) =>
                    setNewPrompt({
                      ...newPrompt,
                      tags:
                        event.target.value,
                    })
                  }
                  placeholder="learning, beginner"
                />
              </label>

              <label className="full-field">
                Prompt

                <textarea
                  value={newPrompt.prompt}
                  onChange={(event) =>
                    setNewPrompt({
                      ...newPrompt,
                      prompt:
                        event.target.value,
                    })
                  }
                  placeholder="Write your prompt here..."
                />
              </label>
            </div>

            <div className="modal-actions">
              <button
                className="secondary-button"
                onClick={() =>
                  setShowCreate(false)
                }
              >
                Cancel
              </button>

              <button
                className="primary-button"
                onClick={createPrompt}
              >
                <Plus size={17} />
                Save Prompt
              </button>
            </div>
          </div>
        </div>
      )}

      {showImprover && (
        <div
          className="modal-backdrop"
          onClick={() =>
            setShowImprover(false)
          }
        >
          <div
            className="improver-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              className="modal-close"
              onClick={() =>
                setShowImprover(false)
              }
            >
              <X size={20} />
            </button>

            <div className="improver-modal-icon">
              <WandSparkles size={25} />
            </div>

            <div className="modal-eyebrow">
              AI TOOL
            </div>

            <h2>
              Improve your prompt.
            </h2>

            <p>
              Turn a rough idea into a clear,
              specific, high-quality instruction.
            </p>

            <textarea
              className="improver-input"
              value={improveText}
              onChange={(event) => {
                setImproveText(
                  event.target.value
                );
                setImprovedText("");
              }}
              placeholder="Try: explain machine learning"
            />

            <button
              className="primary-button full-button"
              onClick={improvePrompt}
            >
              <WandSparkles size={17} />
              Improve Prompt
            </button>

            {improvedText && (
              <div className="improved-result">
                <div className="detail-label">
                  IMPROVED PROMPT
                </div>

                <p>{improvedText}</p>

                <button
                  className="secondary-button"
                  onClick={
                    copyImprovedPrompt
                  }
                >
                  {copiedImproved ? (
                    <>
                      <Check size={16} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      Copy Improved Prompt
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;