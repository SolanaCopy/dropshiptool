"use client";

import { useState, useEffect } from "react";
import { COURSES } from "../data/courses";
import { getTrackedActions, isAutoCompleted } from "../services/trackProgress";
import { useAuth } from "../context/AuthContext";

function LearnPath({ onNavigate }) {
  const { user } = useAuth();
  const isPro = user && (user.plan === "pro" || user.plan === "business");
  const [progress, setProgress] = useState({});
  const [actions, setActions] = useState({});
  const [activeCourse, setActiveCourse] = useState("beginner");
  const [expandedStep, setExpandedStep] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("learnpath_v2");
    if (saved) setProgress(JSON.parse(saved));
    setActions(getTrackedActions());

    // Poll voor updates elke 3 seconden (als user terugkomt van een andere tab)
    const interval = setInterval(() => setActions(getTrackedActions()), 3000);
    return () => clearInterval(interval);
  }, []);

  const save = (p) => { setProgress(p); localStorage.setItem("learnpath_v2", JSON.stringify(p)); };
  const toggle = (stepId, i) => {
    // Niet togglen als auto-completed
    const auto = isAutoCompleted(stepId, i, actions);
    if (auto === true) return;
    const k = `${stepId}-${i}`;
    save({ ...progress, [k]: !progress[k] });
  };

  const isChecked = (stepId, i) => {
    const auto = isAutoCompleted(stepId, i, actions);
    if (auto === true) return true;
    return !!progress[`${stepId}-${i}`];
  };

  const getStepProg = (step) => {
    const t = step.checklist.length;
    const d = step.checklist.filter((_, i) => isChecked(step.id, i)).length;
    return { done: d, total: t, pct: t > 0 ? Math.round((d / t) * 100) : 0 };
  };

  const getCourseProg = (course) => {
    const allChecks = course.modules.flatMap((m) => m.steps.flatMap((s) => s.checklist));
    const done = course.modules.reduce((sum, m) =>
      sum + m.steps.reduce((s2, step) =>
        s2 + step.checklist.filter((_, i) => progress[`${step.id}-${i}`]).length, 0), 0);
    return { done, total: allChecks.length, pct: allChecks.length > 0 ? Math.round((done / allChecks.length) * 100) : 0 };
  };

  const isCourseUnlocked = (course) => {
    if (course.level === 1) return true;
    // Level 2+ vereist Pro plan + vorig level 80% af
    if (!isPro) return false;
    const prev = COURSES.find((c) => c.level === course.level - 1);
    return prev ? getCourseProg(prev).pct >= 80 : true;
  };

  const current = COURSES.find((c) => c.id === activeCourse);
  const currentProg = current ? getCourseProg(current) : { done: 0, total: 0, pct: 0 };

  return (
    <div className="lp">
      {/* Intro */}
      <div className="lp-intro">
        <div className="lp-intro-left">
          <div className="lp-intro-badge">Gratis cursus &middot; 21 lessen &middot; ~10 uur</div>
          <h2>Leer dropshipping van A tot Z</h2>
          <p>Van je eerste niche kiezen tot je eerste verkoop en opschalen — alles wat je nodig hebt om te starten als dropshipper in Nederland.</p>
        </div>
        <div className="lp-intro-skills">
          <div className="lp-skill">
            <span className="lp-skill-icon">&#127919;</span>
            <div>
              <strong>Niche &amp; producten</strong>
              <span>Data-gedreven kiezen</span>
            </div>
          </div>
          <div className="lp-skill">
            <span className="lp-skill-icon">&#127981;</span>
            <div>
              <strong>Leveranciers</strong>
              <span>Goedkoopste vinden</span>
            </div>
          </div>
          <div className="lp-skill">
            <span className="lp-skill-icon">&#128176;</span>
            <div>
              <strong>Winstberekening</strong>
              <span>Alle kosten meegerekend</span>
            </div>
          </div>
          <div className="lp-skill">
            <span className="lp-skill-icon">&#128187;</span>
            <div>
              <strong>Webshop bouwen</strong>
              <span>Shopify &amp; Bol.com</span>
            </div>
          </div>
          <div className="lp-skill">
            <span className="lp-skill-icon">&#128226;</span>
            <div>
              <strong>Adverteren</strong>
              <span>TikTok &amp; Facebook Ads</span>
            </div>
          </div>
          <div className="lp-skill">
            <span className="lp-skill-icon">&#128640;</span>
            <div>
              <strong>Opschalen</strong>
              <span>Van side hustle naar business</span>
            </div>
          </div>
        </div>
      </div>

      <div className="lp-body">
      {/* Course selector */}
      <div className="lp-courses">
        {COURSES.map((course) => {
          const prog = getCourseProg(course);
          const unlocked = isCourseUnlocked(course);
          const isActive = activeCourse === course.id;

          return (
            <button
              key={course.id}
              className={`lp-course-card ${isActive ? "lp-course-active" : ""} ${!unlocked ? "lp-course-locked" : ""}`}
              onClick={() => unlocked && setActiveCourse(course.id)}
              disabled={!unlocked}
            >
              {!unlocked && <div className="lp-lock-icon" title={!isPro ? "Pro plan vereist" : "Rond vorig level af"}>&#128274;</div>}
              <div className="lp-course-emoji" dangerouslySetInnerHTML={{ __html: course.emoji }} />
              <div className="lp-course-info">
                <span className="lp-course-title">{course.title}</span>
                <span className="lp-course-sub">{course.subtitle}</span>
              </div>
              <div className="lp-course-prog">
                <div className="lp-course-prog-bar">
                  <div className="lp-course-prog-fill" style={{ width: `${prog.pct}%`, background: course.color }}></div>
                </div>
                <span>{prog.pct}%</span>
              </div>
            </button>
          );
        })}
      </div>

      {current && (
        <>
          {/* Course hero */}
          <div className="lp-hero" style={{ background: current.gradient }}>
            <div className="lp-hero-content">
              <div className="lp-hero-badge">Level {current.level} &middot; {current.totalTime}</div>
              <h2 dangerouslySetInnerHTML={{ __html: `${current.emoji} ${current.title}` }} />
              <p>{current.subtitle}</p>
            </div>
            <div className="lp-hero-stats">
              <div className="lp-hero-stat">
                <span className="lp-hero-stat-num">{current.modules.reduce((s, m) => s + m.steps.length, 0)}</span>
                <span className="lp-hero-stat-label">Lessen</span>
              </div>
              <div className="lp-hero-stat">
                <span className="lp-hero-stat-num">{currentProg.done}</span>
                <span className="lp-hero-stat-label">Afgevinkt</span>
              </div>
              <div className="lp-hero-stat">
                <span className="lp-hero-stat-num">{currentProg.pct}%</span>
                <span className="lp-hero-stat-label">Klaar</span>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="lp-progress">
            <div className="lp-progress-info">
              <span className="lp-progress-label">Voortgang &mdash; {current.title}</span>
              <span className="lp-progress-pct">{currentProg.done}/{currentProg.total}</span>
            </div>
            <div className="lp-progress-bar">
              <div className="lp-progress-fill" style={{ width: `${currentProg.pct}%` }}></div>
            </div>
          </div>

          {/* Modules */}
          {current.modules.map((mod) => {
            const modDone = mod.steps.every((s) => getStepProg(s).pct === 100);

            return (
              <div key={mod.id} className="lp-module">
                <div className="lp-module-header">
                  <div className="lp-module-icon" dangerouslySetInnerHTML={{ __html: mod.emoji }} />
                  <div className="lp-module-info">
                    <h3>{mod.title}</h3>
                    <span>{mod.subtitle}</span>
                  </div>
                  {modDone && <div className="lp-module-done">&#10003; Afgerond</div>}
                </div>

                <div className="lp-module-steps">
                  {mod.steps.map((step, si) => {
                    const prog = getStepProg(step);
                    const isOpen = expandedStep === step.id;
                    const isDone = prog.pct === 100;

                    return (
                      <div key={step.id} className={`lp-step ${isDone ? "lp-step-done" : ""} ${isOpen ? "lp-step-open" : ""}`}>
                        {si > 0 && <div className={`lp-timeline-line ${isDone ? "line-done" : ""}`}></div>}

                        <button className="lp-step-header" onClick={() => setExpandedStep(isOpen ? null : step.id)}>
                          <div className={`lp-step-icon ${isDone ? "icon-done" : ""}`}>
                            {isDone ? <span>&#10003;</span> : <span dangerouslySetInnerHTML={{ __html: step.icon }} />}
                          </div>
                          <div className="lp-step-meta">
                            <span className="lp-step-title">{step.title}</span>
                            <span className="lp-step-duration">{step.duration}</span>
                          </div>
                          <div className="lp-step-right">
                            {prog.done > 0 && !isDone && <span className="lp-step-count">{prog.done}/{prog.total}</span>}
                            <span className={`lp-step-chevron ${isOpen ? "chevron-open" : ""}`}>&#8250;</span>
                          </div>
                        </button>

                        {isOpen && (
                          <div className="lp-step-body">
                            <div className="lp-lesson">
                              {step.content.map((p, i) => (<p key={i}>{p}</p>))}
                            </div>

                            {step.keyPoints && (
                              <div className="lp-keypoints">
                                {step.keyPoints.map((kp, i) => (
                                  <div key={i} className="lp-keypoint">
                                    <span className="lp-kp-label">{kp.label}</span>
                                    <span className="lp-kp-value">{kp.value}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {step.proTip && (
                              <div className="lp-protip">
                                <span className="lp-protip-icon">&#128161;</span>
                                <div>
                                  <strong>Pro tip</strong>
                                  <p>{step.proTip}</p>
                                </div>
                              </div>
                            )}

                            {step.action && (
                              <button className="lp-action" onClick={() => onNavigate && onNavigate(step.action)}>
                                <span dangerouslySetInnerHTML={{ __html: step.icon }} />
                                {step.actionLabel}
                              </button>
                            )}

                            <div className="lp-checklist">
                              <div className="lp-checklist-header">
                                <span>Opdrachten</span>
                                <span className="lp-checklist-count">{prog.done}/{prog.total}</span>
                              </div>
                              {step.checklist.map((item, i) => {
                                const auto = isAutoCompleted(step.id, i, actions);
                                const checked = isChecked(step.id, i);
                                const isAuto = auto === true;
                                return (
                                  <label key={i} className={`lp-check ${checked ? "lp-check-done" : ""} ${isAuto ? "lp-check-auto" : ""}`} onClick={() => toggle(step.id, i)}>
                                    <div className={`lp-checkbox ${checked ? "lp-checkbox-checked" : ""} ${isAuto ? "lp-checkbox-auto" : ""}`}>
                                      {checked && <span>&#10003;</span>}
                                    </div>
                                    <span>{item}</span>
                                    {isAuto && <span className="lp-auto-badge">Auto</span>}
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Next level unlock */}
          {currentProg.pct >= 80 && current.level < 3 && (
            <div className="lp-unlock">
              <span className="lp-unlock-emoji">&#128275;</span>
              <div>
                <strong>Level {current.level + 1} ontgrendeld!</strong>
                <p>Je hebt {currentProg.pct}% van {current.title} afgerond. Ga door naar het volgende niveau.</p>
              </div>
              <button onClick={() => { const next = COURSES.find((c) => c.level === current.level + 1); if (next) setActiveCourse(next.id); }}>
                Volgende level &rarr;
              </button>
            </div>
          )}

          {/* Completion */}
          {currentProg.pct === 100 && (
            <div className="lp-complete">
              <div className="lp-complete-emoji">&#127881;</div>
              <h3>{current.title} afgerond!</h3>
              <p>{current.level < 3 ? "Ga door naar het volgende level om je skills te verbeteren." : "Je hebt alle levels afgerond. Je bent klaar om een succesvolle dropshipper te worden!"}</p>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
}

export default LearnPath;
