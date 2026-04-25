import { useEffect, useState } from 'react'
import './App.css'

const backlogItems = [
  { id: 1, title: 'Student Sign-up & Login', epic: 'Authentication', priority: 'Must', status: 'In Progress', estimate: '5 days' },
  { id: 2, title: 'Role-Based Access', epic: 'Authorization', priority: 'Must', status: 'Ready for Dev', estimate: '5 days' },
  { id: 3, title: 'Course Enrollment & Joining Code', epic: 'Course Management', priority: 'Must', status: 'Pending', estimate: '5 days' },
  { id: 4, title: 'Points System', epic: 'Gamification Core', priority: 'Must', status: 'Backlog', estimate: '7 days' },
  { id: 5, title: 'Badges & Achievements', epic: 'Gamification Core', priority: 'Should', status: 'Backlog', estimate: '6 days' },
  { id: 6, title: 'Leaderboards', epic: 'Leaderboards', priority: 'Must', status: 'Ready for Dev', estimate: '7 days' },
  { id: 7, title: 'Daily Streaks & Rewards', epic: 'Engagement', priority: 'Could', status: 'Backlog', estimate: '5 days' },
  { id: 8, title: 'Quests / Weekly Challenges', epic: 'Engagement', priority: 'Should', status: 'Pending', estimate: '8 days' },
  { id: 9, title: 'Notifications', epic: 'Communications', priority: 'Should', status: 'Backlog', estimate: '7 days' },
  { id: 10, title: 'Admin Analytics Dashboard', epic: 'Analytics', priority: 'Could', status: 'Backlog', estimate: '9 days' },
]

const initialChallenges = [
  { id: 'quiz-2', title: 'Complete Quiz 2', courseId: 'cs101', courseName: 'Computer Science 101', xp: 100, type: 'Quiz', requirement: 'Score 80% or above on the algorithms quiz.', progress: 82, total: 100, streakBoost: false, complete: false },
  { id: 'assignment-1', title: 'Submit Assignment 1', courseId: 'cs101', courseName: 'Computer Science 101', xp: 75, type: 'Assignment', requirement: 'Upload the recursion worksheet before Friday.', progress: 1, total: 1, streakBoost: false, complete: false },
  { id: 'login-3-days', title: 'Login 3 Days in a Row', courseId: 'global', courseName: 'Daily Habit Challenge', xp: 50, type: 'Streak', requirement: 'Keep your learning streak alive for three consecutive days.', progress: 2, total: 3, streakBoost: true, complete: false },
]

const courseCatalog = [
  { id: 'cs101', code: 'ABC123', name: 'Computer Science 101', faculty: 'Prof. Mira Sen', progress: 67, students: 42, challenges: 3, summary: 'Algorithms, labs, and weekly quests.' },
  { id: 'ux205', code: 'DES205', name: 'UX Storytelling Studio', faculty: 'Prof. Arjun Rao', progress: 31, students: 28, challenges: 4, summary: 'Research sprints, critiques, and showcase rewards.' },
]

const initialStudent = {
  name: 'John Carter',
  email: 'john@gamifyed.app',
  role: 'student',
  level: 10,
  points: 685,
  streak: 2,
  rank: 2,
  badges: ['Quiz Starter', 'Streak Keeper'],
  notifications: [
    { id: 'n1', text: 'New weekly quest is live in Computer Science 101.', read: false },
    { id: 'n2', text: 'You are 75 XP away from Quiz Master.', read: false },
    { id: 'n3', text: "Leaderboard updated after yesterday's lab.", read: true },
  ],
  joinedCourseIds: ['cs101'],
}

const initialLeaders = [
  { id: 'mary', name: 'Mary', points: 960, trend: '+12', highlight: true },
  { id: 'john', name: 'John', points: 785, trend: '+8', highlight: false },
  { id: 'mike', name: 'Mike', points: 750, trend: '+5', highlight: false },
  { id: 'sarah', name: 'Sarah', points: 740, trend: '+3', highlight: false },
  { id: 'lucy', name: 'Lucy', points: 720, trend: '+2', highlight: false },
]

const badgeRules = [
  { id: 'quiz-master', name: 'Quiz Master', requirement: (student, challenges) => student.points >= 785 || challenges.some((item) => item.id === 'quiz-2' && item.complete) },
  { id: 'course-collector', name: 'Course Collector', requirement: (student) => student.joinedCourseIds.length >= 2 },
  { id: 'streak-hero', name: 'Streak Hero', requirement: (student) => student.streak >= 3 },
]

