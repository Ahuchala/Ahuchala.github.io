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

export function render() {
  return /* html */`
    <section class="timeline-wrapper">
      <h2 class="timeline-title">Teaching Experience</h2>
      <div class="timeline-description">
        <p>Below is a list of courses I've taught at the University of Oregon, from most recent to oldest:</p>
      </div>
      <div id="timeline" class="timeline">
        ${timelineData.map(({ term, role, course }) => `
          <div class="timeline-item">
            <h2>${term}</h2>
            <p><strong>${role}</strong> for <em>${course}</em></p>
          </div>
        `).join('')}
      </div>
    </section>
  `
}
