const timelineData = [
  { term: 'Spring 2026', role: 'Instructor', course: 'Math 253: Calculus III: Sequences and Series' },
  { term: 'Winter 2026', role: 'Instructor', course: 'Math 341: Linear Algebra I' },
  { term: 'Fall 2025',   role: 'Instructor', course: 'Math 251: Differential Calculus' },
  { term: 'Spring 2025', role: 'Grader',     course: 'Math 636: Algebraic Topology' },
  { term: 'Winter 2025', role: 'Instructor', course: 'Math 251: Differential Calculus' },
  { term: 'Fall 2024',   role: 'Instructor', course: 'Math 251: Differential Calculus' },
  { term: 'Spring 2024', role: 'Grader',     course: 'Math 458: Cryptography and Math 607: Applied Mathematics' },
  { term: 'Fall 2023',   role: 'Instructor', course: 'Math 246: Calculus for Biological Sciences' },
  { term: 'Spring 2023', role: 'Grader',     course: 'Math 343: Statistical Models and Math 425/525: Statistical Methods' },
  { term: 'Winter 2023', role: 'Instructor', course: 'Math 111: Precalculus' },
  { term: 'Fall 2022',   role: 'TA',         course: 'Math 241: Calculus for Business' },
  { term: 'Summer 2022', role: 'Instructor', course: 'Math 107: Voting Theory' },
  { term: 'Spring 2022', role: 'Instructor', course: 'Math 112: Trigonometry' },
  { term: 'Winter 2022', role: 'Instructor', course: 'Math 112: Trigonometry' },
  { term: 'Fall 2021',   role: 'TA',         course: 'Math 243: Statistics' },
  { term: 'Summer 2021', role: 'Instructor', course: 'Math 107: Voting Theory' },
  { term: 'Spring 2021', role: 'Instructor', course: 'Math 111: Precalculus' },
  { term: 'Winter 2021', role: 'TA',         course: 'Math 241: Calculus for Business' },
  { term: 'Fall 2020',   role: 'TA',         course: 'Math 243: Statistics' },
  { term: 'Summer 2020', role: 'Instructor', course: 'Math 101: Foundations of Math Modeling' },
  { term: 'Spring 2020', role: 'Instructor', course: 'Math 111: Precalculus' },
  { term: 'Winter 2020', role: 'Instructor', course: 'Math 111: Precalculus' },
  { term: 'Fall 2019',   role: 'TA',         course: 'Math 111: Precalculus' },
]

function academicYear(term) {
  const [season, yearStr] = term.split(' ')
  const year = parseInt(yearStr, 10)
  return (season === 'Fall' || season === 'Summer') ? `${year}\u2013${year + 1}` : `${year - 1}\u2013${year}`
}

function groupByYear(data) {
  const map = new Map()
  for (const entry of data) {
    const yr = academicYear(entry.term)
    if (!map.has(yr)) map.set(yr, [])
    map.get(yr).push(entry)
  }
  return [...map.entries()]
}

export function render() {
  const groups = groupByYear(timelineData)
  const instructorCount = timelineData.filter(e => e.role === 'Instructor').length
  const taCount = timelineData.filter(e => e.role === 'TA').length
  const graderCount = timelineData.filter(e => e.role === 'Grader').length
  return /* html */`
    <section class="timeline-wrapper">
      <h2 class="timeline-title">Teaching Experience</h2>
      <div class="timeline-description">
        <p>Courses taught at the University of Oregon:</p>
        <p class="teaching-summary">${instructorCount} terms as instructor &middot; ${taCount} as TA &middot; ${graderCount} as grader</p>
      </div>
      <div class="teaching-groups">
        ${groups.map(([year, entries]) => `
          <div class="teaching-year-group">
            <div class="teaching-year">${year}</div>
            <div class="teaching-rows">
              ${entries.map(({ term, role, course }) => `
                <div class="teaching-row">
                  <span class="teaching-term">${term}</span>
                  <span class="teaching-role">${role}</span>
                  <span class="teaching-course">${course}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `
}