function StatIcon({ type }) {
  if (type === 'points') {
    return (
      <svg viewBox="0 0 24 24" className="mini-icon" aria-hidden="true">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 7v10M8 10h6a2 2 0 1 1 0 4H10a2 2 0 1 0 0 4h6" />
      </svg>
    )
  }

  if (type === 'badge') {
    return (
      <svg viewBox="0 0 24 24" className="mini-icon" aria-hidden="true">
        <circle cx="12" cy="9" r="5" />
        <path d="m9 13-2 8 5-3 5 3-2-8" />
      </svg>
    )
  }

  if (type === 'streak') {
    return (
      <svg viewBox="0 0 24 24" className="mini-icon" aria-hidden="true">
        <path d="M12 3c2 3-1 4 1 7s6 2 6 7a7 7 0 0 1-14 0c0-4 3-5 5-8 1-1 1-3 2-6Z" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" className="mini-icon" aria-hidden="true">
      <path d="M12 2 4 6v6c0 5 3.4 8.4 8 10 4.6-1.6 8-5 8-10V6l-8-4Z" />
    </svg>
  )
}

function TrophyArt() {
  return (
    <svg viewBox="0 0 220 180" className="trophy-art" aria-hidden="true">
      <defs>
        <linearGradient id="cupGradient" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#ffe27a" />
          <stop offset="100%" stopColor="#f0a91b" />
        </linearGradient>
      </defs>
      <rect x="18" y="20" width="184" height="140" rx="22" className="art-frame" />
      <path d="M78 36h64v18c0 23-14 41-32 41S78 77 78 54V36Z" fill="url(#cupGradient)" />
      <path d="M142 42h20c8 0 14 6 14 14 0 16-12 26-28 26M78 42H58c-8 0-14 6-14 14 0 16 12 26 28 26" className="art-line" />
      <path d="M99 95h22v22h20v13H79v-13h20Z" fill="#1d2433" />
      <path d="m110 48 7 13 15 2-11 11 3 15-14-7-14 7 3-15-11-11 15-2Z" className="art-star" />
      <circle cx="49" cy="34" r="2.5" />
      <circle cx="171" cy="28" r="3.5" />
      <circle cx="43" cy="126" r="2.5" />
      <circle cx="181" cy="114" r="2.5" />
    </svg>
  )
}

function Modal({ title, children, buttonText, onClose }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal-card" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-points">Reward</div>
        <TrophyArt />
        <h3>{title}</h3>
        <p>{children}</p>
        <button type="button" className="cta-button" onClick={onClose}>
          {buttonText}
        </button>
      </div>
    </div>
  )
}

