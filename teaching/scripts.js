document.addEventListener("DOMContentLoaded", () => {
    const timelineData = [
        { term: "Winter 2025", role: "Instructor", course: "Math 251: Calculus I" },
        { term: "Fall 2024", role: "Instructor", course: "Math 251: Calculus I" },
        { term: "Spring 2024", role: "Grader", course: "Math 458: Cryptography and Math 607: Applied Mathematics" },
        { term: "Fall 2023", role: "Instructor", course: "Math 246: Calculus for Biological Sciences" },
        { term: "Spring 2023", role: "Grader", course: "Math 343: Statistical Models and Math 425/525: Statistical Methods" },
        { term: "Winter 2023", role: "Instructor", course: "Math 111: Precalculus" },
        { term: "Fall 2022", role: "TA", course: "Math 241: Calculus for Business" },
        { term: "Summer 2022", role: "Instructor", course: "Math 107: Voting Theory" },
        { term: "Spring 2022", role: "Instructor", course: "Math 112: Trigonometry" },
        { term: "Winter 2022", role: "Instructor", course: "Math 112: Trigonometry" },
        { term: "Fall 2021", role: "TA", course: "Math 243: Statistics" },
        { term: "Summer 2021", role: "Instructor", course: "Math 107: Voting Theory" },
        { term: "Spring 2021", role: "Instructor", course: "Math 111: Precalculus" },
        { term: "Winter 2021", role: "TA", course: "Math 241: Calculus for Business" },
        { term: "Fall 2020", role: "TA", course: "Math 243: Statistics" },
        { term: "Summer 2020", role: "Instructor", course: "Math 101: Foundations of Math Modeling" },
        { term: "Spring 2020", role: "Instructor", course: "Math 111: Precalculus" },
        { term: "Winter 2020", role: "Instructor", course: "Math 111: Precalculus" },
        { term: "Fall 2019", role: "TA", course: "Math 111: Precalculus" },
    ];

    const timeline = document.getElementById("timeline");

    if (!timeline) {
        console.error("The #timeline element was not found in the DOM.");
        return;
    }

    timelineData.forEach((entry) => {
        const timelineItem = document.createElement("div");
        timelineItem.className = "timeline-item";

        const term = document.createElement("h2");
        term.innerHTML = entry.term;

        const details = document.createElement("p");
        details.innerHTML = `<strong>${entry.role}</strong> for <em>${entry.course}</em>`;

        timelineItem.appendChild(term);
        timelineItem.appendChild(details);
        timeline.appendChild(timelineItem);
    });
});