function App() {
  const [screen, setScreen] = useState('loading')
  const [loginData, setLoginData] = useState({ email: initialStudent.email, password: 'demo123' })
  const [student, setStudent] = useState(initialStudent)
  const [leaders, setLeaders] = useState(initialLeaders)
  const [courses] = useState(courseCatalog)
  const [joinCode, setJoinCode] = useState('ABC123')
  const [challenges, setChallenges] = useState(initialChallenges)
  const [selectedCourse, setSelectedCourse] = useState('all')
  const [leaderboardMode, setLeaderboardMode] = useState('global')
  const [selectedAdminTab, setSelectedAdminTab] = useState('overview')
  const [activeModal, setActiveModal] = useState(null)
  const [loginError, setLoginError] = useState('')

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setScreen('login')
    }, 1800)

    return () => window.clearTimeout(timer)
  }, [])

  const joinedCourses = courses.filter((course) => student.joinedCourseIds.includes(course.id))
  const visibleChallenges = challenges.filter((challenge) => {
    if (selectedCourse === 'all') return true
    return challenge.courseId === selectedCourse
  })
  const completedChallenges = challenges.filter((challenge) => challenge.complete).length
  const totalChallengeXP = challenges.filter((challenge) => challenge.complete).reduce((sum, challenge) => sum + challenge.xp, 0)
  const unreadNotifications = student.notifications.filter((item) => !item.read).length
  const completionRate = Math.round((completedChallenges / challenges.length) * 100)
  const engagementScore = Math.min(100, Math.round((student.points / 10) * 0.9))

  const analytics = [
    { label: 'Active learners', value: '558', note: '+18% this week' },
    { label: 'Courses running', value: '14', note: '5 with live quests' },
    { label: 'Points awarded', value: '18.2k', note: 'Across 327 completions' },
    { label: 'Badge unlocks', value: '94', note: 'Top badge: Quiz Master' },
  ]

  const chartBars = [
    { label: 'Points', value: 82 },
    { label: 'Courses', value: 58 },
    { label: 'Badges', value: 46 },
    { label: 'Retention', value: 71 },
  ]

  const roadmapByStatus = backlogItems.reduce((accumulator, item) => {
    accumulator[item.status] = (accumulator[item.status] || 0) + 1
    return accumulator
  }, {})

  function handleLoginSubmit(event) {
    event.preventDefault()

    if (!loginData.email || !loginData.password) {
      setLoginError('Enter your email and password to continue.')
      return
    }

    setLoginError('')
    setScreen('dashboard')
  }

  function joinCourse() {
    const match = courses.find((course) => course.code.toLowerCase() === joinCode.trim().toLowerCase())

    if (!match) {
      setLoginError('That joining code is invalid. Try ABC123 or DES205.')
      return
    }

    if (student.joinedCourseIds.includes(match.id)) {
      setLoginError(`${match.name} is already on your dashboard.`)
      setScreen('dashboard')
      return
    }

    setStudent((current) => ({
      ...current,
      joinedCourseIds: [...current.joinedCourseIds, match.id],
      notifications: [
        { id: `course-${match.id}`, text: `You joined ${match.name}. New challenges are now unlocked.`, read: false },
        ...current.notifications,
      ],
    }))
    setLoginError('')
    setActiveModal({
      type: 'badge',
      title: 'Badge Unlocked!',
      body: `Congratulations! You earned the Course Collector badge for joining ${match.name}.`,
      buttonText: 'Open dashboard',
    })
    setScreen('dashboard')
  }

  function unlockBadges(nextStudent, nextChallenges) {
    const pending = badgeRules
      .filter((rule) => !nextStudent.badges.includes(rule.name))
      .find((rule) => rule.requirement(nextStudent, nextChallenges))

    if (!pending) {
      return
    }

    setStudent((current) => ({ ...current, badges: [...current.badges, pending.name] }))
    setActiveModal({
      type: 'badge',
      title: 'Badge Unlocked!',
      body: `Congratulations! You earned the ${pending.name} badge.`,
      buttonText: 'Continue',
    })
  }

  function completeChallenge(challengeId) {
    const selected = challenges.find((challenge) => challenge.id === challengeId)

    if (!selected || selected.complete) {
      return
    }

    const nextChallenges = challenges.map((challenge) =>
      challenge.id === challengeId ? { ...challenge, complete: true, progress: challenge.total } : challenge,
    )

    const streakGain = selected.streakBoost ? 1 : 0
    const nextStudent = {
      ...student,
      points: student.points + selected.xp,
      streak: student.streak + streakGain,
      notifications: [
        { id: `reward-${challengeId}`, text: `You completed ${selected.title} and earned ${selected.xp} XP.`, read: false },
        ...student.notifications,
      ],
    }

    setChallenges(nextChallenges)
    setStudent(nextStudent)
    setLeaders((current) =>
      current
        .map((leader) => (leader.name.toLowerCase() === 'john' ? { ...leader, points: nextStudent.points, trend: `+${selected.xp}` } : leader))
        .sort((first, second) => second.points - first.points),
    )
    setActiveModal({
      type: 'points',
      title: `+${selected.xp} Points`,
      body: `Great job! ${selected.title} is complete and your profile has been updated.`,
      buttonText: 'Continue',
    })
    unlockBadges(nextStudent, nextChallenges)
  }

  function markAllNotificationsRead() {
    setStudent((current) => ({
      ...current,
      notifications: current.notifications.map((item) => ({ ...item, read: true })),
    }))
  }

  function renderLoading() {
    return (
      <section className="loading-screen shell-card">
        <div className="brand-pill">Online College Gamification Platform</div>
        <TrophyArt />
        <div className="loading-copy">
          <h1>GamifyEd</h1>
          <p>Loading your quests, streaks, and classroom rewards...</p>
        </div>
        <div className="progress-track">
          <span className="progress-fill" />
        </div>
      </section>
    )
  }

  function renderLogin() {
    return (
      <section className="hero-layout">
        <div className="shell-card login-card">
          <div className="card-header">
            <div>
              <div className="eyebrow">Student Login</div>
              <h1>GamifyEd</h1>
            </div>
            <button type="button" className="ghost-button" onClick={() => setScreen('join-course')}>
              Join course
            </button>
          </div>
          <form className="login-form" onSubmit={handleLoginSubmit}>
            <label>
              Email / Phone
              <input
                type="text"
                value={loginData.email}
                onChange={(event) => setLoginData((current) => ({ ...current, email: event.target.value }))}
                placeholder="student@gamifyed.app"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={loginData.password}
                onChange={(event) => setLoginData((current) => ({ ...current, password: event.target.value }))}
                placeholder="Enter password"
              />
            </label>
            {loginError ? <p className="inline-error">{loginError}</p> : null}
            <button type="submit" className="cta-button">
              Login
            </button>
          </form>
          <div className="helper-row">
            <button type="button" className="text-button" onClick={() => setScreen('leaderboard')}>
              View leaderboard
            </button>
            <button type="button" className="text-button" onClick={() => setScreen('admin')}>
              Admin dashboard
            </button>
          </div>
        </div>

        <div className="shell-card feature-card">
          <div className="feature-copy">
            <div className="eyebrow">Backlog-driven product demo</div>
            <h2>Fully gamified learning flow in React</h2>
            <p>
              Built from the supplied sketch and product backlog: authentication, course enrollment,
              points, badges, leaderboards, streaks, notifications, and admin analytics.
            </p>
          </div>
          <div className="highlight-grid">
            {backlogItems.slice(0, 6).map((item) => (
              <article key={item.id} className="highlight-card">
                <span className={`status-tag ${item.priority.toLowerCase()}`}>{item.priority}</span>
                <strong>{item.title}</strong>
                <span>{item.epic}</span>
              </article>
            ))}
          </div>
        </div>
      </section>
    )
  }

  function renderDashboard() {
    return (
      <section className="dashboard-layout">
        <div className="shell-card dashboard-main">
          <div className="card-header">
            <div>
              <div className="eyebrow">Home Dashboard</div>
              <h2>Welcome, {student.name.split(' ')[0]}!</h2>
            </div>
            <div className="header-actions">
              <button type="button" className="ghost-button" onClick={() => setScreen('join-course')}>
                Join course
              </button>
              <button type="button" className="ghost-button" onClick={() => setScreen('leaderboard')}>
                Leaderboard
              </button>
            </div>
          </div>

          <div className="stats-row">
            <article className="stat-pill">
              <StatIcon type="points" />
              <div>
                <strong>{student.points}</strong>
                <span>Points</span>
              </div>
            </article>
            <article className="stat-pill">
              <StatIcon type="badge" />
              <div>
                <strong>{student.badges.length}</strong>
                <span>Badges</span>
              </div>
            </article>
            <article className="stat-pill">
              <StatIcon type="streak" />
              <div>
                <strong>{student.streak} days</strong>
                <span>Streak</span>
              </div>
            </article>
            <article className="stat-pill">
              <StatIcon type="shield" />
              <div>
                <strong>#{leaders.findIndex((leader) => leader.name.toLowerCase() === 'john') + 1}</strong>
                <span>Rank</span>
              </div>
            </article>
          </div>

          <div className="dashboard-grid">
            <section className="dashboard-panel hero-panel">
              <TrophyArt />
              <div className="panel-copy">
                <h3>Semester sprint</h3>
                <p>Earn the next badge by completing your remaining weekly challenges.</p>
                <div className="meter">
                  <div className="meter-labels">
                    <span>Progress</span>
                    <strong>{completionRate}%</strong>
                  </div>
                  <div className="meter-track">
                    <span style={{ width: `${completionRate}%` }} />
                  </div>
                </div>
              </div>
            </section>

            <section className="dashboard-panel course-panel">
              <div className="panel-head">
                <h3>My courses</h3>
                <button type="button" className="text-button" onClick={() => setScreen('join-course')}>
                  Add course
                </button>
              </div>
              <div className="course-list">
                {joinedCourses.map((course) => (
                  <article key={course.id} className="course-card">
                    <div>
                      <strong>{course.name}</strong>
                      <span>{course.summary}</span>
                    </div>
                    <div className="course-meta">
                      <span>{course.challenges} challenges</span>
                      <span>{course.progress}% complete</span>
                    </div>
                    <div className="meter-track small">
                      <span style={{ width: `${course.progress}%` }} />
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="dashboard-panel notifications-panel">
              <div className="panel-head">
                <h3>Notifications</h3>
                <button type="button" className="text-button" onClick={markAllNotificationsRead}>
                  Mark all read
                </button>
              </div>
              <div className="notification-list">
                {student.notifications.slice(0, 4).map((item) => (
                  <article key={item.id} className={`notification-card ${item.read ? 'read' : 'unread'}`}>
                    <span className="notification-dot" />
                    <p>{item.text}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="dashboard-panel quest-panel">
              <div className="panel-head">
                <h3>Quick actions</h3>
                <button type="button" className="text-button" onClick={() => setScreen('challenges')}>
                  Open quests
                </button>
              </div>
              <div className="quick-actions">
                <button type="button" className="action-card" onClick={() => setScreen('challenges')}>
                  Weekly challenges
                </button>
                <button type="button" className="action-card" onClick={() => setScreen('leaderboard')}>
                  Global leaderboard
                </button>
                <button type="button" className="action-card" onClick={() => setScreen('admin')}>
                  Faculty + admin view
                </button>
              </div>
            </section>
          </div>
        </div>

        <aside className="shell-card sidebar-card">
          <div className="eyebrow">Your streak board</div>
          <h3>Keep the momentum going</h3>
          <div className="streak-ring">
            <div>
              <strong>{student.streak}</strong>
              <span>days</span>
            </div>
          </div>
          <div className="sidebar-stats">
            <div>
              <strong>{totalChallengeXP}</strong>
              <span>XP earned</span>
            </div>
            <div>
              <strong>{unreadNotifications}</strong>
              <span>Unread alerts</span>
            </div>
            <div>
              <strong>{student.badges.length}</strong>
              <span>Badges</span>
            </div>
          </div>

          <div className="sidebar-badges">
            {student.badges.map((badge) => (
              <span key={badge} className="badge-chip">
                {badge}
              </span>
            ))}
          </div>

          <div className="roadmap-card">
            <div className="panel-head">
              <h4>Backlog snapshot</h4>
              <span>{backlogItems.length} stories</span>
            </div>
            <div className="roadmap-bars">
              {Object.entries(roadmapByStatus).map(([label, count]) => (
                <div key={label}>
                  <div className="meter-labels">
                    <span>{label}</span>
                    <strong>{count}</strong>
                  </div>
                  <div className="meter-track small">
                    <span style={{ width: `${(count / backlogItems.length) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>
    )
  }

  function renderJoinCourse() {
    return (
      <section className="split-layout">
        <div className="shell-card join-card">
          <div className="panel-head">
            <button type="button" className="text-button" onClick={() => setScreen('dashboard')}>
              Back
            </button>
            <span className="eyebrow">Join Course</span>
          </div>
          <TrophyArt />
          <label className="stacked-field">
            Enter course code
            <input value={joinCode} onChange={(event) => setJoinCode(event.target.value)} placeholder="ABC123" />
          </label>
          {loginError ? <p className="inline-error">{loginError}</p> : null}
          <button type="button" className="cta-button" onClick={joinCourse}>
            Join course
          </button>
          <div className="catalog-list">
            {courses.map((course) => (
              <article key={course.id} className="catalog-card">
                <strong>{course.name}</strong>
                <span>
                  Code {course.code} | {course.students} learners
                </span>
              </article>
            ))}
          </div>
        </div>

        <div className="shell-card challenge-preview">
          <div className="panel-head">
            <h3>Challenge preview</h3>
            <button type="button" className="text-button" onClick={() => setScreen('challenges')}>
              Open list
            </button>
          </div>
          {challenges.map((challenge) => (
            <article key={challenge.id} className="challenge-row compact">
              <div>
                <strong>{challenge.title}</strong>
                <p>{challenge.requirement}</p>
              </div>
              <span className="xp-pill">{challenge.xp} XP</span>
            </article>
          ))}
        </div>
      </section>
    )
  }

  function renderChallenges() {
    return (
      <section className="split-layout wide">
        <div className="shell-card challenge-list-card">
          <div className="panel-head">
            <div>
              <div className="eyebrow">Challenges List</div>
              <h2>Weekly Challenges</h2>
            </div>
            <div className="header-actions">
              <select value={selectedCourse} onChange={(event) => setSelectedCourse(event.target.value)}>
                <option value="all">All courses</option>
                {joinedCourses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
              <button type="button" className="ghost-button" onClick={() => setScreen('dashboard')}>
                Dashboard
              </button>
            </div>
          </div>
          <div className="challenge-list">
            {visibleChallenges.map((challenge) => {
              const progress = Math.round((challenge.progress / challenge.total) * 100)

              return (
                <article key={challenge.id} className={`challenge-row ${challenge.complete ? 'complete' : ''}`}>
                  <div className="challenge-copy">
                    <div className="challenge-meta">
                      <span className="type-pill">{challenge.type}</span>
                      <span>{challenge.courseName}</span>
                    </div>
                    <strong>{challenge.title}</strong>
                    <p>{challenge.requirement}</p>
                    <div className="meter-track small">
                      <span style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  <div className="challenge-actions">
                    <span className="xp-pill">{challenge.xp} XP</span>
                    <button type="button" className="cta-button small" onClick={() => completeChallenge(challenge.id)} disabled={challenge.complete}>
                      {challenge.complete ? 'Completed' : 'Claim reward'}
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </div>

        <div className="shell-card insight-card">
          <div className="eyebrow">Realtime progress</div>
          <h3>Reward engine</h3>
          <div className="insight-grid">
            <article>
              <strong>{completedChallenges}</strong>
              <span>Challenges completed</span>
            </article>
            <article>
              <strong>{totalChallengeXP}</strong>
              <span>XP claimed</span>
            </article>
            <article>
              <strong>{student.badges.length}</strong>
              <span>Badge count</span>
            </article>
            <article>
              <strong>{student.streak}</strong>
              <span>Current streak</span>
            </article>
          </div>

          <div className="backlog-table">
            <div className="panel-head">
              <h4>Backlog input</h4>
              <span>Imported from spreadsheet</span>
            </div>
            {backlogItems.map((item) => (
              <article key={item.id} className="backlog-row">
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.epic}</span>
                </div>
                <span className={`status-tag ${item.status.toLowerCase().replace(/\s+/g, '-')}`}>{item.status}</span>
              </article>
            ))}
          </div>
        </div>
      </section>
    )
  }

  function renderLeaderboard() {
    return (
      <section className="split-layout wide">
        <div className="shell-card leaderboard-card">
          <div className="panel-head">
            <div>
              <div className="eyebrow">Leaderboard</div>
              <h2>{leaderboardMode === 'global' ? 'Global leaderboard' : 'Course leaderboard'}</h2>
            </div>
            <div className="segmented">
              <button type="button" className={leaderboardMode === 'course' ? 'active' : ''} onClick={() => setLeaderboardMode('course')}>
                Course
              </button>
              <button type="button" className={leaderboardMode === 'global' ? 'active' : ''} onClick={() => setLeaderboardMode('global')}>
                Global
              </button>
            </div>
          </div>
          <div className="leader-list">
            {leaders.map((leader, index) => (
              <article key={leader.id} className={`leader-row ${leader.highlight ? 'highlight' : ''}`}>
                <span className="leader-rank">#{index + 1}</span>
                <strong>{leader.name}</strong>
                <span>{leader.points} pts</span>
                <span className="trend-pill">{leader.trend}</span>
              </article>
            ))}
          </div>
        </div>

        <div className="shell-card admin-preview">
          <div className="panel-head">
            <h3>Motivation snapshot</h3>
            <button type="button" className="text-button" onClick={() => setScreen('admin')}>
              Open admin view
            </button>
          </div>
          <div className="chart-card">
            <div className="donut">
              <div className="donut-inner">
                <strong>{engagementScore}%</strong>
                <span>Engagement</span>
              </div>
            </div>
            <div className="chart-legend">
              {chartBars.map((bar) => (
                <div key={bar.label} className="bar-row">
                  <div className="meter-labels">
                    <span>{bar.label}</span>
                    <strong>{bar.value}%</strong>
                  </div>
                  <div className="meter-track small">
                    <span style={{ width: `${bar.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  function renderAdmin() {
    return (
      <section className="dashboard-layout admin-layout">
        <div className="shell-card admin-main">
          <div className="card-header">
            <div>
              <div className="eyebrow">Admin Dashboard</div>
              <h2>Welcome to GamifyEd, Admin!</h2>
            </div>
            <div className="header-actions">
              <button type="button" className="ghost-button" onClick={() => setScreen('dashboard')}>
                Student view
              </button>
              <button type="button" className="ghost-button" onClick={() => setScreen('leaderboard')}>
                Leaderboard
              </button>
            </div>
          </div>

          <div className="segmented admin-tabs">
            <button type="button" className={selectedAdminTab === 'overview' ? 'active' : ''} onClick={() => setSelectedAdminTab('overview')}>
              Overview
            </button>
            <button type="button" className={selectedAdminTab === 'roadmap' ? 'active' : ''} onClick={() => setSelectedAdminTab('roadmap')}>
              Roadmap
            </button>
          </div>

          {selectedAdminTab === 'overview' ? (
            <div className="admin-grid">
              {analytics.map((item) => (
                <article key={item.label} className="analytic-card">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                  <p>{item.note}</p>
                </article>
              ))}
              <article className="analytics-chart-card wide">
                <div className="panel-head">
                  <h3>Platform health</h3>
                  <span>Daily update</span>
                </div>
                <div className="bar-stack">
                  {chartBars.map((bar) => (
                    <div key={bar.label} className="bar-row">
                      <div className="meter-labels">
                        <span>{bar.label}</span>
                        <strong>{bar.value}%</strong>
                      </div>
                      <div className="meter-track">
                        <span style={{ width: `${bar.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          ) : (
            <div className="admin-roadmap">
              {backlogItems.map((item) => (
                <article key={item.id} className="roadmap-row">
                  <div>
                    <strong>{item.title}</strong>
                    <p>
                      {item.epic} | {item.priority} priority | Estimate {item.estimate}
                    </p>
                  </div>
                  <span className={`status-tag ${item.status.toLowerCase().replace(/\s+/g, '-')}`}>{item.status}</span>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="shell-card sidebar-card admin-side">
          <div className="eyebrow">At a glance</div>
          <h3>Faculty activity</h3>
          <div className="faculty-card">
            <strong>Lab 5 Stats</strong>
            <p>600 total submissions processed with 94% completion accuracy.</p>
          </div>
          <div className="faculty-card">
            <strong>Quest adoption</strong>
            <p>18% week-over-week lift after introducing streak rewards and badges.</p>
          </div>
          <div className="faculty-card">
            <strong>Top student</strong>
            <p>Mary remains #1 with 960 points and a 12-point trend uplift.</p>
          </div>
        </aside>
      </section>
    )
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <span className="brand-mark">GE</span>
          <div>
            <strong>GamifyEd</strong>
            <span>React | HTML | CSS | JavaScript demo</span>
          </div>
        </div>
        <nav className="topnav">
          <button type="button" className={screen === 'dashboard' ? 'active' : ''} onClick={() => setScreen('dashboard')}>
            Dashboard
          </button>
          <button type="button" className={screen === 'challenges' ? 'active' : ''} onClick={() => setScreen('challenges')}>
            Challenges
          </button>
          <button type="button" className={screen === 'leaderboard' ? 'active' : ''} onClick={() => setScreen('leaderboard')}>
            Leaderboard
          </button>
          <button type="button" className={screen === 'admin' ? 'active' : ''} onClick={() => setScreen('admin')}>
            Admin
          </button>
        </nav>
      </header>

      {screen === 'loading' ? renderLoading() : null}
      {screen === 'login' ? renderLogin() : null}
      {screen === 'dashboard' ? renderDashboard() : null}
      {screen === 'join-course' ? renderJoinCourse() : null}
      {screen === 'challenges' ? renderChallenges() : null}
      {screen === 'leaderboard' ? renderLeaderboard() : null}
      {screen === 'admin' ? renderAdmin() : null}

      {activeModal ? (
        <Modal title={activeModal.title} buttonText={activeModal.buttonText} onClose={() => setActiveModal(null)}>
          {activeModal.body}
        </Modal>
      ) : null}
    </main>
  )
}

export default App
